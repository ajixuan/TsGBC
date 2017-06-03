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
    private runConditions : Array<Function> = new Array<Function>();

    //Ticks per frame
    public tpf: number = 1;

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

    public checkRunConditions(): boolean {
        let final = true;
        for(let condition of this.runConditions){
            console.log(condition);
            final = final && condition();
        }

        return final;
    }

    public tick(): boolean {

        for (let i = 0; i < this.tpf; i++) {
            if (this.checkRunConditions()) {
                return true;
            }

            let cycles = this.cpu.tick();
            this.ppu.renderscan(cycles);
            this.ticks++;
        }
        return false;
    }

    /**
     * Tick until
     * @param pc
     */
    public tickUntil(): void {

        //Continue if tick is not finished
        if(!this.tick()){
            requestAnimationFrame(this.tickUntil.bind(this));
        }
    }

    public runUntilPC(pc : number):void {
        this.tickUntil();
    }

    public run(): void {
        let run = function(){ return (this.counts == 0) ? true : false}.bind(this);
        this.runConditions.push(run);
        this.counts = -1;
        this.tickUntil();
    }

    public stop(): void {
        this.counts = 0;
    }

}