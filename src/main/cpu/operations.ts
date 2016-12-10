import {Memory}  from "./memory";
import {Cpu} from "./cpu";

/**
 * Manages the set of operations
 */
export class Operations {

    private operations : Operation[];
    public modes: Object;
    public cpu : Cpu;

    constructor(cpu : Cpu) {
        this.cpu = cpu;
        this.createModes();
        this.createOperations();
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


    private createModes() {

    }

    /**
     * Create a list of opcodes with their respective addressing modes.
     */
    private createOperations(): void {
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
        // LD - Load (8 bits)
        //----------------------------------------

        this.operations[0x0E] = {
            name :"LD",
            id : 0x0E,
            cycle : 8,
            mode : immediate,
            execute(addr: number) : number {
                registers.setB(memory.readByte(addr));
                return this.cycle;
            }
        };

        this.operations[0x01] =  {
            name : "LD",
            id : 0x01,
            cycle : 8,
            mode : immediate,
            execute(addr: number) : number {
                return 0;
            }
        }

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
    id: number;
    cycle: number;
    mode: Mode;
    execute(addr: number) : number;
}
