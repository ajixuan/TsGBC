import {Cpu} from "./cpu/cpu";
import {Ppu} from "./ppu/ppu";
import {Memory} from "./memory/memory";
import {Cartridge} from "./cartridge/cartridge";
import {Registers} from "./cpu/registers"
import {Keyboard} from "./keyboard";
import {Joypad} from "./io/joypad";

export class GameBoy {

    public ppu: Ppu;
    public cpu: Cpu;
    public memory: Memory;
    public cartridge: Cartridge;
    public ticks: number = 0;
    public timeout: any;
    public interval: number = 1000;
    private runConditions : Array<Function> = new Array<Function>();
    private counts: number = 0;
    public joypad: Joypad;
    public keyboard: Keyboard;


    //Ticks per frame
    public tpf: number = 1;

    constructor() {
        this.cartridge = null
        this.memory = new Memory();
        this.cpu = new Cpu(this.memory);
        this.ppu = new Ppu(this.memory);
        this.joypad = this.memory.joypad;

        this.keyboard = new Keyboard(this.memory.joypad);
        this.keyboard.init();
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
        for(let i = 0 ; i < this.runConditions.length; i++){
            if(this.runConditions[i]()){
                this.runConditions.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    public tick(): boolean {
        for (let i = 0; i < this.tpf; i++) {
            if (this.checkRunConditions()) {
                return true;
            }

            let cycles = this.cpu.tick();
            this.ppu.renderscan(cycles);
            this.ticks++;
            this.counts--;
        }
        return false;
    }

    /**
     * Tick until
     * @param pc
     */
    private tickAnimation(): void {
        //Continue if tick is not finished
        if(!this.tick()){
            requestAnimationFrame(this.tickAnimation.bind(this));
        }
    }

    public setPCBreak(pc : number):void {
        let cb = (function(pc : number, registers : Registers){
            console.log(pc);
            let _pc = pc;
            let _registers = registers;
            return () => {
                return (_registers.getPC() == _pc);
            };
        })(pc, this.cpu.registers);
        this.runConditions.push(cb);
    }


    public tickUntil(counts : number) : void {
        //Push the basic run condition in
        let run = function(){ return (this.counts == 0)}.bind(this);
        this.runConditions.push(run);
        this.counts = counts;
        this.tickAnimation();
    }

    public run(): void {
        this.tickUntil(-1);
    }

    public stop(): void {
        this.counts = 0;
    }

}