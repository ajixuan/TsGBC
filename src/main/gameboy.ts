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

    private runConditions = new Map();

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
        for(let cond of this.runConditions.values()){
            if(cond()){
                this.switch.off();
                break;
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

    /**
     * The pcBreak element is designed as such in order to make 
     * the register element private within the runconditions array
     */
    public setPCBreak(pc : number):void {
        let element;
        let pcBreak = (function(pc : number, registers : Registers){
            let _pc = pc;
            let _registers = registers;
            return  ()=> {return (_registers.getPC() == _pc)};
        })(pc, this.cpu.registers);

        if(this.runConditions.has(pc)){ return }
        this.runConditions.set(pc, pcBreak);
        
        element = "<li>" + pc.toString(16).toUpperCase() + 
        "<span class=\"fi-x\" onclick=\"removePCBreak(this.parentElement)\"></span><\li>";
        $("#listbreaks").append(element);
    }

    public removePCBreak(pc : number):void{
        if(!this.runConditions.delete(pc)){
            console.log(pc + " doesnt exist");
        };
    }

    public setMemoryBreak(addr: number, val: number):void{
        let element;
        let key = addr + ":" + val;
        let memBreak = (function(addr : number, val : number, memory : Memory){
            let _addr = addr;
            let _val = val;
            let _memory = memory;     
            return () => {
                    let result = (_memory.lastChange.addr == addr && 
                        ((val)? (_memory.lastChange.val == val): true))
                    _memory.lastChange.addr = null;
                    _memory.lastChange.val = null;
                    return result;
            }
        })(addr, val, this.memory);
        if(this.runConditions.has(key)){ return }
        this.runConditions.set(key, memBreak)
        
        element = "<li>" + addr.toString(16).toUpperCase() + " : " + 
        ((val)? val.toString(16).toUpperCase() : val) + "<span class=\"fi-x\" onclick=\"removeMemBreak(this)\"></span><\li>";
        $("#listmembreaks").append(element);
    }

    public removeMemoryBreak(addr: number, val : number):void {
        if(!this.runConditions.delete(addr + ":" + val)){
            console.log(addr + ":" + val + " doesnt exist")
        };
    }
}