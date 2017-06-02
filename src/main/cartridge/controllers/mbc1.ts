/**
 * Created by hkamran on 12/11/2016.
 */
import {Controller} from "./controller";
export class MBC1 implements Controller {

    public rom : number[];

    constructor( rom : number[]) {
        this.rom = rom;
    }

    public readByte(addr: number) : number {

        if(addr < 0x2000){


        } else if (addr < 0x4000) {
            return this.rom[addr];
        } else if (addr < 0x6000) {


        } else if (addr < 8000){


        } else if (addr >= 0xA000 && addr < 0xC000) {


        }


        throw "Invalid read at 0x" + addr.toString(16) + " at cartridge controller.";
    }
    public writeByte(addr: number, val : number) : void {
        if (addr < 0x8000) {
            this.rom[addr] = val;
            return;
        } else if (addr < 0xC000 && addr >= 0xA000) {
            return;
        }

        throw "Invalid write at 0x" + addr.toString(16) + " at cartridge controller.";
    }
}