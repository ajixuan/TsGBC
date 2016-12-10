import {Memory}  from "./memory";
import {Cpu} from "./cpu";

/**
 * Manages the set of operations
 */
export class Operations {

    private mapping: Operation[];
    public modes: Object;
    public cpu : Cpu;

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
        return this.mapping[opcode];
    }

    /**
     * Create a list of opcodes with their respective addressing modes.
     */
    private createMapping(): void {
        let registers = this.cpu.registers;
        let memory = this.cpu.memory;

        let modes =  {
            absolute : new Absolute()
        }


        //Define Operations
        this.mapping =  [];

        /**
         * Instructions
         */


        //----------------------------------------
        // LD - Load (8 bits)
        //----------------------------------------

        this.mapping[0x0E] = {
            name :"LD",
            id : 0x0E,
            cycle : 8,
            mode : modes.absolute,
            execute(addr: number) : number {
                console.log(registers.getA());
                return 0;
            }
        };

        this.mapping[0x01] =  {
            name : "LD",
            id : 0x01,
            cycle : 8,
            mode : modes.absolute,
            execute(addr: number) : number {
                return 0;
            }
        }

    }

}

/**
 * Addressing Modes
 */

interface Mode {
    name : string;
    id : number;
    getValue(address: number): number;
}

class Absolute implements Mode {
    name : string = "Absolute";
    id : number = 1;

    getValue(address: number) : number {
        //TODO
        return 0;
    }
}

class Relative implements Mode {
    name : string = "Absolute";
    id : number = 1;

    getValue(address: number) : number {
        //TODO
        return 0;
    }
}



interface Operation {
    name: string;
    id: number;
    cycle: number;
    mode: Mode;
    execute(addr: number) : number;
}
