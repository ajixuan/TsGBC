import {Registers} from "./registers";
import {Operations} from "./operations";
import {MMU} from "../memory/mmu";
export class Cpu {

    public registers : Registers = new Registers();
    public opcodes : Operations = new Operations();
    public mmu : MMU = new MMU();

    constructor() {
        //TODO
    }

    /**
     * Reset the CPU.
     */
    public reset(): void {
        //TODO
    }

    /**
     * Load a game ROM.
     * @param rom
     *      String representation of the ROM.
     */
    public load(rom : String): void {
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

        // this.mmu.cpu
        // this.registers
        // this.opcodes
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