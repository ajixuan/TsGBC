import {Cpu} from "./cpu/cpu";
import {Ppu} from "./ppu/ppu";

export class GameBoy {

    public cpu : Cpu;
    public ppu : Ppu;

    constructor() {
        this.cpu = new Cpu();
        this.ppu = new Ppu();
    }
}