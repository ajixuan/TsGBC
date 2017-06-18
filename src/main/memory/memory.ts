import {Cartridge} from "../cartridge/cartridge";
import {Interrupts} from "../io/interrupts";
import {Ppu} from '../ppu/ppu'
import {Io} from './io'
/**
 * Created by hkamran on 12/5/2016.
 */


export class Memory {

    public cartridge: Cartridge;
    public interrupt: Interrupts = new Interrupts();
    public io : Io = new Io();

    public vram: Array<number> = Array.apply(null, Array(0x2000)).map(Number.prototype.valueOf, 0);
    public oam: Array<number> = Array.apply(null, Array(0xA0)).map(Number.prototype.valueOf, 0);
    public ppu : Ppu;

    public cpu: any = new class {
        public ram: Array<number> = Array.apply(null, Array(0x2000)).map(Number.prototype.valueOf, 0);
        public stack: Array<number> = Array.apply(null, Array(0x7F)).map(Number.prototype.valueOf, 0);
    };

    public writeByte(addr: number, val: number): void {
        if (val == null || val > 0xFF || addr == null || addr > 0xFFFF) {
            throw "Invalid write at 0x" + addr.toString(16) + " with " + val;
        } else if(addr < 0){
            addr &= 0xFFFF;
        }

        if (addr < 0x8000) {
            this.cartridge.writeByte(addr, val);
        } else if (addr < 0xA000) {
            this.ppu.requestWrite(addr, val);
        } else if (addr < 0xC000) {
            this.cartridge.writeByte(addr, val);
        } else if (addr < 0xFE00) {
            this.cpu.ram[(addr - 0xC000) % 0x2000] = val;
        } else if (addr < 0xFEA0) {
            this.ppu.requestWrite(addr, val);
        } else if (addr < 0xFF80) {
            if (addr < 0xFF00) {
                //Empty but usable for io
                //throw "Invalid write on unused i/o at 0x" + addr.toString(16) + " with 0x" + val.toString(16);
            } else if (addr < 0xFF08) {
              switch(addr & 0xFF){
                  case 0:
                      this.io.setP1(val);
                      break;
                  case 1:
                      //SB
                      break;
                  case 2:
                      //SC
                      break;
                  case 4:
                      this.io.setDiv(val);
                      break;
                  case 5:
                      this.io.setTima(val);
                      break;
                  case 6:
                      this.io.setTma(val);
                      break;
                  case 7:
                      this.io.setTac(val);
                      break;
              }
            } else if (addr == 0xFF0F) {
                this.interrupt.if = val & 0xFF;
            } else if (addr < 0xFF6C) {
                this.ppu.requestWrite(addr, val);
            }
        } else if (addr < 0xFFFF) {
            this.cpu.stack[addr - 0xFF80] = val;
        } else if (addr == 0xFFFF) {
            this.interrupt.ie = val & 0xFF;
        } else {
            throw "Invalid write led to unknown address at 0x" + addr.toString(16) + " with 0x" + val.toString(16);
        }
    }

    public readByte(addr: number): number {

        if (addr == null || addr > 0xFFFF) {
                throw "Invalid read at 0x" + addr.toString(16);
        } else if(addr < 0){
            addr &= 0xFFFF;
        }

        var val = null;
        if (addr < 0x8000) {
            return this.cartridge.readByte(addr);
        } else if (addr < 0xA000) {
            val = this.ppu.requestRead(addr);
        } else if (addr < 0xC000) {
            return this.cartridge.readByte(addr);
        } else if (addr < 0xFE00) {
            val = this.cpu.ram[(addr - 0xC000) % 0x2000];
        } else if (addr < 0xFEA0) {
            val = this.ppu.requestRead(addr);
        } else if (addr < 0xFF80) {
            if (addr < 0xFF00) {
                //Empty but usable for io
                throw "Invalid read on unused i/o at 0x" + addr.toString(16);
            } else if (addr < 0xFF08) {
                switch(addr & 0xFF){
                    case 0:
                        val = this.io.getP1();
                        break;
                    case 1:
                        //SB
                        break;
                    case 2:
                        //SC
                        break;
                    case 4:
                        val = this.io.getDiv();
                        break;
                    case 5:
                        val = this.io.getTima();
                        break;
                    case 6:
                        val = this.io.getTma();
                        break;
                    case 7:
                        val = this.io.getTac();
                        break;
                }
            } else if (addr == 0xFF0F) {
                return this.interrupt.if & 0xFF;
            } else if (addr < 0xFF6C) {
                return this.ppu.requestRead(addr);
            } else if (addr < 0xFF80) {
                throw "Invalid read on unused i/o at 0x" + addr.toString(16);
            }
        } else if (addr < 0xFFFF) {
            val = this.cpu.stack[addr - 0xFF80];
        } else if (addr == 0xFFFF) {
            val = this.interrupt.ie;
        } else {
            throw "Invalid read led to unknown address at 0x" + addr.toString(16);
        }

        if (val == null || val > 0xFF) {
            throw "Invalid read led to unknown value at 0x" + addr.toString(16) + " with " + val;
        }

        return val;
    }

    public writeWord(addr: number, val: number): void {
        //TODO this might be wrong
        var high = val >> 8;
        var low = val & 0xFF;

        this.writeByte(addr, high);
        this.writeByte(addr + 1, low);
}

    public readWord(addr: number): number {
        var high = this.readByte(addr + 1);
        var low = this.readByte(addr);
        return high << 8 | low;
    }

}

