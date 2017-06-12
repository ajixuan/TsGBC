import {Registers} from "../cpu/registers";
import {Memory} from "./memory";
/**
 * Created by hkamran on 12/11/2016.
 */
export class Stack {

    //Grows download
    //starts at 0xFFFE and grows down.

    private register : Registers;
    private memory : Memory;

    constructor(memory : Memory, register : Registers) {
        this.register = register;
        this.memory = memory;
    }

    public popByte() : number {
        let addr = this.register.getSP();
        let val;

        if (addr > 0x7F) {
            throw "Stack pop error on addr 0x" + addr.toString(16);
        }

        if(addr < 0xA000){
            throw "Stack pop error on addr 0x" + addr.toString(16);
        } else if(addr < 0xE000) {
            val = this.memory.cpu.ram[addr - 0xC000];
        }else if (addr < 0xFF80) {
            throw "Stack push error on addr 0x" + addr.toString(16);
        } else {
            val = this.memory.cpu.stack[addr - 0xFF80];
        }

        let next = addr + 1;

        if(next == 0xE000){
            next = 0xFF80;
        } else if(next > 0xFFFE){
            next = 0xFFFE;
        }

        this.register.setSP(next);
        return val;
    }

    public popWord() : number {
        let high = this.popByte();
        let low = this.popByte();
        let val = high << 8 || low;
        return val;
    }

    public pushByte(val : number) : void {
        //Stack pointer decremets by 1 before address is written
        let addr = this.register.getSP();

        if (val > 0xFF) {
            throw "Stack push val is to big 0x" + val.toString(16);
        }

        if(addr < 0xA000){
            throw "Stack push error on addr 0x" + addr.toString(16);
        } else if(addr < 0xE000) {
            this.memory.cpu.ram[addr - 0xC000] = val;
        }else if (addr < 0xFF80) {
            throw "Stack push error on addr 0x" + addr.toString(16);
        } else {
            this.memory.cpu.stack[addr - 0xFF80] = val;
        }

        let next = addr  - 1;

        if(next == 0xFF7F){
            next = 0xE000;
        } else if(next < 0xA000){
            throw "stack overflow";
        }

        this.register.setSP(next);
    }

    public pushWord(val : number) : void {
        let high = val  >> 8;
        let low = val & 0xFF;
        this.pushByte(high);
        this.pushByte(low);
    }
}