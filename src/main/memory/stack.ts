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
        var val = this.memory.readByte(addr);

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
        this.memory.writeByte(addr, val);
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