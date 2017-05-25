import {Registers} from "./registers";
import {Operations, Operation} from "./operations";
import {Memory} from "../memory/memory";
import {Stack} from "../memory/stack";
import {Debugger} from "../debugger";
import {Interrupts, Interrupt} from "../io/interrupts";

export class Cpu {

    public registers: Registers;
    public memory: Memory;
    public operations: Operations;
    public stack: Stack;
    public interrupts: Interrupts;
    public halt: boolean;

    public last: {operation: Operation, opcode: number, opaddr: number};
    public clock : {
        m : number, //4,194,304Hz one cycle
        t : number   //1,048,576Hz
    };

    constructor(memory: Memory) {
        this.registers = new Registers();
        this.memory = memory;
        this.stack = new Stack(this.memory, this.registers);
        this.operations = new Operations(this);
        this.interrupts = this.memory.interrupt;
    }

    /**
     * Reset the CPU.
     */
    public reset(): void {
        this.registers.setAF(0x01B0);
        this.registers.setBC(0x0013);
        this.registers.setDE(0x00D8);
        this.registers.setHL(0x014D);

        this.registers.setSP(0xFFFE);
        this.registers.setPC(0x100);

        this.clock = { m : 0, t : 0 };

        this.last = {
            operation: this.operations.get(0x00),
            opcode: 0x00,
            opaddr: 0x0000
        };
    }

    /**
     * Handler for the CPU interrupts.
     */
    private handledInterrupts(): void {
        if (!this.interrupts.hasInterrupts()) {
            return;
        }

        var interrupt: Interrupt = this.interrupts.getInterrupt();

        if (interrupt == null) {
            this.interrupts.enableAllInterrupts();
            return;
        }

        this.halt = false;
        this.interrupts.disableAllInterrupts();

        //Push all registers on to the stack
        this.stack.pushWord(this.registers.getHL());
        this.stack.pushWord(this.registers.getAF());
        this.stack.pushWord(this.registers.getBC());
        this.stack.pushWord(this.registers.getDE());

        this.stack.pushWord(this.registers.getSP());
        this.stack.pushWord(this.registers.getPC());

        this.registers.setPC(interrupt.address);
    }

    /**
     * Performs a single CPU cycle.
     */
    public tick(): number {

        this.handledInterrupts();

        let pc = this.registers.getPC();

        //Get opcode
        let opcode = this.memory.readByte(pc++);

        if (this.halt) {
            opcode = 0x00; //NOP

        }

        //Get Operation
        let operation = this.operations.get(opcode);

        if (operation == null) {
            this.last = null;
            Debugger.display();
            throw "Unknown opcode execution 0x" + opcode.toString(16).toUpperCase();
        }

        //Update Infromation
        let oldPC = this.registers.getPC();
        this.clock.t += operation.cycle;
        this.clock.m = this.clock.t /4;

        //Execute Operation
        let opaddr = operation.mode.getValue(pc, operation.size - 1);
        operation.execute(opaddr);

        //If pc did not change during op execution, increment pc
        if(oldPC === this.registers.getPC()){
            this.registers.setPC(this.registers.getPC() + operation.size & 0xFFFF);
        }


        //Debug Information
        this.last = {
            operation: operation,
            opcode: opcode,
            opaddr: opaddr
        };

        Debugger.display();

        return operation.cycle;
    }

}