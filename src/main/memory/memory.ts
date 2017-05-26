import {Cartridge} from "../cartridge/cartridge";
import {Interrupts} from "../io/interrupts";
import {Ppu} from '../ppu/ppu'
/**
 * Created by hkamran on 12/5/2016.
 */


export class Memory {

    private bios:number[] =  [0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D, 0x00, 0x0B,
    0x03, 0x73, 0x00, 0x83, 0x00, 0x0C, 0x00, 0x0D, 0x00, 0x08, 0x11, 0x1F, 0x88, 0x89, 0x00, 0x0E,
    0xDC, 0xCC, 0x6E, 0xE6, 0xDD, 0xDD, 0xD9, 0x99, 0xBB, 0xBB, 0x67, 0x63, 0x6E, 0x0E, 0xEC, 0xCC,
    0xDD, 0xDC, 0x99, 0x9F, 0xBB, 0xB9, 0x33, 0x3E];

    public io: number[] = [0x80];
    public cartridge: Cartridge;
    public interrupt: Interrupts = new Interrupts();

    public vram: Array<number> = Array.apply(null, Array(0x1000)).map(Number.prototype.valueOf, 0);
    public oam: Array<number> = Array.apply(null, Array(0xA0)).map(Number.prototype.valueOf, 0);
    public ppu : Ppu;

    public cpu: any = new class {
        public ram: Array<number> = Array.apply(null, Array(0x2000)).map(Number.prototype.valueOf, 0);
        public stack: Array<number> = Array.apply(null, Array(0x7F)).map(Number.prototype.valueOf, 0);
    };

    public writeByte(addr: number, val: number): void {
        if (val == null || val > 0xFF || addr == null || addr > 0xFFFF) {
            throw "Invalid write at 0x" + addr.toString(16) + " with " + val;
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
                throw "Invalid write on unused i/o at 0x" + addr.toString(16) + " with 0x" + val.toString(16);
            } else if (addr == 0xFF0F) {
                this.interrupt.if = val & 0xFF;
            } else if (addr < 0xFF6C) {
                this.ppu.requestWrite(addr, val);
            } else if (addr < 0xFF80) {
                throw "Invalid write on unused i/o at 0x" + addr.toString(16) + " with 0x" + val.toString(16);
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
        }

        var val = null;
        if (addr < 0x8000) {
            return this.cartridge.readByte(addr);
        } else if (addr < 0xA000) {
            val = this.vram[addr - 0x8000];
        } else if (addr < 0xC000) {
            return this.cartridge.readByte(addr);
        } else if (addr < 0xFE00) {
            val = this.cpu.ram[(addr - 0xC000) % 0x2000];
        } else if (addr < 0xFEA0) {
            val = this.oam[addr - 0xFE00];
        } else if (addr < 0xFF80) {
            if (addr < 0xFF00) {
                throw "Invalid read on unused i/o at 0x" + addr.toString(16);
            } else if (addr == 0xFF0F) {
                return this.interrupt.if & 0xFF;
            } else if (addr < 0xFF4C) {
                val = this.io[addr - 0xFF00];
            } else if (addr < 0xFF6C) {
                return this.ppu.readByte(addr);
            } else if (addr < 0xFF80) {
                throw "Invalid write on unused i/o at 0x" + addr.toString(16);
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

