import {Cpu} from "./cpu/cpu";
import {Ppu} from "./ppu/ppu";
import {Memory} from "./memory/memory";
import {Cartridge} from "./cartridge/cartridge";

export class GameBoy {

    public ppu: Ppu;
    public cpu: Cpu;
    public memory: Memory;
    public cartridge: Cartridge;
    public ticks: number = 0;
    public counts: number = 0;
    public running: boolean = false;
    public timeout: any;
    public interval: number = 1000;

    //Ticks per frame
    public tpf: number = 20;

    constructor() {
        this.cartridge = null
        this.memory = new Memory();
        this.cpu = new Cpu(this.memory);
        this.ppu = new Ppu(this.memory);
    }

    public load(url: string): void {
        this.cartridge = Cartridge.load(url, this.memory);
        this.memory.cartridge = this.cartridge;
    }

    public reset(): void {
        this.cpu.reset();
        this.ticks = 0;
    }

    public tick(): void {
        for(let i = 0; i < this.tpf; i++){
            let cycles = this.cpu.tick();
            this.ppu.renderscan(cycles);
            this.ticks++;
        }
    }

    public tickfor(): void {
        if (this.counts != 0) {
            this.counts--;
            this.tick();
            requestAnimationFrame(this.tickfor.bind(this));
        }
    }

    public run(): void {
        this.counts = -1;
        this.tickfor();
    }

    public stop(): void {
        this.counts = 0;
    }
}