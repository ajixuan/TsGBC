/**
 * Created by hkamran on 12/11/2016.
 */
import {Controller} from "./controller";
export class MBC1 implements Controller {

    public rom : number[];
    public ram : number[];
    public eram : number;
    public mode : number;
    public rombank : number = 0;
    public rambank : number = 0;

    constructor( rom : number[]) {
        this.rom = rom;
        this.ram = Array(null, 0x2000 * 3).map(Number.prototype.valueOf, 0);
        this.eram = 0;
    }

    public readByte(addr: number) : number {

        //Rom bank
        if (addr < 0x8000) {
            this.rombank = 0;
            return this.rom[addr  + (this.rombank * 0x4000)];
        }
        //Ram bank
        else if (addr >= 0xA000 && addr < 0xC000) {
            this.rambank = 0;
            if(this.eram){
                return this.ram[addr + (this.rambank * 0x2000)]
            }
            return 0xFF;
        }


        throw "Invalid read at 0x" + addr.toString(16) + " in cartridge controller.";
    }

    public writeByte(addr: number, val : number) : void {
        switch(addr & 0xF000){
            case 0x0000:
            case 0x1000:
                if(val == 0x0A){
                    this.eram = 1;
                } else {
                    this.eram = 0;
                }
                break;
            case 0x2000:
            case 0x3000:
                //Rom bank low 5 bits
                //Switch between banks 1 and 31
                this.rombank &= 0x60;
                switch(val){
                    case 0x00:
                    case 0x20:
                    case 0x40:
                    case 0x60:
                        val++;
                }
                this.rombank = val;
                break;
            case 0x4000:
            case 0x5000:
                //Ram
                if(this.mode){
                    this.rambank = val;
                    break;
                }

                if(val > 0x7F) {
                    throw "ERROR: bank 0x" + val.toString(16) + " does not exist";
                }
                this.rombank |= (val << 5);
                break;
            case 0x6000:
            case 0x7000:
                //Rom mode
                this.mode = val;
                break;
            case 0xA000:
            case 0xB000:
                this.eram
                break;
        }

    }
}