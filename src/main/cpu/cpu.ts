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

    public last: { operation: Operation, opcode: number, opaddr: number };
    public clock: {
        m: number, //4,194,304Hz one cycle
        t: number   //1,048,576Hz
    };

    constructor(memory: Memory) {
        this.registers = new Registers();
        this.memory = memory;
        this.interrupts = memory.interrupts;
        this.stack = new Stack(memory, this.registers);
        this.operations = new Operations(this);
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

        this.memory.writeByte(0xFF10, 0x80); //NR10
        this.memory.writeByte(0xFF11, 0xBF); //NR11
        this.memory.writeByte(0xFF12, 0xF3); //NR12
        this.memory.writeByte(0xFF14, 0xBF); //NR14
        this.memory.writeByte(0xFF16, 0x3F); //NR21
        this.memory.writeByte(0xFF17, 0x00); //NR22
        this.memory.writeByte(0xFF19, 0xBF); //NR24
        this.memory.writeByte(0xFF1A, 0x7F); //NR30
        this.memory.writeByte(0xFF1B, 0xFF); //NR31
        this.memory.writeByte(0xFF1C, 0x9F); //NR32
        this.memory.writeByte(0xFF1E, 0xBF); //NR33
        this.memory.writeByte(0xFF20, 0xFF); //NR41
        this.memory.writeByte(0xFF23, 0xBF); //NR30
        this.memory.writeByte(0xFF24, 0x77); //NR50
        this.memory.writeByte(0xFF25, 0xF3); //NR51
        this.memory.writeByte(0xFF26, 0xF1); //NR52

        this.clock = {m: 0, t: 0};

        this.last = {
            operation: this.operations.get(0x00),
            opcode: 0x00,
            opaddr: 0x0000
        };
    }

    /**
     * Handler for the CPU interrupts.
     */
    private handledInterrupts(interrupt: Interrupt): void {

        if (interrupt == null) {
            this.interrupts.enableAllInterrupts();
            return;
        }

        this.halt = false;
        this.interrupts.disableAllInterrupts();
        this.interrupts.clearInterruptFlag(interrupt);

        //Clear stat interrupts flags
        this.memory.ppu.registers.stat.clear();

        //Push all registers on to the stack
        /* Just push pc onto stack
         this.stack.pushWord(this.registers.getHL());
         this.stack.pushWord(this.registers.getAF());
         this.stack.pushWord(this.registers.getBC());
         this.stack.pushWord(this.registers.getDE());

         this.stack.pushWord(this.registers.getSP());
         */
        this.stack.pushWord(this.registers.getPC());
        this.registers.setPC(interrupt.address);
    }

    /**
     * Performs a single CPU cycle.
     */
    public tick(): number {
        let cycles = 0;

        //Check ime  here
        let hardwareInterrupt;
        if(this.interrupts.ime){hardwareInterrupt = true}


        let pc = this.registers.getPC();

        //Get opcode
        let opcode = this.memory.readByte(pc++);

        if (this.halt) {
            opcode = 0x00; //NOP
        }

        if (opcode == 0xCB) {
            opcode = (opcode << 8) | this.memory.readByte(pc++);
        }
        //Get Operation
        let operation = this.operations.get(opcode);

        if (operation == null) {
            this.last = null;
            Debugger.display();
            throw "Unknown opcode execution 0x" + opcode.toString(16).toUpperCase();
        }

        //Execute Operation
        let oldPC = this.registers.getPC();
        let opaddr = operation.mode.getValue(pc, operation.size - 1);

        operation.execute(opaddr);

        //If pc did not change during op execution, increment pc
        if (oldPC === this.registers.getPC()) {
            this.registers.setPC(this.registers.getPC() + operation.size & 0xFFFF);
        }

        //Debug Information
        this.last = {
            operation: operation,
            opcode: opcode,
            opaddr: opaddr
        };

        //Update Infromation
        cycles = operation.cycle;

        //Service interrupt only if IME is set prior to execution
        if (this.interrupts.hasInterrupts() && hardwareInterrupt) {
            this.handledInterrupts(this.interrupts.getInterrupt());
            cycles += 12;
        }

        this.clock.t += cycles;
        this.clock.m = this.clock.t / 4;

        Debugger.pushLog();
        Debugger.display();

        return cycles;
    }

}