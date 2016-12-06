import {Memory}  from "./memory";
import {Cpu} from "./cpu";

/**
 * Manages the set of operations
 */
export class Operations {

    private mapping: Operation[];
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
        //Define Modes
        var absolute : Mode = new Absolute();
        var relative : Mode = new Absolute();

        //Define Operations
        this.mapping =  [
            new Add(this.cpu, 1, 2, absolute, 2),
            new Sub(this.cpu, 1, 2, relative, 2)
        ];
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

class Operation {

    name: string;
    id: number;
    cycle: number;
    mode: Mode;
    size: number;

    //System Links
    cpu: Cpu;

    constructor(cpu: Cpu, id: number, cycle: number, mode: Mode, size : number) {
        this.cpu = cpu;
        this.id = id;
        this.cycle = cycle;
        this.mode = mode;
        this.size = size;
    }

    execute(pc: number) {};
}

class Add extends Operation {

    name: string = "Add";

    execute(pc: number) {
        //TODO
        this.mode.getValue(pc);
        this.cpu.registers.getA();
        this.cpu.memory.readByte(0x8721);
    };

}

class Sub extends Operation {

    name: string = "Sub";

    execute(pc: number) {
        //TODO

    };
}