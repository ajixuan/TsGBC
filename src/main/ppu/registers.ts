import {Memory} from "../memory/memory";
import {Interrupt, Interrupts} from "../io/interrupts"

/**
 * Created by hkamran on 12/16/2016.
 */
export class Registers {
    public scx: number = 0;
    public scy: number = 0;

    //Window overlay
    public wx: number = 0;
    public wy: number = 0;


    //OAM
    public bcps: number = 0;
    public bcpd: number = 0;
    public ocps: number = 0;
    public ocpd: number = 0;

    public dma: number = 0;
    public bgp: number = 0;
    public obp0: number = 0;
    public obp1: number = 0;

    //@formatter:off
    // LCD Controller
    public lcdc  = (function(){
        let _val = 0x00;
        let set  = (val : number)=> { return ()=> { _val |= val } };
        let unset = (val : number)=> {  return ()=> {_val &= ~val} };
        let get = (val : number)=> { return ()=> { return _val & val ? 1 : 0} };
        return { //Toggles for the flags
            lcdon :     {set : set(0x80), unset : unset(0x80), get : get(0x80)},
            bgwin :     {set : set(0x40), unset : unset(0x40), get : get(0x40)},
            winon :     {set : set(0x20), unset : unset(0x20), get : get(0x20)},
            tilemap :   {set : set(0x10), unset : unset(0x10), get : get(0x10)},
            bgmap :     {set : set(0x08), unset : unset(0x08), get : get(0x08)},
            objsize :   {set : set(0x04), unset : unset(0x04), get : get(0x04)},
            objon :     {set : set(0x02), unset : unset(0x02), get : get(0x02)},
            bgon :      {set : set(0x01), unset : unset(0x01), get : get(0x01)},
            getAll :    function(){return _val}
        }
    })();

    // Status of LCD Controller pg 55
    // 00 : enable cpu access to display RAM
    // 01 : In VBLANK
    // 02 : Searching
    // 03 : VRAM read mode
    public stat = (function () {
        let _val = 0x00;
        let set  = (val : number, intr : Interrupt) => {
            return ()=> {
                _val |= val ;
                this.memory.interrupt.setInterruptFlag(intr)
            }
        };
        let unset = (val : number)=> { return ()=> {_val &= ~val}};
        let get = (val : number)=> { return ()=> { return _val & val ? 1 : 0}};
        let setFlag= (val : number) => { return ()=> {_val &= 0xFC; _val |= val}};
        return {
            getAll: function () { return _val },
            reset : function(){ _val = 0x85},
            interrupts: {
                lycoincidence: {
                    set : set(0x40, Interrupts.LCDC),
                    unset : unset(0x40),
                    get : get(0x40)
                },
                oaminterrupt: {
                    set : set(0x20, Interrupts.LCDC),
                    unset : unset(0x20),
                    get : get(0x20)
                },
                vblank: {
                    set : set(0x11, Interrupts.VBLANK),
                    unset : unset(0x11),
                    get : get(0x11)
                },
                hblank: {
                    set : set(0x08, Interrupts.LCDC),
                    unset : unset(0x08),
                    get : get(0x08)
                },
            },
            modeFlag: {
                hblank: {set : setFlag(0x00), get : function(){return _val & 0xFC}},
                vblank: {set : setFlag(0x01), get : function(){return _val & 0xFC}},
                oamlock: {set : setFlag(0x02), get : function(){return _val & 0xFC}},
                ovramlock: {set : setFlag(0x03), get : function(){return _val & 0xFC}}
            }

        }
    })();
    //@formatter:on


    /**
     * When bit 7 of LCDC is 1, ly is locked
     * @type {number}
     */

    public ly: number = 0;

    /**
     *
     * @type {number}
     */
    public lyc: number = 0;

    private memory: Memory;

    constructor(memory: Memory) {
        this.memory = memory;
    }

    public getControl() {
        return this.memory.io[40];
    }

    public reset() {
        this.scy = 0x00;
        this.scx = 0x00;
        this.ly = 0x00;
        this.lyc = 0x00;
        this.bgp = 0xFC;
        this.wx = 0x00;
        this.wy = 0x00;

        this.stat.reset();
        this.lcdc.lcdon.set();
        this.lcdc.tilemap.set();
        this.lcdc.bgon.set();
    }

    public setLCDC(lcdc: number): void {
        //Turning lcdc off
        if ((lcdc & 0x80) == 0) {
            this.ly = 0;


        }

    }


    public setLY(ly: number): void {

        //If lcdc bit 7 is set
        if (this.lcdc.bgmap) {
            console.log("LCDC is locked, ly cannot be written");
            return;
        }
        this.ly = ly;
    }
}