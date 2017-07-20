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

    public press = {
        right : function () {
          this.direction &= ~0x1;
        },

        left : function () {
            this.direction &= ~0x2;
        },
        up : function () {
            this.direction &= ~0x4;
        },

        down: function () {
            this.direction &= ~0x8;
        },
        a : function () {
            this.buttons &= ~0x1;
        },
        b : function () {
            this.buttons &= ~0x2;
        },
        select: function () {
            this.buttons &= ~0x4;
        },
        start: function () {
            this.buttons &= ~0x8;
        }
    }


    public release = {
        right : function () {
            this.direction |= 0x1;
        },

        left : function () {
            this.direction |= 0x2;
        },
        up : function () {
            this.direction |= 0x4;
        },

        down: function () {
            this.direction |= 0x8;
        },
        a : function () {
            this.buttons |= 0x1;
        },
        b : function () {
            this.buttons |= 0x2;
        },
        select: function () {
            this.buttons |= 0x4;
        },
        start: function () {
            this.buttons |= 0x8;
        }
    }
}