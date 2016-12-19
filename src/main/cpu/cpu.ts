import {Registers} from "./registers";
import {Operations, Operation} from "./operations";
import {Memory} from "../memory/memory";
import {Stack} from "../memory/stack";
import {Debugger} from "../debugger";

export class Cpu {

    public registers : Registers;
    public memory : Memory;
    public operations : Operations;
    public stack : Stack;

    public cycles : number
    public lastOperation : any;

    constructor(memory : Memory) {
        this.registers = new Registers();
        this.memory = memory;
        this.stack = new Stack(this.memory, this.registers);
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

        this.cycles = 0;

        this.lastOperation = this.operations.get(0x00);
        this.lastOperation.id = 0x00;
        this.lastOperation.opaddr = 0x0000;
    }

    /**
     * Handler for the CPU interrupts.
     */
    private handleInterrupts() : void {
        //TODO
    }

    /**
     * Performs a single CPU cycle.
     */
    public tick(): number {

        //TODO Interrupt

        var cycles = 0;
        var pc =  this.registers.getPC();

        var opcode = this.memory.readByte(pc);
        var operation = this.operations.get(opcode);
        if (operation == null) {
            throw "Unknown opcode execution 0x" + opcode.toString(16).toUpperCase();
        }
        var opaddr = operation.mode.getValue(pc);
        operation.execute(opaddr);

        this.registers.setPC(pc + operation.size & 0xFFFF);
        cycles += operation.cycle;
        this.cycles += cycles;

        //Debug Information
        this.lastOperation = operation;
        this.lastOperation.id = opcode;
        this.lastOperation.opaddr = opaddr;
        Debugger.display();

        return cycles;
    }

}