/**
 * Created by hkamran on 12/11/2016.
 */

import {Controller} from "./controller";
export class None implements Controller {

    public rom : number[];

    constructor( rom : number[]) {
        this.rom = rom;
    }

    public readByte(addr: number) : number {
        if (addr < 0x8000) {
            return this.rom[addr];
        } else if (addr < 0xC000 && addr >= 0xA000) {
            return 0;
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