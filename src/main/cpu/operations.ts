import {Memory}  from "../memory/memory";
import {Cpu} from "./cpu";

/**
 * Manages the set of operations
 */
export class Operations {

    private operations:Operation[];
    private cpu:Cpu;

    constructor(cpu:Cpu) {
        this.cpu = cpu;
        this.createMapping();
    }

    /**
     * Return the opcode.
     * @param opcode
     *      Opcode number
     * @returns Operation
     */
    public get(opcode:number):Operation {
        return this.operations[opcode];
    }

    /**
     * Create a list of opcodes with their respective addressing modes.
     */
    private createMapping():void {
        this.operations = [];

        //System Pointers
        let registers = this.cpu.registers;
        let memory = this.cpu.memory;

        /**
         * Modes
         */

        let immediate:Mode = new class {
            name:string = "Immediate";

            getValue(addr:number):number {
                return memory.readByte(addr + 1 & 0xFFFF);
            }
        };

        /**
         * Instructions for Gameboy (Not Gameboy Color)
         */

        this.operations[0x00] = {
            name: "NOP",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                //NOTHING
            }
        };

        //----------------------------------------
        // LD nn,n - Load (8 bits)
        // pg 65
        // ----------------------------------------

        this.operations[0x06] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = this.mode.getValue(pc)
                registers.setB(memory.readByte(addr));
            }
        };

        this.operations[0x0E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number)  {
                var addr = this.mode.getValue(pc)
                registers.setC(memory.readByte(addr));
            }
        };

        this.operations[0x16] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = this.mode.getValue(pc)
                registers.setD(memory.readByte(addr));
            }
        };

        this.operations[0x1E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = this.mode.getValue(pc)
                registers.setE(memory.readByte(addr));
            }
        };

        this.operations[0x26] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = this.mode.getValue(pc)
                registers.setH(memory.readByte(addr));
            }
        };

        this.operations[0x2E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = this.mode.getValue(pc)
                registers.setL(memory.readByte(addr));
            }
        };

        //----------------------------------------
        // LD r1, r2 - Put value r2 into r1
        // LD A, n - Load n into A
        // Pg 66 - 68
        //----------------------------------------


        this.operations[0x7F] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                //WHY!?!?! is this created!!!!!
            }
        };

        this.operations[0x78] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setA(registers.getB());
            }
        };

        this.operations[0x79] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setA(registers.getC());
            }
        };

        this.operations[0x7A] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setA(registers.getD());
            }
        };

        this.operations[0x7B] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setA(registers.getE());
            }
        };

        this.operations[0x7C] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setA(registers.getH());
            }
        };

        this.operations[0x7D] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setA(registers.getL());
            }
        };

        this.operations[0x0A] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = memory.readByte(registers.getBC());
                registers.setA(val);
            }
        };

        this.operations[0x1A] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = memory.readByte(registers.getDE());
                registers.setA(val);
            }
        };

        this.operations[0xFA] = {
            name: "LD",
            cycle: 16,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var high = memory.readByte(pc + 1 & 0xFFFF);
                var low = memory.readWord(pc);
                var val = high << 8 | low;
                registers.setA(val);
            }
        };

        //----------------------------------------
        // LD n, A - Load  value A into n
        // Pg 69
        //----------------------------------------


        this.operations[0x02] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = registers.getBC();
                var val = registers.getA();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x12] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = registers.getDE();
                var val = registers.getA();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x77] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 3,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = registers.getA();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0xEA] = {
            name: "LD",
            cycle: 16,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                //TODO this might be wrong (reverse?)
                var high = memory.readByte(pc + 1 & 0xFFFF);
                var low = memory.readByte(pc & 0xFFFF);
                var addr = high << 8 | low;
                var val = registers.getA();
                memory.writeByte(addr, val);
            }
        };

        //----------------------------------------
        // LD A, (C) - Put value at address 0xFF00 + C
        // into A
        // pg 70
        //----------------------------------------


        this.operations[0xF2] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var high = 0xff;
                var low = registers.getC();
                var addr = high << 8 | low;
                var val = memory.readByte(addr);
                registers.setA(val);
            }
        };

        //----------------------------------------
        // LD (C),A - Put value at address A to HL
        // Pg 70
        //----------------------------------------


        this.operations[0xE2] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var high = 0xff;
                var low = registers.getC();
                var addr = high << 8 | low;
                memory.writeByte(addr, registers.getA());
            }
        };


        //----------------------------------------
        // LD A, (HL) - Put value at address HL into A.
        // Decrement HL
        //----------------------------------------


        this.operations[0x3A] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = memory.readByte(addr);
                registers.setHL(addr - 1 & 0xFFFF);
            }
        };

        //----------------------------------------
        // LD A, (HL) - Put value at address HL into A
        // Pg 73
        //----------------------------------------


        this.operations[0x2A] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = memory.readByte(addr);
                registers.setHL(addr + 1 & 0xFFFF);
            }
        };


        //----------------------------------------
        // LD (HL), A - Put value at address A to HL
        // Pg 74
        //----------------------------------------


        this.operations[0x22] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var val = registers.getA();
                var addr = registers.getHL();
                memory.writeByte(addr, val);
                registers.setHL(addr + 1 & 0xFFFF);
            }
        };

        //----------------------------------------
        // LD (n), A - Put A  into address 0xFF00 + n
        // Pg 74
        //----------------------------------------

        this.operations[0xE0] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = 0xFF00 | pc;
                memory.writeByte(addr, registers.getA());
            }
        };

        //----------------------------------------
        // LDH A, (n) - Put memory address 0xFF00+n into A
        // Pg 74
        //----------------------------------------


        this.operations[0xF0] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = 0xFF00 | pc;
                var val = memory.readByte(addr);
                registers.setA(val & 0xFFFF);
            }
        };


        this.operations[0x3E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = memory.readByte(pc);
                registers.setAF(val);
            }
        };

        this.operations[0x7E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = memory.readByte(registers.getHL());
                registers.setA(val);
            }
        };

        this.operations[0x40] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {

            }
        };

        this.operations[0x41] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setB(registers.getC());
            }
        };

        this.operations[0x42] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setB(registers.getD());
            }
        };

        this.operations[0x43] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setB(registers.getE());
            }
        };

        this.operations[0x44] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setB(registers.getH());
            }
        };

        this.operations[0x45] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setB(registers.getL());
            }
        };

        this.operations[0x46] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = memory.readByte(registers.getHL());
                registers.setB(val);
            }
        };

        this.operations[0x48] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setC(registers.getB());
            }
        };

        this.operations[0x49] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
            }
        };

        this.operations[0x4A] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setC(registers.getD());
            }
        };

        this.operations[0x4B] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setC(registers.getE());
            }
        };

        this.operations[0x4C] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setC(registers.getH());
            }
        };

        this.operations[0x4D] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setC(registers.getL());
            }
        };

        this.operations[0x4E] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = memory.readByte(registers.getHL());
                registers.setC(val);
            }
        };

        this.operations[0x50] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setD(registers.getB());
            }
        };

        this.operations[0x50] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setD(registers.getB());
            }
        };

        this.operations[0x51] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setD(registers.getC());
            }
        };

        this.operations[0x52] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
            }
        };

        this.operations[0x53] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setD(registers.getE());
            }
        };

        this.operations[0x54] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setD(registers.getH());
            }
        };

        this.operations[0x55] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setD(registers.getL());
            }
        };

        this.operations[0x56] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = memory.readByte(registers.getHL());
                registers.setD(val);
            }
        };

        this.operations[0x58] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setE(registers.getB());
            }
        };

        this.operations[0x59] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setE(registers.getC());
            }
        };

        this.operations[0x5A] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setE(registers.getD());
            }
        };

        this.operations[0x5B] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
            }
        };

        this.operations[0x5C] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setE(registers.getH());
            }
        };

        this.operations[0x5D] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setE(registers.getL());
            }
        };

        this.operations[0x5E] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = memory.readByte(registers.getHL());
                registers.setE(val);
            }
        };

        this.operations[0x60] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setH(registers.getB());
            }
        };

        this.operations[0x61] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setH(registers.getC());
            }
        };

        this.operations[0x62] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setH(registers.getD());
            }
        };

        this.operations[0x63] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setH(registers.getE());
            }
        };

        this.operations[0x64] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
            }
        };

        this.operations[0x65] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setH(registers.getL());
            }
        };

        this.operations[0x66] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = memory.readByte(registers.getH());
                registers.setH(val);
            }
        };

        this.operations[0x68] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setL(registers.getB());
            }
        };

        this.operations[0x69] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setL(registers.getC());
            }
        };

        this.operations[0x6A] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setL(registers.getD());
            }
        };

        this.operations[0x6B] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setL(registers.getE());
            }
        };

        this.operations[0x6C] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setL(registers.getH());
            }
        };

        this.operations[0x6D] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
            }
        };

        this.operations[0x6E] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = memory.readByte(registers.getHL());
                registers.setL(val);
            }
        };

        this.operations[0x70] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = registers.getB();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x71] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = registers.getC();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x72] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = registers.getD();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x73] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = registers.getE();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x74] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = registers.getH();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x75] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = registers.getL();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x36] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = this.mode.getValue(pc);
                var val = memory.readByte(addr);
                memory.writeByte(registers.getHL(), val);
            }
        };


        //----------------------------------------
        // LD - Load (16 bits) page 76
        //----------------------------------------
        //----------------------------------------
        // LD n, nn - Put value nn into n
        // page 76
        //----------------------------------------


        this.operations[0x01] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc:number) {
                var addr = this.mode.getValue(pc);
                var val = memory.readByte(addr);
                memory.writeByte(registers.getBC(), val);
            }
        };

        this.operations[0x11] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc:number) {
                var addr = this.mode.getValue(pc);
                var val = memory.readByte(addr);
                memory.writeByte(registers.getDE(), val);
            }
        };

        this.operations[0x21] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc:number) {
                var addr = this.mode.getValue(pc);
                var val = memory.readByte(addr);
                memory.writeByte(registers.getHL(), val);
            }
        };


        this.operations[0x31] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc:number) {
                var addr = this.mode.getValue(pc);
                var val = memory.readByte(addr);
                memory.writeByte(registers.getSP(), val);
            }
        };

        //----------------------------------------
        // LD SP, HL - Put value HL into SP
        // page 76
        //----------------------------------------


        this.operations[0xF9] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = memory.readByte(addr);
                memory.writeByte(registers.getSP(), val);
            }
        };

        //----------------------------------------
        // LDHL SP, n - Put SP + n effective address into HL
        // page 77
        //----------------------------------------


        this.operations[0xF8] = {
            name: "LDHL",
            cycle: 12,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = this.mode.getValue(pc);
                var val = memory.readByte(addr) + registers.getSP();
                var orig = registers.getHL();

                var result = (val + orig) & 0xFFFF;

                //Set flags
                registers.setZeroFlag(0);
                registers.setSubtractFlag(0);

                if((result & 0xFFF) >= 16){
                    registers.setHalfFlag(1);
                }

                if(result >= 32){
                    registers.setCarryFlag(1);
                    result = 0
                }

                memory.writeByte(result, val);
            }
        };



    }


}

export interface Mode {
    name : string;
    getValue(addr:number): number;
}

export interface Operation {
    name: string;
    cycle: number;
    mode: Mode;
    size: number;
    execute(pc:number);
}
