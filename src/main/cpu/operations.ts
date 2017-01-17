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
     * Helper function for setting carry flags depending on number of bits
     * @param first
     * @param second
     * @param short whether or not the operation is between 8bit or 16bit
     */
    private calcAddFlags(first:number, second:number, short:boolean):number {
        //Default short is true (8bit operation by default)
        var mask = 0xF;
        var low = 4;
        var high = 8;

        //If short is false (if it is 16bit operation)
        if(short === false){
            mask = 0xFFF;
            low = 12;
            high = 16;
        }

        var half =(first & mask) + (second & mask);
        var full = first + second;

        if(half >> low == 1){
            console.log("set half carry:");
            console.log(half);
            this.cpu.registers.setHalfFlag(1);
        }

        if(full >> high == 1){
            console.log("set full carry");
            console.log(full);
            this.cpu.registers.setCarryFlag(1);
        }

        //Set 0 flag
        if(full == 0){
            this.cpu.registers.setZeroFlag(1);
        }

        return full & 0xFFFF;
    }


    /**
     * Helper function for setting carry flags depending on number of bits
     * @param first
     * @param second
     * @param short whether or not the operation is between 8bit or 16bit
     */
    private calcSubtractFlags(first:number, second:number, short:boolean = true):number {
        //Default short is true (8bit operation by default)
        // The half flag (low) is set if there is a borrow on bit 4
        var mask = 0xF;

        //If short is false (if it is 16bit operation)
        // The half flag (low) is set if there is a borrow at bit 12
        if(short === false){
            mask = 0xFFF;
        }

        var half =(first & mask) - (second & mask);
        var full = first - second;

        if(half < 0){
            console.log("set half carry:");
            console.log(half);
            this.cpu.registers.setHalfFlag(1);
        }

        if(full < 0){
            console.log("set full carry");
            console.log(full);
            this.cpu.registers.setCarryFlag(1);
        }

        //Set 0 flag
        if(full == 0){
            this.cpu.registers.setZeroFlag(1);
        }

        return full & 0xFFFF;
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
        // LD r1, r2
        // Pg 66
        //----------------------------------------

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


        //----------------------------------------
        // LD n, A - Load  value A into n
        // Pg 69
        //----------------------------------------

        this.operations[0x47] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setB(registers.getA());
            }
        };

        this.operations[0x4F] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setC(registers.getA());
            }
        };

        this.operations[0x57] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setD(registers.getA());
            }
        };

        this.operations[0x5F] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setE(registers.getA());
            }
        };


        this.operations[0x67] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setH(registers.getA());
            }
        };

        this.operations[0x6F] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                registers.setL(registers.getA());
            }
        };



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
        // Pg 71
        //----------------------------------------


        this.operations[0x3A] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = memory.readByte(addr);
                registers.setA(val);
                registers.setHL(addr - 1 & 0xFFFF);
            }
        };

        //----------------------------------------
        // LD (HLD), A - Put A int memory address HL.
        // Decrement HL
        // Pg 72
        //----------------------------------------

        this.operations[0x32] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getHL();
                var val = registers.getA();
                memory.writeByte(addr, val);
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
                registers.setA(val);
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
                var addr = registers.getHL();
                memory.writeByte(addr, registers.getA());
                registers.setHL(addr + 1 & 0xFFFF);
            }
        };

        //----------------------------------------
        // LD (n), A - Put A  into address 0xFF00 + n
        // Pg 75
        //----------------------------------------

        this.operations[0xE0] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                //Immediate value means immediate value of pc??
                var addr = 0xFF00 | this.mode.getValue(pc);
                memory.writeByte(addr, registers.getA());
            }
        };

        //----------------------------------------
        // LDH A, (n) - Put memory address 0xFF00+n into A
        // Pg 75
        //----------------------------------------


        this.operations[0xF0] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 2,
            execute(pc:number) {
                var addr = 0xFF00 | this.mode.getValue(pc);
                var val = memory.readByte(addr);
                registers.setA(val & 0xFFFF);
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

                //Set flags
                registers.setZeroFlag(0);
                registers.setSubtractFlag(0);
                var result = this.calcAddFlags(val, orig, false);
                memory.writeByte(result, val);
            }
        };

        //----------------------------------------
        // LD (nn), SP - Put SP at address (nn)
        // page 78
        //----------------------------------------

        this.operations[0x08] = {
            name: "LD",
            cycle: 20,
            mode: immediate,
            size: 3,
            execute(pc:number) {
                var addr = this.mode.getValue(pc) + 1;
                memory.writeByte(addr, registers.getSP());
            }
        };

        //----------------------------------------
        // PUSH nn - push register pair nn onto stack
        //      Decrement stack pointer twice
        // page 78
        //----------------------------------------

        this.operations[0xF5] = {
            name: "PUSH",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                this.cpu.stack.pushWord(registers.getAF());
            }
        };

        this.operations[0xC5] = {
            name: "PUSH",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                this.cpu.stack.pushWord(registers.getBC());
            }
        };

        this.operations[0xD5] = {
            name: "PUSH",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                this.cpu.stack.pushWord(registers.getDE());
            }
        };

        this.operations[0xE5] = {
            name: "PUSH",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                this.cpu.stack.pushWord(registers.getHL());
            }
        };


        //----------------------------------------
        // POP nn - pop two bytes off stack
        //      Increment stack pointer twice
        // page 79
        //----------------------------------------

        this.operations[0xF1] = {
            name: "POP",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                this.cpu.stack.popWord(registers.getAF());
            }
        };

        this.operations[0xC1] = {
            name: "POP",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                this.cpu.stack.popWord(registers.getBC());
            }
        };

        this.operations[0xD1] = {
            name: "POP",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                this.cpu.stack.popWord(registers.getDE());
            }
        };

        this.operations[0xE1] = {
            name: "POP",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                this.cpu.stack.popWord(registers.getHL());
            }
        };

        /************************
         * 8-Bit ALU
         ************************/

            //----------------------------------------
            // ADD A, n - Add n to A
            // page 80
            //----------------------------------------

        this.operations[0x87] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getA();
                var val = memory.readByte(addr);
                var result = this.calcAddFlags(val, val, false);
                registers.setSubtractFlag(0);
                memory.writeByte(registers.getA(), result);
            }
        };

        this.operations[0x80] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getA();
                var val = memory.readByte(addr);
                addr = registers.getB();
                var oper = memory.readByte(addr);
                var result = this.calcAddFlags(val, oper, false);

                registers.setSubtractFlag(0);
                memory.writeByte(registers.getA(), result);
            }
        };

        this.operations[0x81] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getA();
                var val = memory.readByte(addr);
                addr = registers.getC();
                var oper = memory.readByte(addr);
                var result = this.calcAddFlags(val, oper, false);

                registers.setSubtractFlag(0);
                memory.writeByte(registers.getA(), result);
            }
        };


        this.operations[0x82] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getA();
                var val = memory.readByte(addr);
                addr = registers.getD();
                var oper = memory.readByte(addr);

                var result = this.calcAddFlags(val, oper, false);
                registers.setSubtractFlag(0);
                memory.writeByte(registers.getA(), result);
            }
        };


        this.operations[0x83] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getA();
                var val = memory.readByte(addr);
                addr = registers.getE();
                var oper = memory.readByte(addr);
                var result = this.calcAddFlags(val, oper, false);

                registers.setSubtractFlag(0);
                memory.writeByte(registers.getA(), result);
            }
        };

        this.operations[0x84] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getA();
                var val = memory.readByte(addr);
                addr = registers.getH();
                var oper = memory.readByte(addr);
                var result = this.calcAddFlags(val, oper, false);

                registers.setSubtractFlag(0);
                memory.writeByte(registers.getA(), result);
            }
        };


        this.operations[0x85] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getA();
                var val = memory.readByte(addr);
                addr = registers.getL();
                var oper = memory.readByte(addr);
                var result = this.calcAddFlags(val, oper, false);

                registers.setSubtractFlag(0);
                memory.writeByte(registers.getA(), result);
            }
        };


        this.operations[0x86] = {
            name: "ADD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var addr = registers.getA();
                var val = memory.readByte(addr);
                addr = registers.getHL();
                var oper = memory.readByte(addr);
                var result = this.calcAddFlags(val, oper, false);

                registers.setSubtractFlag(0);
                memory.writeByte(registers.getA(), result);
            }
        };


        this.operations[0xC6] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = memory.readByte(registers.getA());
                var oper = memory.readByte(registers.getB());
                var result = this.calcAddFlags(val, oper, false);

                registers.setSubtractFlag(0);
                memory.writeByte(registers.getA(), result);
            }
        };

        //----------------------------------------
        // ADC A, n - Add n + Carry flag to A
        // page 81
        //----------------------------------------

        this.operations[0x8F] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = registers.getA();
                var result = this.calcAddFlags(val, val + registers.getCarryFlag(), false);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };

        this.operations[0x88] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getB();
                var result = this.calcAddFlags(val, oper + registers.getCarryFlag(), false);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };

        this.operations[0x89] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getC();
                var result = this.calcAddFlags(val, oper + registers.getCarryFlag(), false);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };

        this.operations[0x8A] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getD();
                var result = this.calcAddFlags(val, oper + registers.getCarryFlag(), false);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };


        this.operations[0x8B] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getE();
                var result = this.calcAddFlags(val, oper + registers.getCarryFlag(), false);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };

        this.operations[0x8C] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getH();
                var result = this.calcAddFlags(val, oper + registers.getCarryFlag(), false);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };



        this.operations[0x8D] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getL();
                var result = this.calcAddFlags(val, oper + registers.getCarryFlag(), false);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };


        this.operations[0x8E] = {
            name: "ADC",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = registers.getA();
                var oper = memory.readWord(registers.getHL());
                var result = this.calcAddFlags(val, oper+ registers.getCarryFlag(), false);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };


        //TODO: I htink this is immediate value???
        this.operations[0xCE] = {
            name: "ADC",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc:number) {
                var val = registers.getA();
                var oper = this.mode.getValue(pc)
                var result = this.calcAddFlags(val, oper+ registers.getCarryFlag(), false);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };

        //----------------------------------------
        // SUB n - Subtract n from A
        // page 82
        //----------------------------------------

        this.operations[0x97] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var result =this.calcSubtractFlags(val, val, false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x90] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getB();
                var result = this.calcSubtractFlags(val, oper, false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x91] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getC();
                var result = this.calcSubtractFlags(val, oper, false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };


        this.operations[0x92] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getD();
                var result = this.calcSubtractFlags(val, oper, false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x93] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getE();
                var result = this.calcSubtractFlags(val, oper, false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x94] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getH();
                var result = this.calcSubtractFlags(val, oper, false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x95] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getL();
                var result = this.calcSubtractFlags(val, oper, false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x96] = {
            name: "SUB",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = memory.readWord(registers.getHL());
                var result = this.calcSubtractFlags(val, oper, false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };


        //TODO: Not sure if # means immediate value
        this.operations[0xD6] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = this.mode.getValue(pc)
                var result = this.calcSubtractFlags(val, oper, false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        //----------------------------------------
        // SBC n - Subtract n + Carryflag from A
        // page 83
        //----------------------------------------

        this.operations[0x9F] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var result =this.calcSubtractFlags(val, val- registers.getCarryFlag(), false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x98] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getB();
                var result =this.calcSubtractFlags(val, oper- registers.getCarryFlag(), false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x99] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getC();
                var result =this.calcSubtractFlags(val, oper- registers.getCarryFlag(), false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };


        this.operations[0x9A] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getD();
                var result = this.calcSubtractFlags(val, oper- registers.getCarryFlag(), false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x9B] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getE();
                var result = this.calcSubtractFlags(val, oper- registers.getCarryFlag(), false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x9C] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getH();
                var result =this.calcSubtractFlags(val, oper- registers.getCarryFlag(), false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x9D] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getL();
                var result =this.calcSubtractFlags(val, oper, false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x96] = {
            name: "SUB",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = memory.readWord(registers.getHL());
                var result = this.calcSubtractFlags(val, oper- registers.getCarryFlag(), false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };


        //TODO: Not sure if # means immediate value
        this.operations[0xD6] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = this.mode.getValue(pc)
                var result =this.calcSubtractFlags(val, oper, false);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        //----------------------------------------
        // AND n - Logically AND n with A, result in A
        // page 84
        //----------------------------------------


        this.operations[0xA7] = {
            name: "AND",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var result = val & val;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xA0] = {
            name: "AND",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getB();
                var result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xA1] = {
            name: "AND",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getC();
                var result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };


        this.operations[0xA2] = {
            name: "AND",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getD();
                var result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xA3] = {
            name: "AND",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getE();
                var result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };

        this.operations[0xA4] = {
            name: "AND",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getH();
                var result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };

        this.operations[0xA5] = {
            name: "AND",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getL();
                var result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xA6] = {
            name: "AND",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = memory.readWord(registers.getHL());
                var result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };


        //TODO: Not sure if # means immediate value
        this.operations[0xE6] = {
            name: "AND",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = this.mode.getValue(pc)
                var result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };


        //----------------------------------------
        // OR n - Logically OR n with A, result in A
        // page 85
        //----------------------------------------

        this.operations[0xB7] = {
            name: "OR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var result = val | val;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xB0] = {
            name: "OR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getB();
                var result = val | oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xB1] = {
            name: "OR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getC();
                var result = val | oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };


        this.operations[0xB2] = {
            name: "OR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getD();
                var result = val | oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xB3] = {
            name: "OR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getE();
                var result = val | oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };

        this.operations[0xB4] = {
            name: "OR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getH();
                var result = val | oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };

        this.operations[0xB5] = {
            name: "OR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getL();
                var result = val | oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xB6] = {
            name: "OR",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = memory.readWord(registers.getHL());
                var result = val | oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };


        //TODO: Not sure if # means immediate value
        this.operations[0xF6] = {
            name: "OR",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = this.mode.getValue(pc)
                var result = val | oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };


        //----------------------------------------
        // XOR n - Logically exclusive OR n with A, result in A
        // page 86
        //----------------------------------------

        /*
        * who dafaq xors themselves
        * */
        this.operations[0xAF] = {
            name: "XOR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                registers.setF(0);
                registers.setZeroFlag(1);
                registers.setA(0);
            }
        };

        this.operations[0xA8] = {
            name: "XOR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getB();
                var result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xA9] = {
            name: "XOR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getC();
                var result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };


        this.operations[0xAA] = {
            name: "XOR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getD();
                var result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xAB] = {
            name: "XOR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getE();
                var result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };

        this.operations[0xAC] = {
            name: "XOR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getH();
                var result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };

        this.operations[0xAD] = {
            name: "XOR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getL();
                var result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xAE] = {
            name: "XOR",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = memory.readWord(registers.getHL());
                var result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };


        //TODO: Not sure if # means immediate value
        this.operations[0xEE] = {
            name: "XOR",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = this.mode.getValue(pc)
                var result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if(result == 0){
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };

         //-----------------------------------------------
        // CP n - Compare A with n: A - n, discard results
        // page 87
        //------------------------------------------------

        this.operations[0xBF] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                registers.setF(0);
                registers.setSubtractFlag(1);
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xB8] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getB();

                registers.setF(0);
                registers.setSubtractFlag(1);
            }
        };

        this.operations[0xB9] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getC();
                this.calcSubtractFlags(val, oper, false);

                registers.setF(0);
                registers.setSubtractFlag(1);
            }
        };


        this.operations[0xBA] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getD();
                this.calcSubtractFlags(val, oper, false);

                registers.setF(0);
                registers.setSubtractFlag(1);
            }
        };

        this.operations[0xBB] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getE();
                this.calcSubtractFlags(val, oper, false);

                registers.setF(0);
                registers.setSubtractFlag(1);
            }
        };

        this.operations[0xBC] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getH();
                this.calcSubtractFlags(val, oper, false);

                registers.setF(0);
                registers.setSubtractFlag(1);
            }
        };

        this.operations[0xBD] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = registers.getL();
                this.calcSubtractFlags(val, oper, false);

                registers.setF(0);
                registers.setSubtractFlag(1);
            }
        };

        this.operations[0xBE] = {
            name: "CP",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = memory.readWord(registers.getHL());
                this.calcSubtractFlags(val, oper, false);

                registers.setF(0);
                registers.setSubtractFlag(1);
            }
        };


        //TODO: Not sure if # means immediate value
        this.operations[0xFE] = {
            name: "CP",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc:number) {
                var val = registers.getA();
                var oper = this.mode.getValue(pc)
                this.calcSubtractFlags(val, oper, false);

                registers.setF(0);
                registers.setSubtractFlag(1);
            }
        };



    }
}

export interface Mode {
    name : string;
    getValue(addr:number): number;
};

export interface Operation {
    name: string;
    cycle: number;
    mode: Mode;
    size: number;
    execute(pc:number);
}
