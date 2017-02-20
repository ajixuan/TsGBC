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
        var addr = this.register.getSP();

        if (addr > 0x7F) {
            throw "Stack pop error on addr 0x" + addr.toString(16);
        }

        var val = this.memory.cpu.stack[addr];

        var next = addr + 1 > 0xFFFE ? 0xFFFE : addr + 1;
        this.register.setSP(next);
        return val;
    }

    public popWord() : number {
        var high = this.popByte();
        var low = this.popByte();
        var val = high << 8 || low;
        return val;
    }

    public pushByte(val : number) : void {
        var addr = this.register.getSP();

        if (addr < 0xFF80) {
            throw "Stack push error on addr 0x" + addr.toString(16);
        }

        if (val > 0xFF) {
            throw "Stack push val is to big 0x" + val.toString(16);
        }

        this.memory.cpu.stack[addr] = val;
        var next = addr  - 1 < 0xFF80 ? 0xFF80 : addr - 1;
        this.register.setSP(next);
    }

    public pushWord(val : number) : void {
        var high = val  >> 8;
        var low = val & 0xFF;
        this.pushByte(high);
        this.pushByte(low);
    }
}