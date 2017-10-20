import {Memory} from "../memory/memory";
import {Cpu} from "./cpu";

/**
 * Manages the set of operations
 */
export class Operations {

    private operations: Operation[];
    private cpu: Cpu;

    constructor(cpu: Cpu) {
        this.cpu = cpu;
        this.createMapping();
    }

    /**
     * Return the opcode.
     * @param opcode
     *      Opcode number
     * @returns Operation
     */
    public get(opcode: number): Operation {
        return this.operations[opcode];
    }

    /**
     * Helper function for setting carry flags depending on number of bits
     * @param first
     * @param second
     * @param short whether or not the operation is between 8bit or 16bit
     */
    private calcAddFlags(first: number, second: number, short: boolean = true): number {        
        //Default short is true (8bit operation by default)
        let fullmask = 0xFF;
        let mask = 0xF;
        let low = 4;
        let high = 8;

        //If short is false (if it is 16bit operation)
        if (short === false) {
            fullmask = 0xFFFF;
            mask = 0xFFF;
            low = 12;
            high = 16;
        }

        let half = (first & mask) + (second & mask);
        let full = (first + second);

        this.cpu.registers.setF(0);

        if (half >> low) {
            this.cpu.registers.setHalfFlag(1);
        }

        if (full >> high) {
            this.cpu.registers.setCarryFlag(1);
        }

        full &= fullmask;

        if(full == 0){
            this.cpu.registers.setZeroFlag(1);
        }

        return full;
    }


    /**
     * Helper function for setting carry flags depending on number of bits
     * @param first
     * @param second
     * @param short whether or not the operation is between 8bit or 16bit
     */
    private calcSubtractFlags(first: number, second: number, short: boolean = true): number {
        //Default short is true (8bit operation by default)
        // The half flag (low) is set if there is a borrow on bit 4
        let limit = 0xFF;
        let mask = 0xF;

        //If short is false (if it is 16bit operation)
        // The half flag (low) is set if there is a borrow at bit 12
        if (short === false) {
            limit = 0xFFFF;
            mask = 0xFFF;
        }

        this.cpu.registers.setF(0);
        this.cpu.registers.setSubtractFlag(1);

        let half = (first & mask) - (second & mask);
        let full = first - second;

        (half < 0)?this.cpu.registers.setHalfFlag(1): this.cpu.registers.setHalfFlag(0);

        (full < 0) ? this.cpu.registers.setCarryFlag(1):this.cpu.registers.setCarryFlag(0);

        full &= limit;

        if (full == 0) {
            this.cpu.registers.setZeroFlag(1);
        }

        return full;
    }


    private checkSign(low: number, high ?: number): number {

        let val = (high << 8) + low;
        let shift = 7; // Shift to check last bit

        if (high) {
            //For a full word it is possible for the value to be negative
            shift = 15;
        }

        //if val is negative
        if ((val >> shift) === 1) {
            val -= (1 << (shift + 1)); //Sign extension trick
        }

        return val
    }

    /**
     * Create a list of opcodes with their respective addressing modes.
     */
    private createMapping(): void {
        this.operations = [];

        //System Pointers
        let interrupts = this.cpu.interrupts;
        let registers = this.cpu.registers;
        let memory = this.cpu.memory;
        let stack = this.cpu.stack;

        /**
         * Modes
         */

        let immediate: Mode = new class {
            name: string = "Immediate";
            memory: Memory;

            constructor(memory: Memory) {
                this.memory = memory;
            }

            getValue(addr: number, size: number): number {
                if (size == 2) {
                    return this.memory.readWord(addr);
                }

                return this.memory.readByte(addr);
            }
        }(this.cpu.memory);

        //Helper functions
        let calcAddFlags = this.calcAddFlags.bind(this);
        let calcSubtractFlags = this.calcSubtractFlags.bind(this);
        let checkSign = this.checkSign.bind(this);

        /**
         * Instructions for Gameboy (Not Gameboy Color)
         */

        this.operations[0x00] = {
            name: "NOP",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                //NOTHING
            }
        };


        this.operations[0x01] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                registers.setBC(pc & 0xFFFF);
            }
        };


        this.operations[0x02] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getBC();
                let val = registers.getA();
                memory.writeByte(addr, val);
            }
        };


        this.operations[0x03] = {
            name: "INC",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                registers.setBC((registers.getBC() + 1) & 0xFFFF);
            }
        };

        this.operations[0x04] = {
            name: "INC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = registers.getB() + 1;
                registers.setF(0);
                if((result & 0xF) == 0){registers.setHalfFlag(1)}                
                if(result > 0xFF){
                    result = 0;
                    registers.setZeroFlag(1);
                }
        
                registers.setCarryFlag(carry);
                registers.setB(result);
            }
        };


        this.operations[0x05] = {
            name: "DEC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = (registers.getB() - 1) & 0xFF;
                registers.setF(0);                
                if(result == 0){ registers.setZeroFlag(1)}                
                ((result & 0xF) == 0xF)? registers.setHalfFlag(1) :registers.setHalfFlag(0);
                registers.setSubtractFlag(1);
                registers.setCarryFlag(carry);
                registers.setB(result);
            }
        };


        this.operations[0x06] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                registers.setB(pc);
            }
        };


        this.operations[0x07] = {
            name: "RLCA",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let msb = val >> 7;
                let result = (val << 1) & 0xFF;

                //Set flags
                registers.setF(0);
                registers.setCarryFlag(msb);
                if (result == 0) {registers.setZeroFlag(1)}
                registers.setA(result);
            }
        };


        this.operations[0x08] = {
            name: "LD",
            cycle: 20,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                memory.writeWord(pc, registers.getSP());
            }
        };

        this.operations[0x09] = {
            name: "ADD",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getHL();
                let oper = registers.getBC();
                let z = registers.getZeroFlag();
                let result = calcAddFlags(val, oper, false);
                registers.setZeroFlag(z); 
                registers.setHL(result);
            }
        };


        this.operations[0x0A] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = memory.readByte(registers.getBC());
                registers.setA(val);
            }
        };

        this.operations[0x0B] = {
            name: "DEC",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                registers.setBC((registers.getBC() - 1) & 0xFFFF);
            }
        };

        this.operations[0x0C] = {
            name: "INC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = registers.getC() + 1;
                registers.setF(0);
                if((result & 0xF) == 0){registers.setHalfFlag(1)}                
                if(result > 0xFF){
                    result = 0;
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(carry);
                registers.setC(result);
            }
        };


        this.operations[0x0D] = {
            name: "DEC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = (registers.getC() - 1) & 0xFF;
                registers.setF(0);
                ((result & 0xF) == 0xF)? registers.setHalfFlag(1):registers.setHalfFlag(0);
                if(result == 0){ registers.setZeroFlag(1) }
                registers.setSubtractFlag(1);
                registers.setCarryFlag(carry);
                registers.setC(result);
            }
        };


        this.operations[0x0E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                registers.setC(pc);
            }
        };

        this.operations[0x0F] = {
            name: "RRCA",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = registers.getA();
                registers.setCarryFlag(val & 0x1)
                val = val >> 1;

                registers.setF(0);
                if (val == 0) {
                    registers.setZeroFlag(1);
                }

                registers.setA(val);
            }
        };

        this.operations[0x10] = {
            name: "STOP",
            cycle: 4,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                memory.ppu.registers.changeSpeed();
            }
        };


        this.operations[0x11] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                registers.setDE(pc & 0xFFFF);
            }
        };


        this.operations[0x12] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getDE();
                let val = registers.getA();
                memory.writeByte(addr, val);
            }
        };


        this.operations[0x13] = {
            name: "INC",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                //No flags affected
                registers.setDE((registers.getDE() + 1) & 0xFFFF);
            }
        };


        this.operations[0x14] = {
            name: "INC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = registers.getD() + 1;
                registers.setF(0);
                if((result & 0xF) == 0){registers.setHalfFlag(1)}                
                if(result > 0xFF){
                    result = 0;
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(carry);
                registers.setD(result);
            }
        };


        this.operations[0x15] = {
            name: "DEC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = (registers.getD() - 1) & 0xFF;
                registers.setF(0);
                if(result == 0){ registers.setZeroFlag(1)}                
                ((result & 0xF) == 0xF)? registers.setHalfFlag(1):registers.setHalfFlag(0);
                registers.setSubtractFlag(1);
                registers.setCarryFlag(carry);
                registers.setD(result);
            }
        };


        this.operations[0x16] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                registers.setD(pc);
            }
        };

        this.operations[0x17] = {
            name: "RLA",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let bit = val >> 7;
                let result = ((val << 1) + registers.getCarryFlag()) & 0xFF;

                registers.setSubtractFlag(0);
                registers.setHalfFlag(0);
                if(result == 0){
                    registers.setZeroFlag(1);
                }
                registers.setCarryFlag(bit);
                registers.setA(result);
            }
        };



        this.operations[0x18] = {
            name: "JR",
            cycle: 12,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                registers.setPC(registers.getPC() + this.size + checkSign(pc));
            }
        };


        this.operations[0x19] = {
            name: "ADD",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getHL();
                let oper = registers.getDE();

                //TODO: Zero flag needs to be preserved
                //Find a better way to do this
                let zero = registers.getZeroFlag();

                let result = calcAddFlags(val, oper, false);
                registers.setZeroFlag(zero);
                registers.setHL(result);
            }
        };


        this.operations[0x1A] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = memory.readByte(registers.getDE());
                registers.setA(val);
            }
        };


        this.operations[0x1B] = {
            name: "DEC",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                registers.setDE((registers.getDE() - 1) & 0xFFFF);
            }
        };

        this.operations[0x1C] = {
            name: "INC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = registers.getE()+ 1;
                registers.setF(0);
                if((result & 0xF) == 0){registers.setHalfFlag(1)}
                if(result > 0xFF){
                    result = 0;
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(carry);
                registers.setE(result);
            }
        };


        this.operations[0x1D] = {
            name: "DEC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();                
                let result = (registers.getE() - 1) & 0xFF;
                registers.setF(0);
                if(result == 0){ registers.setZeroFlag(1)}                
                ((result & 0xF) == 0xF)? registers.setHalfFlag(1):registers.setHalfFlag(0);
                registers.setSubtractFlag(1);
                registers.setCarryFlag(carry);
                registers.setE(result);
            }
        };


        this.operations[0x1E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                registers.setE(pc);
            }
        };

        this.operations[0x1F] = {
            name: "RRA",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {

                let val = registers.getA() + (registers.getCarryFlag() << 8);
                let bit = val & 1;
                let result = val >> 1;

                registers.setF(0);
                registers.setCarryFlag(bit);
                registers.setA(result);
            }
        };


        this.operations[0x20] = {
            name: "JR",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                if (registers.getZeroFlag() == 0) {
                    registers.setPC(registers.getPC() + checkSign(pc) + this.size);
                    this.cycle = 12;
                }
            }
        };


        this.operations[0x21] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                registers.setHL(pc & 0xFFFF);
            }
        };

        this.operations[0x22] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                memory.writeByte(addr, registers.getA());
                registers.setHL(addr + 1 & 0xFFFF);
            }
        };


        this.operations[0x23] = {
            name: "INC",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                registers.setHL((registers.getHL() + 1) & 0xFFFF);
            }
        };


        this.operations[0x24] = {
            name: "INC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = registers.getH() + 1;
                registers.setF(0);
                if((result & 0xF) == 0){registers.setHalfFlag(1)}                
                if(result > 0xFF){
                    result = 0;
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(carry);
                registers.setH(result);
            }
        };


        this.operations[0x25] = {
            name: "DEC",
            cycle: 4, 
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = (registers.getH() - 1) & 0xFF;
                registers.setF(0);
                if(result == 0){ registers.setZeroFlag(1)}                
                ((result & 0xF) == 0xF)? registers.setHalfFlag(1):registers.setHalfFlag(0);
                registers.setSubtractFlag(1);
                registers.setCarryFlag(carry);
                registers.setH(result);
            }
        };

        this.operations[0x26] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                registers.setH(pc);
            }
        };


        this.operations[0x27] = {
            name: "DAA",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();

                if(registers.getSubtractFlag() == 0){
                    if(registers.getHalfFlag() || (val & 0xF) >0x9){
                        val += 0x06;
                    }
                    
                    if(registers.getCarryFlag() || (val > 0x9F)){
                        val += 0x60;
                    }
                } else {
                    if(registers.getHalfFlag()) val = (val - 6) & 0xFF;
                    if(registers.getCarryFlag()) val -= 0x60;
                }

                registers.setZeroFlag(0);
                registers.setHalfFlag(0);

                if((val & 0x100) == 0x100){
                    registers.setCarryFlag(1);
                }

                val &= 0xFF;
                if(val == 0){
                    registers.setZeroFlag(1);
                }
                registers.setA(val);
            }
        };


        this.operations[0x28] = {
            name: "JR",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                if (registers.getZeroFlag()) {
                    registers.setPC(registers.getPC() + this.size + checkSign(pc));
                    this.cycle = 12;
                }

            }
        };

        this.operations[0x29] = {
            name: "ADD",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getHL();
                let z = registers.getZeroFlag();
                let result = calcAddFlags(val, val, false);
                registers.setZeroFlag(z); 
                registers.setHL(result);
            }
        };

        this.operations[0x2A] = {
            name: "LDi",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = memory.readByte(addr);
                registers.setA(val);
                registers.setHL(addr + 1 & 0xFFFF);
            }
        };

        this.operations[0x2B] = {
            name: "DEC",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                registers.setHL((registers.getHL() - 1) & 0xFFFF);
            }
        };

        this.operations[0x2C] = {
            name: "INC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = registers.getL()+ 1;
                registers.setF(0);
                if((result & 0xF) == 0){registers.setHalfFlag(1)}                
                if(result > 0xFF){
                    result = 0;
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(carry);
                registers.setL(result);
            }
        };


        this.operations[0x2D] = {
            name: "DEC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = (registers.getL() - 1) & 0xFF;
                registers.setF(0);
                if(result == 0){ registers.setZeroFlag(1)}                
                ((result & 0xF) == 0xF)? registers.setHalfFlag(1):registers.setHalfFlag(0);
                registers.setSubtractFlag(1);
                registers.setCarryFlag(carry);
                registers.setL(result);
            }
        };

        this.operations[0x2E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                registers.setL(pc);
            }
        };

        this.operations[0x2F] = {
            name: "CPL",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let result = val ^ 0xFF;
                registers.setSubtractFlag(1);
                registers.setHalfFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x30] = {
            name: "JR",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                if (registers.getCarryFlag() == 0) {
                    registers.setPC(registers.getPC() + checkSign(pc) + this.size);
                    this.cycle = 12;
                }
            }
        };

        this.operations[0x31] = {
            name: "LD",
            cycle: 12,
            size: 3,
            mode: immediate,
            execute(pc: number) {
                registers.setSP(pc);
            }
        };


        this.operations[0x32] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = registers.getA();
                memory.writeByte(addr, val);
                registers.setHL(addr - 1 & 0xFFFF);
            }
        };


        this.operations[0x33] = {
            name: "INC",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                registers.setSP((registers.getSP() + 1) & 0xFFFF);
            }
        };


        this.operations[0x34] = {
            name: "INC",
            cycle: 12,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = memory.readByte(registers.getHL()) +1;
                registers.setF(0);
                if((result & 0xF) == 0){registers.setHalfFlag(1)}
                if(result > 0xFF){
                    result = 0;
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(carry);
                memory.writeByte(registers.getHL(), result);
            }
        };


        this.operations[0x35] = {
            name: "DEC",
            cycle: 12,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = (memory.readByte(registers.getHL()) - 1) & 0xFF;
                registers.setF(0);
                if(result == 0){ registers.setZeroFlag(1)}                
                ((result & 0xF) == 0xF)? registers.setHalfFlag(1):registers.setHalfFlag(0);
                registers.setSubtractFlag(1);
                registers.setCarryFlag(carry);
                memory.writeByte(registers.getHL(), result);
            }
        };


        this.operations[0x36] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                memory.writeByte(registers.getHL(), pc);
            }
        };

        this.operations[0x37] = {
            name: "SCF",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setSubtractFlag(0);
                registers.setHalfFlag(0);
                registers.setCarryFlag(1);
            }
        };


        this.operations[0x38] = {
            name: "JR",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                if (registers.getCarryFlag()) {
                    registers.setPC(registers.getPC() + checkSign(pc) + this.size);
                    this.cycle = 12;
                }
            }
        };


        this.operations[0x39] = {
            name: "ADD",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getHL();
                let oper = registers.getSP();
                let z = registers.getZeroFlag();
                let result = calcAddFlags(val, oper, false);
                registers.setZeroFlag(z); 
                registers.setHL(result);
            }
        };

        this.operations[0x3A] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = memory.readByte(addr);
                registers.setA(val);
                registers.setHL(addr - 1 & 0xFFFF);
            }
        };


        this.operations[0x3B] = {
            name: "DEC",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                registers.setSP((registers.getSP() - 1 ) & 0xFFFF);
            }
        };


        this.operations[0x3C] = {
            name: "INC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = registers.getA() + 1;
                registers.setF(0);
                if((result & 0xF) == 0){registers.setHalfFlag(1)}                
                if(result > 0xFF){
                    result = 0;
                    registers.setZeroFlag(1);
                }
        
                registers.setCarryFlag(carry);
                registers.setA(result);
            }
        };


        this.operations[0x3D] = {
            name: "DEC",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let carry = registers.getCarryFlag();
                let result = (registers.getA() - 1) & 0xFF;
                registers.setF(0);
                if(result == 0){ registers.setZeroFlag(1)}                
                ((result & 0xF) == 0xF)? registers.setHalfFlag(1):registers.setHalfFlag(0);
                registers.setSubtractFlag(1);
                registers.setCarryFlag(carry);
                registers.setA(result);
            }
        };

        this.operations[0x3E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                registers.setA(pc);
            }
        };


        this.operations[0x3F] = {
            name: "CCF",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setSubtractFlag(0);
                registers.setHalfFlag(0);
                (registers.getCarryFlag())? registers.setCarryFlag(0) : registers.setCarryFlag(1);
            }
        };

        this.operations[0x40] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {

            }
        };


        this.operations[0x41] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setB(registers.getC());
            }
        };

        this.operations[0x42] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setB(registers.getD());
            }
        };

        this.operations[0x43] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setB(registers.getE());
            }
        };

        this.operations[0x44] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setB(registers.getH());
            }
        };

        this.operations[0x45] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setB(registers.getL());
            }
        };

        this.operations[0x46] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = memory.readByte(registers.getHL());
                registers.setB(val);
            }
        };

        this.operations[0x47] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setB(registers.getA());
            }
        };


        this.operations[0x48] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setC(registers.getB());
            }
        };

        this.operations[0x49] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
            }
        };

        this.operations[0x4A] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setC(registers.getD());
            }
        };

        this.operations[0x4B] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setC(registers.getE());
            }
        };

        this.operations[0x4C] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setC(registers.getH());
            }
        };

        this.operations[0x4D] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setC(registers.getL());
            }
        };

        this.operations[0x4E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = memory.readByte(registers.getHL());
                registers.setC(val);
            }
        };


        this.operations[0x4F] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setC(registers.getA());
            }
        };

        this.operations[0x50] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setD(registers.getB());
            }
        };

        this.operations[0x51] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setD(registers.getC());
            }
        };

        this.operations[0x52] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
            }
        };

        this.operations[0x53] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setD(registers.getE());
            }
        };

        this.operations[0x54] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setD(registers.getH());
            }
        };

        this.operations[0x55] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setD(registers.getL());
            }
        };

        this.operations[0x56] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = memory.readByte(registers.getHL());
                registers.setD(val);
            }
        };

        this.operations[0x57] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setD(registers.getA());
            }
        };

        this.operations[0x58] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setE(registers.getB());
            }
        };

        this.operations[0x59] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setE(registers.getC());
            }
        };

        this.operations[0x5A] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setE(registers.getD());
            }
        };

        this.operations[0x5B] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
            }
        };

        this.operations[0x5C] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setE(registers.getH());
            }
        };

        this.operations[0x5D] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setE(registers.getL());
            }
        };

        this.operations[0x5E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = memory.readByte(registers.getHL());
                registers.setE(val);
            }
        };


        this.operations[0x5F] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setE(registers.getA());
            }
        };


        this.operations[0x60] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setH(registers.getB());
            }
        };

        this.operations[0x61] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setH(registers.getC());
            }
        };

        this.operations[0x62] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setH(registers.getD());
            }
        };

        this.operations[0x63] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setH(registers.getE());
            }
        };

        this.operations[0x64] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
            }
        };

        this.operations[0x65] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setH(registers.getL());
            }
        };

        this.operations[0x66] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = memory.readByte(registers.getHL());
                registers.setH(val);
            }
        };


        this.operations[0x67] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setH(registers.getA());
            }
        };

        this.operations[0x68] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setL(registers.getB());
            }
        };

        this.operations[0x69] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setL(registers.getC());
            }
        };

        this.operations[0x6A] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setL(registers.getD());
            }
        };

        this.operations[0x6B] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setL(registers.getE());
            }
        };


        this.operations[0x6C] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setL(registers.getH());
            }
        };

        this.operations[0x6D] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
            }
        };

        this.operations[0x6E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = memory.readByte(registers.getHL());
                registers.setL(val);
            }
        };


        this.operations[0x6F] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setL(registers.getA());
            }
        };


        this.operations[0x70] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = registers.getB();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x71] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = registers.getC();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x72] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = registers.getD();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x73] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = registers.getE();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x74] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = registers.getH();
                memory.writeByte(addr, val);
            }
        };

        this.operations[0x75] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = registers.getL();
                memory.writeByte(addr, val);
            }
        };


        this.operations[0x77] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = registers.getA();
                memory.writeByte(addr, val);
            }
        };


        this.operations[0x78] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setA(registers.getB());
            }
        };

        this.operations[0x79] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setA(registers.getC());
            }
        };

        this.operations[0x7A] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setA(registers.getD());
            }
        };

        this.operations[0x7B] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setA(registers.getE());
            }
        };

        this.operations[0x7C] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setA(registers.getH());
            }
        };

        this.operations[0x7D] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setA(registers.getL());
            }
        };


        this.operations[0x7E] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = memory.readByte(registers.getHL());
                registers.setA(val);
            }
        };


        this.operations[0x7F] = {
            name: "LD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                //WHY!?!?! is this created!!!!!
            }
        };


        this.operations[0x80] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let result = calcAddFlags(registers.getA(), registers.getB());
                registers.setA(result);
            }
        };

        this.operations[0x81] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let result = calcAddFlags(registers.getA(), registers.getC());
                registers.setA(result);
            }
        };


        this.operations[0x82] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let result = calcAddFlags(registers.getA(), registers.getD());
                registers.setA(result);
            }
        };


        this.operations[0x83] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let result = calcAddFlags(registers.getA(), registers.getE());
                registers.setA(result);
            }
        };

        this.operations[0x84] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let result = calcAddFlags(registers.getA(), registers.getH());
                registers.setA(result);
            }
        };


        this.operations[0x85] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let result = calcAddFlags(registers.getA(), registers.getL());
                registers.setA(result);
            }
        };


        this.operations[0x86] = {
            name: "ADD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = memory.readByte(addr);
                let result = calcAddFlags(registers.getA(), val);
                registers.setA(result);
            }
        };

        this.operations[0x87] = {
            name: "ADD",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = registers.getA();
                let result = calcAddFlags(val, val);
                registers.setA(result);
            }
        };


        this.operations[0x88] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getB()  + registers.getCarryFlag()) & 0xFF;
                let result = calcAddFlags(val, oper);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };

        this.operations[0x89] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getC()  + registers.getCarryFlag()) & 0xFF;
                let result = calcAddFlags(val, oper);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };

        this.operations[0x8A] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getD()  + registers.getCarryFlag()) & 0xFF;
                let result = calcAddFlags(val, oper);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };


        this.operations[0x8B] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getE() + registers.getCarryFlag()) & 0xFF;
                let result = calcAddFlags(val, oper);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };

        this.operations[0x8C] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getH() + registers.getCarryFlag()) & 0xFF;
                let result = calcAddFlags(val, oper);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };


        this.operations[0x8D] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getL() + registers.getCarryFlag()) & 0xFF;
                let result = calcAddFlags(val, oper);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };


        this.operations[0x8E] = {
            name: "ADC",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (memory.readByte(registers.getHL()) +  registers.getCarryFlag()) & 0xFF ;
                let result = calcAddFlags(val, oper);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };


        this.operations[0x8F] = {
            name: "ADC",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                let val = registers.getA();
                let result = calcAddFlags(val, (val + registers.getCarryFlag()) & 0xFF);

                registers.setSubtractFlag(0);
                registers.setA(result);
            }
        };


        this.operations[0x90] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getB();
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };

        this.operations[0x91] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getC();
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };


        this.operations[0x92] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getD();
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };

        this.operations[0x93] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getE();
                let result = calcSubtractFlags(val, oper);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };

        this.operations[0x94] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getH();
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };

        this.operations[0x95] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getL();
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };

        this.operations[0x96] = {
            name: "SUB",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = memory.readByte(registers.getHL());
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };


        this.operations[0x97] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let result = calcSubtractFlags(val, val);
                registers.setA(result);
            }
        };


        this.operations[0x98] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getB() + registers.getCarryFlag()) & 0xFF;
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };

        this.operations[0x99] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getC() + registers.getCarryFlag()) & 0xFF;
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };


        this.operations[0x9A] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getD() + registers.getCarryFlag())  & 0xFF;
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };

        this.operations[0x9B] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getE()  + registers.getCarryFlag()) & 0xFF;
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };

        this.operations[0x9C] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getH() + registers.getCarryFlag()) & 0xFF;
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };

        this.operations[0x9D] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = (registers.getL() + registers.getCarryFlag()) & 0xFF;
                let result = calcSubtractFlags(val, oper);
                registers.setA(result);
            }
        };

        this.operations[0x9F] = {
            name: "SUB",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let result = calcSubtractFlags(val, (val + registers.getCarryFlag()) & 0xFF);

                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };


        this.operations[0xA0] = {
            name: "AND",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getB();
                let result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getC();
                let result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setHalfFlag(1);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getD();
                let result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getE();
                let result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getH();
                let result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getL();
                let result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = memory.readWord(registers.getHL());
                let result = val & oper;

                //reset all flags
                registers.setF(0);
                registers.setSubtractFlag(1);

                if (result == 0) {
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };


        this.operations[0xA7] = {
            name: "AND",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let result = val & val;

                //reset all flags
                registers.setF(0);
                registers.setHalfFlag(1);

                if (result == 0) {
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };


        this.operations[0xA8] = {
            name: "XOR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getB();
                let result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getC();
                let result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getD();
                let result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getE();
                let result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getH();
                let result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getL();
                let result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = memory.readByte(registers.getHL());
                let result = val ^ oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        //Ummm xoring myself...
        this.operations[0xAF] = {
            name: "XOR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                registers.setF(0);
                registers.setZeroFlag(1);
                registers.setA(0);
            }
        };

        this.operations[0xB0] = {
            name: "OR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getB();
                let result = val | oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getC();
                let result = val | oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getD();
                let result = val | oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getE();
                let result = val | oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getH();
                let result = val | oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getL();
                let result = val | oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
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
            execute(pc: number) {
                let val = registers.getA();
                let oper = memory.readWord(registers.getHL()) & 0xFF;
                let result = val | oper;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xB7] = {
            name: "OR",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let result = val | val;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };


        this.operations[0xB8] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getB();
                calcSubtractFlags(val, oper);
            }
        };

        this.operations[0xB9] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getC();
                calcSubtractFlags(val, oper);
            }
        };


        this.operations[0xBA] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getD();
                calcSubtractFlags(val, oper);
            }
        };

        this.operations[0xBB] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getE();
                calcSubtractFlags(val, oper);
            }
        };

        this.operations[0xBC] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getH();
                calcSubtractFlags(val, oper);
            }
        };

        this.operations[0xBD] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = registers.getL();
                calcSubtractFlags(val, oper);
            }
        };

        this.operations[0xBE] = {
            name: "CP",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let oper = memory.readWord(registers.getHL());
                calcSubtractFlags(val, oper);
            }
        };


        this.operations[0xBF] = {
            name: "CP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                registers.setF(0);
                registers.setSubtractFlag(1);
                registers.setZeroFlag(1);
            }
        };


        this.operations[0xC0] = {
            name: "RET",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                if (registers.getZeroFlag() == 0) {
                    let result = stack.popWord();
                    registers.setPC(result);
                    this.cycle = 20;
                }
            }
        };


        this.operations[0xC1] = {
            name: "POP",
            cycle: 12,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setBC(stack.popWord());
            }
        };

        this.operations[0xC2] = {
            name: "JP",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                if (registers.getZeroFlag() == 0) {
                    registers.setPC(pc);
                    this.cycle = 16;
                }
            }
        };


        this.operations[0xC3] = {
            name: "JP",
            cycle: 16,
            size: 3,
            mode: immediate,
            execute(pc: number) {
                registers.setPC(pc);
            }
        };

        this.operations[0xC4] = {
            name: "CALL",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                if (registers.getZeroFlag() == 0) {
                    stack.pushWord(registers.getPC() + this.size);
                    registers.setPC(pc);
                    this.cycle = 24;
                }
            }
        };


        this.operations[0xC5] = {
            name: "PUSH",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                stack.pushWord(registers.getBC());
            }
        };


        this.operations[0xC6] = {
            name: "ADD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                let result = calcAddFlags(registers.getA(), pc);
                registers.setA(result);
            }
        };


        this.operations[0xC8] = {
            name: "RET",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                if (registers.getZeroFlag()) {
                    //Pop from stack pointer to pc
                    registers.setPC(stack.popWord());
                    this.cycle = 20;
                }
            }
        };

        this.operations[0xC9] = {
            name: "RET",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setPC(stack.popWord());
            }
        };

        this.operations[0xCA] = {
            name: "JP",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                if (registers.getZeroFlag()) {
                    registers.setPC(pc);
                    this.cycle = 16;
                }
            }
        };


        this.operations[0xCC] = {
            name: "CALL",
            cycle: 12,
            size: 3,
            mode: immediate,
            execute(pc: number) {
                if (registers.getZeroFlag() == 1) {
                    stack.pushWord(registers.getPC() + this.size);
                    registers.setPC(pc);
                    this.cycle = 24;
                }
            }
        };

        this.operations[0xCD] = { //pg 114
            name: "CALL",
            cycle: 24,
            size: 3,
            mode: immediate,
            execute(pc: number) {
                stack.pushWord(registers.getPC() + this.size);
                registers.setPC(pc);
            }
        };


        this.operations[0xCE] = {
            name: "ADC",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                let val = registers.getA();
                let result = calcAddFlags(val, pc + registers.getCarryFlag());
                registers.setA(result);
            }
        };

        this.operations[0xCF] = {
            name: "RST",
            cycle: 16,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                //Push onto stack
                registers.setSP(registers.getSP() - 1);
                stack.pushWord(pc);
                registers.setPC(0x08);
            }
        };


        this.operations[0xD0] = {
            name: "POP",
            cycle: 12,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                if (registers.getC() == 0) {
                    let result = stack.popWord();
                    registers.setPC(result);
                    this.cycle = 20;
                }
            }
        };

        this.operations[0xD1] = {
            name: "POP",
            cycle: 12,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setDE(stack.popWord());
            }
        };

        this.operations[0xD2] = {
            name: "JP",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                if (registers.getZeroFlag() == 0) {
                    registers.setPC(pc);
                    this.cycle = 16;
                }
            }
        };

        this.operations[0xD4] = {
            name: "CALL",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                if (registers.getCarryFlag() == 0) {
                    stack.pushWord(registers.getPC() + this.size);
                    registers.setPC(pc);
                    this.cycle = 24;
                }
            }
        };


        this.operations[0xD5] = {
            name: "PUSH",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                stack.pushWord(registers.getDE());
            }
        };


        this.operations[0xD6] = {
            name: "SUB",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let result = calcSubtractFlags(val, pc);
                registers.setSubtractFlag(1);
                registers.setA(result);
            }
        };



        this.operations[0xD8] = {
            name: "RET",
            cycle: 8,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                if (registers.getCarryFlag()) {
                    //Pop from stack pointer to pc
                    registers.setPC(stack.popWord());
                    this.cycle = 20;
                }
            }
        };

        this.operations[0xD9] = {
            name: "RETI",
            cycle: 16,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                //Pop from stack pointer to pc
                let result = stack.popWord();
                registers.setPC(result);
                interrupts.enableAllInterrupts();
            }
        };

        this.operations[0xDA] = {
            name: "JP",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                if (registers.getCarryFlag()) {
                    registers.setPC(pc);
                    this.cycle = 16;
                }
            }
        };

        this.operations[0xDC] = {
            name: "CALL",
            cycle: 12,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                if (registers.getCarryFlag()) {
                    stack.pushWord(registers.getPC() + this.size);
                    registers.setPC(pc);
                    this.cycle = 24;
                }
            }
        };



        this.operations[0xDE] = {
            name: "SBC",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let a = registers.getA();
                let result = calcSubtractFlags(a, pc + registers.getCarryFlag());
                registers.setA(result);
            }
        };


        this.operations[0xE0] = {
            name: "LD",
            cycle: 12,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                let addr = 0xFF00 | pc;
                memory.writeByte(addr, registers.getA());
            }
        };


        this.operations[0xE1] = {
            name: "POP",
            cycle: 12,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setHL(stack.popWord());
            }
        };

        this.operations[0xE2] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1, //TODO: ???? this is 2 on the links doc but 1 during debugger run
            execute(pc: number) {
                let high = 0xff;
                let low = registers.getC();
                let addr = high << 8 | low;
                memory.writeByte(addr, registers.getA());
            }
        };


        this.operations[0xE5] = {
            name: "PUSH",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                stack.pushWord(registers.getHL());
            }
        };


        this.operations[0xE6] = {
            name: "AND",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let result = val & pc;

                //reset all flags
                registers.setF(0);
                registers.setHalfFlag(1);

                if (result == 0) {
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };
        
        this.operations[0xE8] = {
            name: "ADD",
            cycle: 16,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getSP();
                let result, f;
                
                if(pc == 0xFF){
                    result = calcAddFlags(val, 0xFFFF, false);
                    calcAddFlags((val & 0xFF), (pc & 0xFF));                    
                } else {
                    result = calcAddFlags(val, pc , false);
                    f = registers.getF();                    
                    calcAddFlags((val & 0xFF), (pc & 0xFF));                    
                    registers.setF(f | registers.getF());                    
                }
                //For some reason e8 sets flags on carries for short and long
                registers.setZeroFlag(0);
                registers.setSP(result);
            }
        };

        this.operations[0xE9] = {
            name: "JP",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                registers.setPC(registers.getHL());
            }
        };

        this.operations[0xEA] = {
            name: "LD",
            cycle: 16,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                let val = registers.getA();
                memory.writeByte(pc, val);
            }
        };

        this.operations[0xEE] = {
            name: "XOR",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let result = val ^ pc;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };


        this.operations[0xEF] = {
            name: "RST",
            cycle: 16,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                stack.pushWord(registers.getPC() + this.size);
                registers.setPC(0x28);
            }
        };


        this.operations[0xF0] = {
            name: "LDH",
            cycle: 12,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                let val = memory.readByte(0xFF00 | pc);
                registers.setA(val & 0xFF);
            }
        };


        this.operations[0xF1] = {
            name: "POP",
            cycle: 12,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setAF(stack.popWord());
            }
        };


        this.operations[0xF2] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                let high = 0xff;
                let low = registers.getC();
                let addr = high << 8 | low;
                let val = memory.readByte(addr);
                registers.setA(val);
            }
        };

        this.operations[0xF3] = {
            name: "Di",
            cycle: 4,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                interrupts.disableAllInterrupts();
            }
        };


        this.operations[0xF5] = {
            name: "PUSH",
            cycle: 16,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                stack.pushWord(registers.getAF());
            }
        };


        this.operations[0xF6] = {
            name: "OR",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let result = val | pc;

                //reset all flags
                registers.setF(0);

                if (result == 0) {
                    registers.setZeroFlag(1);
                }

                registers.setA(result);

            }
        };

        this.operations[0xF8] = {
            name: "LDHL",
            cycle: 12,
            mode: immediate,
            size: 2,
            execute(pc: number) {
                let val = registers.getSP();
                let result = (val + checkSign(pc)) & 0xFFFF;
                let f;
                calcAddFlags(val, pc, false);
                f = registers.getF();
                calcAddFlags(val & 0xFF, pc & 0xFF);
                registers.setF(f | registers.getF());
                registers.setZeroFlag(0);
                registers.setSubtractFlag(0);
                registers.setHL(result);
            }
        };

        this.operations[0xF7] = {
            name: "RST",
            cycle: 16,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                //Push onto stack
                registers.setSP(registers.getSP() - 1);
                stack.pushWord(pc);
                registers.setPC(0x30);
            }
        };


        this.operations[0xF9] = {
            name: "LD",
            cycle: 8,
            mode: immediate,
            size: 1,
            execute(pc: number) {
                registers.setSP(registers.getHL());
            }
        };

        this.operations[0xFA] = {
            name: "LD",
            cycle: 16,
            mode: immediate,
            size: 3,
            execute(pc: number) {
                let val = memory.readByte(pc);
                registers.setA(val);
            }
        };

        this.operations[0xFB] = {
            name: "EI",
            cycle: 4,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                interrupts.enableAllInterrupts();
            }
        };

        this.operations[0xFE] = {
            name: "CP",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                calcSubtractFlags(val, pc);
            }
        };

        this.operations[0xFF] = {
            name: "RST",
            cycle: 16,
            size: 1,
            mode: immediate,
            execute(pc: number) {
                //Push onto stack
                registers.setSP(registers.getSP() - 1);
                stack.pushWord(pc);
                registers.setPC(0x38);
            }
        };


        this.operations[0xCB00] = {
            name: "RLCB",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB();
                let bit = val >> 7;
                let result = ((val << 1) + registers.getCarryFlag()) & 0xFF;

                //Set flags
                registers.setSubtractFlag(0);
                registers.setHalfFlag(0);
                registers.setCarryFlag(bit);
                if (result == 0) {registers.setZeroFlag(1)}
                registers.setB(result);
            }
        };

        this.operations[0xCB08] = {
            name: "RRC",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB() + (registers.getCarryFlag() << 8);
                let bit = val & 0x01;                
                let result = val >> 1;
                
                if (result == 0) {
                    registers.setZeroFlag(1);
                }

                registers.setSubtractFlag(0);
                registers.setHalfFlag(0);
                registers.setCarryFlag(bit);

                registers.setB(result);
            }
        };

        this.operations[0xCB18] = {
            name: "RR",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB() + (registers.getCarryFlag() << 8);
                let bit = val & 1;
                let result = val;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(bit);
                registers.setB(result);
            }
        };


        this.operations[0xCB19] = {
            name: "RR",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getC() + (registers.getCarryFlag() << 8);
                let bit = val & 1;
                let result = val>> 1 ;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(bit);
                registers.setC(result);
            }
        };

        this.operations[0xCB1A] = {
            name: "RR",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getD() + (registers.getCarryFlag() << 8);
                let bit = val & 1;
                let result = val >> 1;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(bit);
                registers.setD(result);
            }
        };

        this.operations[0xCB1B] = {
            name: "RR",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getE() + (registers.getCarryFlag() << 8);
                let bit = val & 1;
                let result = val >> 1;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(bit);
                registers.setE(result);
            }
        };

        this.operations[0xCB27] = {
            name: "SLA",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let bit = val >> 7;
                let result = (val << 1) & 0xFFFF;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(bit);
                registers.setA(result);
            }
        };

        this.operations[0xCB30] = {
            name: "SWAP",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB();
                let lower = val & 0xF;
                let upper = (val & 0xF0) >> 4;
                let result = (lower << 4) + upper;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setB(result);
            }
        };

        this.operations[0xCB31] = {
            name: "SWAP",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getC();
                let lower = val & 0xF;
                let upper = (val & 0xF0) >> 4;
                let result = (lower << 4) + upper;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setC(result);
            }
        };


        this.operations[0xCB32] = {
            name: "SWAP",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getD();
                let lower = val & 0xF;
                let upper = (val & 0xF0) >> 4;
                let result = (lower << 4) + upper;

                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setD(result);
            }
        };

        this.operations[0xCB33] = {
            name: "SWAP",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getE();
                let lower = (val & 0xF) << 4;
                let upper = (val & 0xF0) >> 4;
                let result = lower + upper;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setE(result);
            }
        };

        this.operations[0xCB34] = {
            name: "SWAP",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getH();
                let lower = val & 0xF;
                let upper = (val & 0xF0) >> 4;
                let result = (lower << 4) + upper;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setH(result);
            }
        };

        this.operations[0xCB35] = {
            name: "SWAP",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getL();
                let lower = val & 0xF;
                let upper = (val & 0xF0) >> 4;
                let result = (lower << 4) + upper;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setL(result);
            }
        };

        this.operations[0xCB36] = {
            name: "SWAP",
            cycle: 16,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getHL();
                let lower = val & 0xFF;
                let upper = (val & 0xFF00) >> 8;
                let result = (lower << 8) + upper;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setHL(result);
            }
        };


        this.operations[0xCB37] = {
            name: "SWAP",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let lower = val & 0xF;
                let upper = (val & 0xF0) >> 4;
                let result = (lower << 4) + upper;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setA(result);
            }
        };

        this.operations[0xCB38] = {
            name: "SRL",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB();
                let bit = val & 1;
                let result = val >> 1;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(bit);
                registers.setB(result);
            }
        };


        this.operations[0xCB3F] = {
            name: "SRL",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                let bit = val & 1;
                let result = val >> 1;

                registers.setF(0);
                if (result === 0) {
                    registers.setZeroFlag(1);
                }

                registers.setCarryFlag(bit);
                registers.setA(result);
            }
        };

        this.operations[0xCB40] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x01) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB41] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getC();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x01) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB47] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x01) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB48] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x02) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB50] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x04) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB57] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x04) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };


        this.operations[0xCB58] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x08) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB5C] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getH();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x08) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };


        this.operations[0xCB5F] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x08) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };


        this.operations[0xCB60] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x10) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };


        this.operations[0xCB61] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getC();

                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x10) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB68] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x20) {
                    registers.setZeroFlag(0);
                    return
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB69] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getC();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x20) {
                    registers.setZeroFlag(0);
                    return
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB6F] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();

                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x20) {
                    registers.setZeroFlag(0);
                    return
                }
                registers.setZeroFlag(1);
            }
        };
        this.operations[0xCB70] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x40) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB71] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getC();
                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x40) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };


        this.operations[0xCB77] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();

                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x40) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };
        this.operations[0xCB78] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getB();

                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x80) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB79] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getC();

                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x80) {
                    registers.setZeroFlag(0);
                    return;
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB7E] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = memory.readByte(registers.getHL());

                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x80) {
                    registers.setZeroFlag(0);
                    return
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB7F] = {
            name: "BIT",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();

                registers.setSubtractFlag(0);
                registers.setHalfFlag(1);
                if (val & 0x80) {
                    registers.setZeroFlag(0);
                    return
                }
                registers.setZeroFlag(1);
            }
        };

        this.operations[0xCB86] = {
            name: "RES",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let addr = registers.getHL();
                let val = memory.readByte(addr);
                memory.writeByte(addr, val & ~(0x01));
            }
        };

        this.operations[0xCB87] = {
            name: "RES",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let val = registers.getA();
                registers.setA(val & ~(0x01));
            }
        };


        this.operations[0xCB9E] = {
            name: "RES",
            cycle: 16,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let hl = registers.getHL();
                let val = memory.readByte(hl);
                memory.writeByte(hl, val & ~(0x08));
            }
        };


        this.operations[0xCBBE] = {
            name: "RES",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let hl = registers.getHL();
                let val = memory.readByte(hl);
                memory.writeByte(hl, val & ~(0x80));
            }
        };

        this.operations[0xCBD0] = {
            name: "SET",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let c = registers.getC();
                registers.setC(c | 0x04);
            }
        };

        this.operations[0xCBD8] = {
            name: "SET",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let b = registers.getB();
                registers.setC(b | 0x03);
            }
        };


        this.operations[0xCBDE] = {
            name: "SET",
            cycle: 16,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let hl = registers.getHL();
                registers.setHL(hl | 0x08);
            }
        };

        this.operations[0xCBF0] = {
            name: "SET",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let b = registers.getB();
                registers.setB(b | 0x40);
            }
        };

        this.operations[0xCBF8] = {
            name: "SET",
            cycle: 8,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let b = registers.getB();
                registers.setB(b | 0x80);
            }
        };

        this.operations[0xCBFE] = {
            name: "SET",
            cycle: 16,
            size: 2,
            mode: immediate,
            execute(pc: number) {
                let hl = registers.getHL();
                let val = memory.readByte(hl);
                memory.writeByte(hl, val |= 0x80);
            }
        };
    }


}

export interface Mode {
    name: string;
    memory: Memory;

    getValue(addr: number, size: number): number;
}
;

export interface Operation {
    name: string;
    cycle: number;
    mode: Mode;
    size: number;

    execute(pc: number);
}
