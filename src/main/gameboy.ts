import {Cpu} from "./cpu/cpu";
import {Ppu} from "./ppu/ppu";
import {Memory} from "./memory/memory";
import {Cartridge} from "./memory/cartridge";

export class GameBoy {

    public ppu : Ppu;
    public cpu : Cpu;
    public memory : Memory;
    public cartidge : Cartridge;

    constructor() {
        this.memory = new Memory();
        this.cartidge = new Cartridge(this.memory);
        this.cpu = new Cpu(this.memory);
        this.ppu = new Ppu(this.memory);
    }
}