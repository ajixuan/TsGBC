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
    public keyboard: Keyboard;    
    public switch :any = function(gameboy){
        let _val = false;
        return {
            on: function(){
                _val = true;         
                $(".power").addClass("power-on");
                $(".power-border").addClass("power-border-on");
                gameboy.tickAnimation() },
            off: function () {
                _val = false;
                $(".power").removeClass("power-on");
                $(".power-border").removeClass("power-border-on");        
            },
            stat: function () {return _val}
        }
    }(this);

    //Ticks per frame
    public tpf: number = 20000;

    private runConditions : Array<any> = new Array<any>();

    constructor() {
        this.cartridge = null
        this.memory = new Memory();
        this.cpu = new Cpu(this.memory);
        this.ppu = new Ppu(this.memory);
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
            if(this.runConditions[i].check()){
                this.runConditions.splice(i, 1);
                this.updateBreaks();
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
                if(!this.switch.stat()){return}
                this.tick();           
            }
            this.tickAnimation.bind(this)();
        }.bind(this);

        requestAnimationFrame(tick);
    }

    public setPCBreak(pc : number):void {
        let cb = (function(pc : number, registers : Registers){
            let _pc = pc;
            let _registers = registers;
            return  {
                    check : ()=> {return (_registers.getPC() == _pc)},
                    val : _pc
            };
        })(pc, this.cpu.registers);
        this.runConditions.push(cb);
        this.updateBreaks();
    }


    private updateBreaks(){
        let list = "";
        for(let point of this.runConditions){
            list += "<li>" + point.val.toString(16).toUpperCase() + "<\li>";
        }
        $("#listbreaks").html(list);
    }
}