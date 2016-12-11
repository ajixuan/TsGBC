import {Registers} from "./registers";
import {Operations} from "./operations";
import {Memory} from "../memory/memory";
import {Stack} from "../memory/stack";
export class Cpu {

    public registers : Registers;
    public memory : Memory;
    public operations : Operations;
    public stack : Stack;

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
        //TODO
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
    public tick(): void {
        //TODO

        var opaddr =  this.registers.getPC();
        var opcode = this.memory.readByte(opaddr);
        var operation = this.operations.get(opcode);

        operation.execute(opaddr);
    }

    /**
     * Performs multiple CPU cycles
     * @param num
     *      number of CPU cycles to perform.
     */
    public tickFor(num : number) : void {
        //TODO
    }
}