/**
 * Created by hkamran on 12/6/2016.
 *
 * SOURCE: http://www.inf.ufrgs.br/~gozardo/gameboy-gamepad/index.html
 *
 */
export class Joypad {

    buttons: number = 0xF;
    direction: number = 0xF;
    type: number = 0x0;

    //   XX001111
    //   (garbage bit 7-6)(read type bit 5-4)(inputs bit 3-0)

    public Joypad() {
    }

    public writeByte(data: number): void {
        if (data == null) throw "Invalid data for joypad";
        this.type = 0xF0 - data;
    }

    public readByte(): number {
        if(this.type == 0xC0){
            return 0xFF;
        } else if (this.type == 0xD0) {
            return (this.buttons | this.type) & 0xFF;
        } else if (this.type == 0xE0) {
            console.log((this.direction | this.type) & 0xFF);
            return (this.direction | this.type) & 0xFF;
        } else {
            throw "Error unknown read type for joypad " + this.type.toString();
        }
    }

    //@formatter:off
    public pressRight = function () { console.log("Bp " + this.direction); this.direction &= 0xE };
    public releaseRight = function () {console.log("Br " + this.direction); this.direction |= 0x1};

    public pressLeft = function () {this.direction &= 0xD };
    public releaseLeft = function () {this.direction |= 0x2};

    public pressUp = function () { this.direction &= 0xB  };
    public releaseUp = function () {this.direction |= 0x4};

    public pressDown = function () { this.direction &= 0x7 };
    public releaseDown = function () {this.direction |= 0x8};

    public pressA = function () { this.buttons &= 0xE };
    public releaseA = function () {this.buttons |= 0x1};

    public pressB = function () { this.buttons &= 0xD };
    public releaseB = function () {this.buttons |= 0x2};

    public pressStart = function () {this.buttons &= 0x7};
    public releaseStart = function () {this.buttons |= 0x8};

    public pressSelect = function () {this.buttons &= 0xB};
    public releaseSelect = function () {this.buttons |= 0x4};
    //@formatter:on
}