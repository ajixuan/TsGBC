import {Cartridge} from "../cartridge/cartridge";
import {Interrupts} from "../io/interrupts";
import {Ppu} from '../ppu/ppu'
import {Joypad} from "../io/joypad";
import {Debugger} from "../debugger";
import {Cpu} from "../cpu/cpu";

/**
 * Created by hkamran on 12/5/2016.
 */


export class Memory {

    public lastChange = {
        addr : null,
        val  : null
    }
    public cartridge: Cartridge;
    public joypad: Joypad = new Joypad();
    public vram: Array<number> = Array(0x2000).fill(0);
    public oam: Array<number>  = Array(0xA0).fill(0);

    public cpu: any = new class {
        public ram: Array<number> = Array(0x2000).fill(0);
        public stack: Array<number> = Array(0x7F).fill(0);
    };
    public ppu: Ppu;
    public interrupts : Interrupts = new Interrupts();
    public nr : Array<number> = Array(0x16).fill(0);

    public writeByte(addr: number, val: number): void {
        if (val == null || val > 0xFF || addr == null || addr > 0xFFFF) {
            throw new Error("Invalid write at 0x" + addr.toString(16) + " with " + val.toString(16));
        } else if (addr < 0) {
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
        } else if (addr < 0xFEA0) { //OAM
            this.ppu.requestWrite(addr, val);
        } else if (addr < 0xFF80) {
            if (addr < 0xFF00) {
                //Empty but usable for io
                //throw new Error("Invalid write on unused i/o at 0x" + addr.toString(16) + " with 0x" + val.toString(16));
            } else if (addr < 0xFF0F) {
                switch (addr & 0xFF) {
                    case 0: this.joypad.writeByte(val); break;
                    case 1: break; //SB
                    case 2: break; //SC
                    case 4: Cpu.CLOCK.div = 0; break;
                    case 5: Cpu.CLOCK.tima = val; break;
                    case 6: Cpu.CLOCK.tma = val; break;
                    case 7: Cpu.CLOCK.tma = val & 7; break;
                }
            } else if (addr == 0xFF0F) {
                this.interrupts.if = 0xE0 | val;
            } else if (addr < 0xFF6C) {
                if(addr <=0xFF26){
                    this.nr[addr - 0xFF10] = val;
                } else if (addr == 0xFF40) {
                    this.ppu.registers.lcdc.setAll(val);
                } else if (addr == 0xFF41){
                } else if (addr == 0xFF42) {
                    this.ppu.registers.scy = val;
                } else if (addr == 0xFF43) {
                    this.ppu.registers.scx = val;
                } else if (addr == 0xFF44) {
                    this.ppu.registers.ly = val;

                } else if (addr == 0xFF45) {
                    this.ppu.registers.lyc = val;
                }
                //DMA
                else if (addr == 0xFF46) {
                    //Transfers 40 x 32 bits of data
                    //val is the starting address of transfer
                    //val is always the upper 8 bits, so need to be shifted
                    //160 ms to complete
                    //cpu can only access FF80-FFFE

                    let source = val << 8;
                    for (let i = 0; i <= 0x9F; i++) {
                        let data = this.readByte(source + i);
                        this.oam[i] = data;
                        this.ppu.updateOamSprite(0xFE00 + i);
                    }
                } else if (addr < 0xFF4A) {


                } else if (addr == 0xFF4A) {
                    this.ppu.registers.wy = val;

                } else if (addr == 0xFF4B) {
                    this.ppu.registers.wx = val;

                } else if (addr == 0xFF4D){
                    this.ppu.registers.setSpeed(val);
                } else if (addr == 0xFF68) {
                    this.ppu.registers.bcps = val;

                } else if (addr == 0xFF69) {
                    this.ppu.registers.bcpd = val;

                } else if (addr == 0xFF6A) {
                    this.ppu.registers.ocps = val;

                } else if (addr == 0xFF6B) {
                    this.ppu.registers.ocpd = val;
                }
            }
        } else if (addr < 0xFFFF) {
            // if(addr == 0xFF81){
            //     console.log("write 0xFF81: " + val);
            // } else if(addr == 0xFF80){
            //     console.log("write 0xFF80: " + val);
            // }
            this.cpu.stack[addr - 0xFF80] = val;
        } else if (addr == 0xFFFF) {
            this.interrupts.ie = val;
        } else {
            throw "Invalid write led to unknown address at 0x" + addr.toString(16) + " with 0x" + val.toString(16);
        }

        //Debugger
        if(Debugger.status.memory && Debugger.status.switch){
            if(addr >= 0x8000){
                document.getElementById(addr.toString()).innerHTML = val.toString(16);
            }
        }

        this.lastChange.addr = addr;
        this.lastChange.val = val;
    }

    public writeWord(addr:number, val:number):void{
            this.writeByte(addr+1, val >> 8);
            this.writeByte(addr, val & 0xFF);
            this.lastChange.addr = addr;
            this.lastChange.val = val;     
    }

    public readByte(addr: number): number {

        if (addr == null || addr > 0xFFFF) {
            throw "Invalid read at 0x" + addr.toString(16);
        } else if (addr < 0) {
            addr &= 0xFFFF;
        }

        let val = null;
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
                return 0x00;
            } else if (addr < 0xFF0F) {
                switch (addr & 0xFF) {
                    case 0: val = this.joypad.readByte(); break;
                    case 1: val = 0xFF; break; //SB
                    case 2: val = 0xFF; break; //SC
                    case 3: val = 0xFF; break;
                    case 4: val = Cpu.CLOCK.div; break;
                    case 5: val = Cpu.CLOCK.tima; break;
                    case 6: val = Cpu.CLOCK.tma; break;
                    case 7: val = Cpu.CLOCK.tac; break;
                    default: val = 0xFF;
                }
            } else if (addr == 0xFF0F) {
                return this.interrupts.if;
            } else if (addr < 0xFF6C) {

                if(addr <=0xFF26){
                    val = this.nr[addr - 0xFF10];
                } else if (addr == 0xFF40) {
                    val = this.ppu.registers.lcdc.getAll();
                } else if(addr == 0xFF41){
                    val = this.ppu.registers.stat.getAll();
                } else if (addr == 0xFF42) {
                    val = this.ppu.registers.scy;
                } else if (addr == 0xFF43) {
                    val = this.ppu.registers.scx;
                } else if (addr == 0xFF44) {
                    val = this.ppu.registers.ly;
                } else if (addr == 0xFF45) {
                    val = this.ppu.registers.lyc;
                } else if (addr == 0xFF46) {
                    val = 0xFF;
                } else if (addr == 0xFF4A) {
                    val = this.ppu.registers.wy;
                } else if (addr == 0xFF4B) {
                    val = this.ppu.registers.wx;
                } else if (addr == 0xFF4D){
                    val = this.ppu.registers.speed;
                }  else if (addr < 0xFF68) {
                    val = 0xFF;
                } else if (addr == 0xFF68) {
                    val = this.ppu.registers.bcps;
                } else if (addr == 0xFF69) {
                    val = this.ppu.registers.bcpd;
                } else if (addr == 0xFF6A) {
                    val = this.ppu.registers.ocps;
                } else if (addr == 0xFF6B) {
                    val = this.ppu.registers.ocpd;
                }
            } else if (addr < 0xFF80) {
                val = 0xFF;
                //throw "Invalid read on unused i/o at 0x" + addr.toString(16);
            }
        } else if (addr < 0xFFFF) {
            val = this.cpu.stack[addr - 0xFF80];

            // if(addr == 0xFF81){
            //     console.log("0xFF81: " + val);
            // } else if(addr == 0xFF80){
            //     console.log("0xFF80: " + val);
            // }
        } else if (addr == 0xFFFF) {
            val = this.interrupts.ie;
        } else {
            throw "Invalid read led to unknown address at 0x" + addr.toString(16);
        }

        if (val == null || val > 0xFF) {
            throw "Invalid read led to unknown value at 0x" + addr.toString(16) + " with " + val;
        }

        return val;
    }

    public readWord(addr: number): number {
        let high = this.readByte(addr + 1);
        let low = this.readByte(addr);
        return high << 8 | low;
    }

}

