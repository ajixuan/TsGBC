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
    public if: number = 0x0;

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
        id: 0,
        address: 0x0040
    };

    public static LCDC: Interrupt = {
        name: "LCDC",
        mask: 0x2,
        id: 1,
        address: 0x0048
    };

    public static TIMER: Interrupt = {
        name: "TIMER",
        mask: 0x4,
        id: 2,
        address: 0x0050
    };

    public static SERIAL: Interrupt = {
        name: "SERIAL",
        mask: 0x8,
        id: 3,
        address: 0x0058
    };

    public static JOYPAD: Interrupt = {
        name: "JOYPAD",
        mask: 0x10,
        id: 4,
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
        var mask = (1 << (interrupt.id + 1)) - 1;
        this.ie = this.ie & mask;
        this.ime = 0;
    }

    public setInterruptFlag(interrupt: Interrupt) {
        var mask = 1 << interrupt.id;
        this.ie = this.ie | mask;
    }

    public getInterrupt(): Interrupt {
        var result = (this.ie & this.if);

        if (result == Interrupts.VBLANK.mask) {
            this.clearInterruptFlag(Interrupts.VBLANK);
            return Interrupts.VBLANK;

        } else if (result == Interrupts.LCDC.mask) {
            this.clearInterruptFlag(Interrupts.LCDC);
            return Interrupts.LCDC;

        } else if (result == Interrupts.TIMER.mask) {
            this.clearInterruptFlag(Interrupts.TIMER);
            return Interrupts.TIMER;

        } else if (result == Interrupts.SERIAL.mask) {
            this.clearInterruptFlag(Interrupts.SERIAL);
            return Interrupts.SERIAL;

        } else if (result == Interrupts.JOYPAD.mask) {
            this.clearInterruptFlag(Interrupts.JOYPAD);
            return Interrupts.JOYPAD;

        } else {
            return null;
        }
    }
}

export interface Interrupt {
    name: string;
    mask: number;
    id: number;
    address: number;
}