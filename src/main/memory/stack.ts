import {Registers} from "../cpu/registers";
import {Memory} from "./memory";
/**
 * Created by hkamran on 12/11/2016.
 */
export class Stack {

    //Grows download
    //starts at 0xFFFE and grows down.

    private register: Registers;
    private memory: Memory;

    constructor(memory: Memory, register: Registers) {
        this.register = register;
        this.memory = memory;
    }

    public readByte(addr : number): number {
        let val;

        if (addr == 0xE000) {
            addr = 0xFF80;
        }


        //Read
        if (addr < 0xA000) {
            throw new Error("Stack pop error on addr 0x" + addr.toString(16));
        } else if (addr < 0xC000) {
            val = this.memory.cartridge.readByte(addr);
        } else if (addr < 0xE000) {
            val = this.memory.cpu.ram[addr - 0xC000];
        } else if (addr < 0xFE00) {
            val = this.memory.cpu.ram[addr - 0xE000];
        } else if (addr < 0xFEA0) {
            throw new Error("Stack push error on addr 0x" + addr.toString(16));
        } else if (addr > 0xFFFE) {
            throw "ERROR: Popping an empty stack"
        } else {
            val = this.memory.cpu.stack[addr - 0xFF80];
        }

        return val;
    }

    public popWord(): number {
        let sp = this.register.getSP();
        let low = this.readByte(sp);
        let high = this.readByte(sp + 1);
        this.register.setSP(sp + 2);
        return high << 8 | low;
    }

    public writeByte(val: number, addr: number): void {
        //Stack pointer decremets by 1 before address is written
        if (val > 0xFF) {
            throw "Stack push val is to big 0x" + val.toString(16);
        }

        if (addr < 0xA000) {
            throw new Error("Stack pop error on addr 0x" + addr.toString(16));
        } else if (addr < 0xC000) {
            this.memory.cartridge.writeByte(addr, val);
        } else if (addr < 0xE000) {
            this.memory.cpu.ram[addr - 0xC000] = val;
        } else if (addr < 0xFE00) {
            this.memory.cpu.ram[addr - 0xE000]
        } else if(addr < 0xFEA0){
            throw new Error("Stack push error on addr 0x" + addr.toString(16));
        } else {
            this.memory.cpu.stack[addr - 0xFF80] = val;
        }
    }

    public pushWord(val: number): void {
        let high = val >> 8;
        let low = val & 0xFF;
        let sp = this.register.getSP();
        this.writeByte(high, sp - 1);
        this.writeByte(low, sp - 2);
        this.register.setSP(sp - 2);
    }
}