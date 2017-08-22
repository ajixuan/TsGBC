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
    public switch :any = function(element:Element){
        let _val = false;
        let _ele = element;
        return {
            on: function(){_val = true; _ele.innerHTML = "Running"},
            off: function () {_val = false; _ele.innerHTML = "Stopped"},
            stat: function () {return _val}
        }
    }(document.getElementById("switch"));
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

    public checkRunConditions(): void {
        for(let i = 0 ; i < this.runConditions.length; i++){
            if(this.runConditions[i]()){
                this.runConditions.splice(i, 1);
                this.switch.off();
            }
        }
    }

    public tick(): void{
        let cycles = this.cpu.tick();
        this.ticks++;
        this.ppu.renderscan(cycles);
        this.checkRunConditions();
    }

    /**
     * Tick until
     * @param pc
     */
    public tickAnimation(): void {
        let tick = function(){
            for(let i = 0; i <= this.tpf; i++){
                this.tick();
                if(!this.switch.stat()){return}
            }
            this.tickAnimation.bind(this)();
        }.bind(this);

        requestAnimationFrame(tick);
    }

    public setPCBreak(pc : number):void {
        let cb = (function(pc : number, registers : Registers){
            let _pc = pc;
            let _registers = registers;
            return () => {
                return (_registers.getPC() == _pc);
            };
        })(pc, this.cpu.registers);
        this.runConditions.push(cb);
    }
}