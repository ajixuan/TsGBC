/**
 * Created by hkamran on 12/19/2016.
 */

export class Interrupts {

    /*
     Name: IF (Register)
     Size: 8 bits
     Address: 0xFF0F
     Function:  Holds interrupt requests.

     XXX43210
     |||||------ Vertical Blanking
     ||||------- LCDC
     |||-------- Timer
     ||--------- Serial
     |---------- Controller
     */
    public if: number = 0xE1;

    /*
     Name: IE (Register)
     Size: 8 bits
     Address: 0xFFFF
     Function:  Disable/Enable particular interrupt types.

     XXX43210
     |||||------ Vertical Blanking
     ||||------- LCDC
     |||-------- Timer
     ||--------- Serial
     |---------- Controller
     */
    public ie: number = 0x0;

    /*
     Name: IME (Interrupt Master Enable)
     Size: 1 bit
     Function: master flag to enable/disable all registers.

     Executing the operation DI opcode to disable all interrupts.
     Executing the operation IE opcode to enable all interrupts.
     */
    public ime: number = 0x0;


    public static VBLANK: Interrupt = {
        name: "VBLANK",
        mask: 0x1,
        priority: 1,
        address: 0x0040
    };

    public static LCDC: Interrupt = {
        name: "LCDC",
        mask: 0x2,
        priority: 2,
        address: 0x0048
    };

    public static TIMER: Interrupt = {
        name: "TIMER",
        mask: 0x4,
        priority: 3,
        address: 0x0050
    };

    public static SERIAL: Interrupt = {
        name: "SERIAL",
        mask: 0x8,
        priority: 4,
        address: 0x0058
    };

    public static JOYPAD: Interrupt = {
        name: "JOYPAD",
        mask: 0x10,
        priority: 5,
        address: 0x0060
    };

    constructor() {
    }

    public disableAllInterrupts(): void {
        this.ime = 0;
    }

    public enableAllInterrupts(): void {
        this.ime = 1;
    }

    public hasInterrupts(): boolean {
        let isInterruptEnabled: boolean = (this.ime == 1);
        let hasInterrupt: boolean = (this.ie != 0);

        return isInterruptEnabled && hasInterrupt;
    }

    public clearInterruptFlag(interrupt: Interrupt) {
        this.if &= ~interrupt.mask;
        this.ime = 0;
    }

    public setRequestInterrupt(interrupt : Interrupt){
        this.if |= interrupt.mask;
    }

    public setInterruptFlag(interrupt: Interrupt) {
        this.ie |= interrupt.mask;
    }

    public getInterrupt(): Interrupt {
        let result = (this.ie & this.if);

        if (result == Interrupts.VBLANK.mask) {
            return Interrupts.VBLANK;

        } else if (result == Interrupts.LCDC.mask) {
            return Interrupts.LCDC;

        } else if (result == Interrupts.TIMER.mask) {
            return Interrupts.TIMER;

        } else if (result == Interrupts.SERIAL.mask) {
            return Interrupts.SERIAL;

        } else if (result == Interrupts.JOYPAD.mask) {
            return Interrupts.JOYPAD;

        } else {
            return null;
        }
    }
}

export interface Interrupt {
    name: string;
    mask: number;
    priority: number;
    address: number;
}