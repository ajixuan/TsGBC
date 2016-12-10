import {Memory}  from "./memory";
import {Cpu} from "./cpu";

/**
 * Manages the set of operations
 */
export class Operations {

    private operations : Operation[];
    private cpu : Cpu;

    constructor(cpu : Cpu) {
        this.cpu = cpu;
        this.createMapping();
    }

    /**
     * Return the opcode.
     * @param opcode
     *      Opcode number
     * @returns Operation
     */
    public get(opcode : number) : Operation {
        return this.operations[opcode];
    }

    /**
     * Create a list of opcodes with their respective addressing modes.
     */
    private createMapping(): void {
        this.operations =  [];

        //System Pointers
        let registers = this.cpu.registers;
        let memory = this.cpu.memory;

        /**
         * Modes
         */

        let immediate: Mode = new class {
            name : string = "Immediate";
            getValue(addr: number) : number {
                return memory.readByte(addr);
            }
        };

        /**
         * Instructions
         */

        //----------------------------------------
        // LD nn,n - Load (8 bits)
        //----------------------------------------

        this.operations[0x06] = {
            name :"LD",
            cycle : 8,
            mode : immediate,
            size : 2,
            execute(pc: number) {
                var addr = this.mode.getValue(pc)
                registers.setB(memory.readByte(addr));
            }
        };

        this.operations[0x0E] = {
            name :"LD",
            cycle : 8,
            mode : immediate,
            size : 2,
            execute(pc: number) : number {
                var addr = this.mode.getValue(pc)
                registers.setC(memory.readByte(addr));
            }
        };

        this.operations[0x16] = {
            name :"LD",
            cycle : 8,
            mode : immediate,
            size : 2,
            execute(pc: number) {
                var addr = this.mode.getValue(pc)
                registers.setD(memory.readByte(addr));
            }
        };

        this.operations[0x1E] = {
            name :"LD",
            cycle : 8,
            mode : immediate,
            size : 2,
            execute(pc: number) {
                var addr = this.mode.getValue(pc)
                registers.setE(memory.readByte(addr));
            }
        };

        this.operations[0x26] = {
            name :"LD",
            cycle : 8,
            mode : immediate,
            size : 2,
            execute(pc: number) {
                var addr = this.mode.getValue(pc)
                registers.setH(memory.readByte(addr));
            }
        };

        this.operations[0x2E] = {
            name :"LD",
            cycle : 8,
            mode : immediate,
            size : 2,
            execute(pc: number) {
                var addr = this.mode.getValue(pc)
                registers.setL(memory.readByte(addr));
            }
        };

        //----------------------------------------
        // LD nn,n - Load (8 bits)
        //----------------------------------------

        this.operations[0x7F] = {
            name :"LD",
            cycle : 4,
            mode : immediate,
            size : 2,
            execute(pc: number) {
                registers.setA(registers.getA());
            }
        };



        //----------------------------------------
        // LD - Load (16 bits)
        //----------------------------------------

    }

}

interface Mode {
    name : string;
    getValue(addr: number): number;
}

interface Operation {
    name: string;
    cycle: number;
    mode: Mode;
    size: number;
    execute(pc: number);
}
