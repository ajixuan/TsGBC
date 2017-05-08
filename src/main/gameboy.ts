import {Cpu} from "./cpu/cpu";
import {Ppu} from "./ppu/ppu";
import {Memory} from "./memory/memory";
import {Cartridge} from "./cartridge/cartridge";

export class GameBoy {

    public ppu : Ppu;
    public cpu : Cpu;
    public memory : Memory;
    public cartridge : Cartridge;

    public ticks : number = 0;

    constructor() {
        this.cartridge = null
        this.memory = new Memory();
        this.cpu = new Cpu(this.memory);
        this.ppu = new Ppu(this.memory);
    }


    public load(url : string) : void{
        this.cartridge = Cartridge.load(url, this.memory);
        this.memory.cartridge = this.cartridge;

    }

    public reset() : void {
        this.cpu.reset();
        this.ticks = 0;
    }

    public tick() : void {
        this.cpu.tick();
        this.ppu.renderscan();
        this.ticks++;
    }

    public run() : void {
        while(true){
            this.cpu.tick();
            this.ppu.renderscan();
            this.ticks++;
        }
    }

    public tickFor() : void {
        //TODO
    }

}