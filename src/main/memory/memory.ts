import {Cartridge} from "../cartridge/cartridge";
import {Interrupts} from "../io/interrupts";
import {Registers} from "../ppu/registers"

/**
 * Created by hkamran on 12/5/2016.
 */


export class Memory {

    public io: number[] = [0x80];
    public cartridge: Cartridge;
    public interrupt: Interrupts = new Interrupts();

    public ppu: any = new class {
        public vram: Array<number> = Array.apply(null, Array(0x2000)).map(Number.prototype.valueOf, 0);
        public oam: Array<number> = Array.apply(null, Array(0xA0)).map(Number.prototype.valueOf, 0);
        public registers: Registers = new Registers(this);
    };

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
            this.ppu.vram[addr - 0x8000] = val;
            this.ppu.updateTile(addr);
        } else if (addr < 0xC000) {
            this.cartridge.writeByte(addr, val);
        } else if (addr < 0xFE00) {
            this.cpu.ram[(addr - 0xC000) % 0x2000] = val;
        } else if (addr < 0xFEA0) {
            this.ppu.oam[addr - 0xFE00] = val;
        } else if (addr < 0xFF80) {
            if (addr < 0xFF00) {
                throw "Invalid write on unused i/o at 0x" + addr.toString(16) + " with 0x" + val.toString(16);
            } else if (addr == 0xFF0F) {
                this.interrupt.if = val & 0xFF;
            }

            //GPU registers
            else if (addr == 0xFF40) {
                this.ppu.registers.lcdc = val;
            } else if (addr == 0xFF41) {
                this.ppu.registers.stat = val;
            } else if (addr == 0xFF42) {
                this.ppu.registers.scy = val;
            } else if (addr == 0xFF43) {
                this.ppu.registers.scx = val;
            } else if (addr == 0xFF44) {
                this.ppu.registers.ly = val;
            } else if (addr == 0xFF45) {
                this.ppu.registers.lyc = val;
            } else if (addr == 0xFF4A) {
                this.ppu.registers.wy= val;
            } else if (addr == 0xFF4B) {
                this.ppu.registers.wx = val;
            } else if (addr < 0xFF4C) {
                this.io[addr - 0xFF00] = val;
            } else if (addr == 0xFF68) {
                this.ppu.registers.bcps = val;
            } else if (addr == 0xFF69) {
                this.ppu.registers.bcpd= val;
            } else if (addr == 0xFF6A) {
                this.ppu.registers.ocps = val;
            } else if (addr == 0xFF6B) {
                this.ppu.registers.ocpd = val;
            }

            else if (addr < 0xFF80) {
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
            val = this.ppu.vram[addr - 0x8000];
        } else if (addr < 0xC000) {
            return this.cartridge.readByte(addr);
        } else if (addr < 0xFE00) {
            val = this.cpu.ram[(addr - 0xC000) % 0x2000];
        } else if (addr < 0xFEA0) {
            val = this.ppu.oam[addr - 0xFE00];
        } else if (addr < 0xFF80) {
            if (addr < 0xFF00) {
                throw "Invalid read on unused i/o at 0x" + addr.toString(16);
            } else if (addr == 0xFF0F) {
                return this.interrupt.if & 0xFF;
            }

            //GPU registers
            else if (addr == 0xFF40) {
                return this.ppu.registers.lcdc;
            } else if (addr == 0xFF41) {
                return this.ppu.registers.stat;
            } else if (addr == 0xFF42) {
                return this.ppu.registers.scy;
            } else if (addr == 0xFF43) {
                return this.ppu.registers.scx;
            } else if (addr == 0xFF44) {
                return this.ppu.registers.ly;
            } else if (addr == 0xFF45) {
                return this.ppu.registers.lyc;
            } else if (addr == 0xFF4A) {
                return this.ppu.registers.wy;
            } else if (addr == 0xFF4B) {
                return this.ppu.registers.wx;
            } else if (addr < 0xFF4C) {
                val = this.io[addr - 0xFF00];
            } else if (addr == 0xFF68) {
                return this.ppu.registers.bcps;
            } else if (addr == 0xFF69) {
                return this.ppu.registers.bcpd;
            } else if (addr == 0xFF6A) {
                return this.ppu.registers.ocps;
            } else if (addr == 0xFF6B) {
                return this.ppu.registers.ocpd;
            }

            else if (addr < 0xFF80) {
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

