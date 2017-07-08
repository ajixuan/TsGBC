import {Memory} from "../memory/memory";
/**
 * Created by hkamran on 12/6/2016.
 *
 * SOURCE: http://www.inf.ufrgs.br/~gozardo/gameboy-gamepad/index.html
 *
 */
export class Joypad {

    buttons : number = 0x0F;
    direction: number = 0x0F;
    type: number = 0x0;

    //   XX001111
    //   (garbage bit 7-6)(read type bit 5-4)(inputs bit 3-0)

    public Joypad() {
    }

    public writeByte(data: number): void {
        if (data == null) throw "Invalid data for joypad";
        this.type = data & 0x30;
    }

    public readByte(): number {
        if (this.type == 0x10) {
            return this.buttons & 0xFF;
        } else if (this.type == 0x20) {
            return this.direction & 0xFF;
        } else if (this.type == 0x30) {
            return 0x3F;
        } else if (this.type == 0x00) {
            return this.direction & 0xFF;
        } else {
            throw "Error unknown read type for joypad " + this.type.toString();
        }
    }

    //Directions

    public pressUp(): void {
        let mask =  0xB;
        this.direction &= mask;
    }

    public releaseUp(): void {
        let mask = 0x4;
        this.direction |= mask;
    }

    public pressDown(): void {
        let mask = 0x7;
        this.direction &= mask;
    }

    public releaseDown(): void {
        let mask = 0x8;
        this.direction |= mask;
    }

    public pressLeft(): void {
        let mask = 0xD;
        this.direction &= mask;
    }

    public releaseLeft(): void {
        let mask = 0x2;
        this.direction |= mask;
    }

    public pressRight(): void {
        let mask = 0xE;
        this.direction &= mask;
    }
    public releaseRight(): void {
        let mask = 0x1;
        this.direction |= mask;
    }

    //Buttons

    public pressA(): void {
        let mask = 0xE;
        this.buttons &= mask;
    }

    public releaseA(): void {
        let mask = 0x1;
        this.buttons &= mask;
    }

    public pressB(): void {
        let mask = 0xD;
        this.buttons &= mask;
    }

    public releaseB(): void {
        let mask = 0x2;
        this.buttons &= mask;
    }

    public pressStart(): void {
        let mask = 0x7;
        this.buttons &= mask;
    }

    public releaseStart(): void {
        let mask = 0x8;
        this.buttons &= mask;
    }

    public pressSelect(): void {
        let mask = 0xB;
        this.buttons &= mask;
    }

    public releaseSelect(): void {
        let mask = 0x4;
        this.buttons &= mask;
    }
}