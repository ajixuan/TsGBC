import {Cartridge} from "../cartridge/cartridge";
/**
 * Created by hkamran on 12/5/2016.
 */


export class Memory {

    public io : number[] = [0x80];
    public cartridge : Cartridge;

    public ppu : any = new class {
        public vram : number[] = [0x2000];
        public oam : number[] = [0xA0];
    };

    public cpu : any = new class {
        public ram : number[] = [0x2000];
        public stack : number[] = [0x7F];
        public interrupt : number[] = [0x1];
    };

    public interrupts : any = new class {
        public if : number = 0x0;
        public ie : number = 0x0;
        public ime : number = 0x0;
    };



    public writeByte(addr: number, val : number): void {
        if (val == null  || val > 0xFF || addr == null || addr > 0xFFFF) {
            throw "Invalid write at 0x" + addr.toString(16) + " with " + val;
        }

        if (addr < 0x8000) {
            this.cartridge.writeByte(addr, val);
        } else if (addr < 0xA000) {
            this.ppu.vram[addr - 0x8000] = val;
        } else if (addr < 0xC000) {
            this.cartridge.writeByte(addr, val);
        } else if (addr < 0xFE00) {
            this.cpu.ram[(addr - 0xC000) & 0x2000] = val;
        } else if (addr < 0xFEA0) {
            this.ppu.oam[addr - 0xFE00] = val;
        } else if (addr < 0xFF80) {
            if (addr < 0xFF00) {
                throw "Invalid write on unused i/o at 0x" + addr.toString(16) + " with 0x" + val.toString(16);
            } else if (addr < 0xFF4C) {
                this.io[addr - 0xFF00] = val;
            } else if (addr < 0xFF80) {
                throw "Invalid write on unused i/o at 0x" + addr.toString(16) + " with 0x" + val.toString(16);
            }
        } else if (addr < 0xFFFF) {
            this.cpu.stack[addr - 0xFF80] = val;
        } else if (addr == 0xFFFF) {
            this.cpu.interrupt[addr - 0xFFFF] = val;
        } else {
            throw "Invalid write led to unknown address at 0x" + addr.toString(16) + " with 0x" + val.toString(16);
        }
    }

    public readByte(addr: number): number {
        if (addr == null  || addr > 0xFFFF) {
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
            val = this.cpu.ram[(addr - 0xC000) & 0x2000];
        } else if (addr < 0xFEA0) {
            val = this.ppu.oam[addr - 0xFE00];
        } else if (addr < 0xFF80) {
            if (addr < 0xFF00) {
                throw "Invalid read on unused i/o at 0x" + addr.toString(16);
            } else if (addr < 0xFF4C) {
                val = this.io[addr - 0xFF00];
            } else if (addr < 0xFF80) {
                throw "Invalid write on unused i/o at 0x" + addr.toString(16);
            }
        } else if (addr < 0xFFFF) {
            val = this.cpu.stack[addr - 0xFF80];
        } else if (addr == 0xFFFF) {
            val = this.cpu.interrupt[addr - 0xFFFF];
        } else {
            throw "Invalid read led to unknown address at 0x" + addr.toString(16);
        }

        if (val == null || val > 0xFF) {
            throw "Invalid read led to unknown value at 0x" + addr.toString(16) + " with " + val;
        }

        return null;
    }

    public writeWord(addr: number, val : number): void {
        //TODO this might be wrong
        var high = val >> 8;
        var low = val & 0xFF;

        this.writeByte(addr, high);
        this.writeByte(addr + 1, low);
    }

    public readWord(addr: number): number {
        var high = this.readByte(addr + 1);
        var low = this.readByte(addr);
        var word = high << 8 || low;

        return word;
    }

}

