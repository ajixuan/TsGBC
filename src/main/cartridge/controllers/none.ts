/**
 * Created by hkamran on 12/11/2016.
 */

import {Controller} from "./controller";
export class None implements Controller {

    public rom : number[];
    public eRam : Array<number>;

    constructor( rom : number[]) {
        this.rom = rom;
        this.eRam = Array.apply(null, Array(0x2000)).map(Number.prototype.valueOf, 0);
    }

    public readByte(addr: number) : number {
        if (addr < 0x8000) {
            return this.rom[addr];
        } else if (addr < 0xC000 && addr >= 0xA000) {
            return this.eRam[addr - 0xA000];
        } else {
            throw "Invalid read at 0x" + addr.toString(16) + " at cartridge controller.";
        }
    }
    public writeByte(addr: number, val : number) : void {
        if (addr < 0x8000) {

            //Cartridge data is read only
            // this.rom[addr] = val;
        } else if (addr < 0xC000 && addr >= 0xA000) {
            this.eRam[addr - 0xA000] = val;
        } else {
            throw "Invalid write at 0x" + addr.toString(16) + " at cartridge controller.";
        }
    }
}