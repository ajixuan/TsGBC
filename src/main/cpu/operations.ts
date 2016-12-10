import {Memory}  from "./memory";
import {Cpu} from "./cpu";

/**
 * Manages the set of operations
 */
export class Operations {

    private mapping: Operation[];
    public modes: Object;
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
        return this.mapping[opcode];
    }

    /**
     * Create a list of opcodes with their respective addressing modes.
     */
    private createMapping(): void {
        let cpu = this.cpu;

        //Define Operations
        this.mapping =  [];

        //LD b, n
        this.mapping[0x0E] = new class {
            name = "LD";
            id = 0x0E;
            cycle = 8;
            mode = new Absolute();
            execute(pc: number): number {
                console.log(cpu.registers.getA());
                return 0;
            };
        };


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


/**
 * Instructions
 */

interface Operation {
    name: string;
    id: number;
    cycle: number;
    mode: Mode;
    execute(pc: number) : number;
}
