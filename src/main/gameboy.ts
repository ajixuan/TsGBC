import {Cpu} from "./cpu/cpu";
import {Ppu} from "./ppu/ppu";

export class GameBoy {


    public ppu : Ppu;
    public cpu : Cpu;

    constructor() {
        this.cpu = new Cpu();
        this.ppu = new Ppu();
    }
}