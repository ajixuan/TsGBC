/**
 * Created by hkamran on 12/19/2016.
 */
import {Memory} from '../memory/memory';
export class Interrupts {

    public memory : Memory;

    public static VBLANK : Interrupt = {
        name : "VBLANK",
        id : 0x1,
        address : 0x0040
    };

    public static LCDC : Interrupt = {
        name : "LCDC",
        id : 0x2,
        address : 0x0048
    };

    public static TIMER : Interrupt = {
        name : "TIMER",
        id : 0x4,
        address : 0x0050
    };

    public static SERIAL : Interrupt = {
        name : "SERIAL",
        id : 0x8,
        address : 0x0058
    };

    public static JOYPAD : Interrupt = {
        name : "JOYPAD",
        id : 0x10,
        address : 0x0060
    };

    constructor(memory : Memory) {
        this.memory = memory;
    }

    public isInterruptEnabled() : boolean {
        return ((this.memory.interrupts.ime & 0x1) == 1);
    }

}

export interface Interrupt {
    name : string;
    id : number;
    address : number;
}