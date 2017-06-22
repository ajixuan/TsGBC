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
    public lcdc  = (function(self : Registers){
        let _val = 0x00;
        let set  = (val : number, callback ?: () => void ) => { return ()=> { _val |= val ; if(callback) callback()}};
        let unset = (val : number, callback ?: () => void )=> { return ()=> { _val &= ~val ; if(callback) callback()}};
        let get = (val : number)=> { return ()=> { return _val & val ? 1 : 0} };

        //Callback functions
        let lyreset = () => { self.ly = 0; self.stat.interrupts.hblank.set(); };
        let checkLyc = ()=> {if(self.ly == self.lyc) self.stat.lyco.set()}
        return { //Toggles for the flagsp
            lcdon :     {set : set(0x80, checkLyc), unset : unset(0x80, lyreset), get : get(0x80)},
            bgwin :     {set : set(0x40), unset : unset(0x40), get : get(0x40)},    //BGmap 1 or 2
            winon :     {set : set(0x20), unset : unset(0x20), get : get(0x20)},
            tilemap :   {set : set(0x10), unset : unset(0x10), get : get(0x10)},
            bgmap :     {set : set(0x08), unset : unset(0x08), get : get(0x08)},
            objsize :   {set : set(0x04), unset : unset(0x04), get : get(0x04)},
            objon :     {set : set(0x02), unset : unset(0x02), get : get(0x02)},
            bgon :      {set : set(0x01), unset : unset(0x01), get : get(0x01)},
            getAll :    function(){return _val},
            setAll :    function(val:number){
                (val & 0x01) ? this.bgon.set() : this.bgon.unset();
                (val & 0x02)? this.objon.set() : this.objon.unset();
                (val & 0x04)? this.objsize.set() : this.objsize.unset();
                (val & 0x08)? this.tilemap.set() : this.tilemap.unset();
                (val & 0x10)? this.bgwin.set() : this.bgwin.unset();
                (val & 0x20)? this.winon.set() : this.winon.unset();
                (val & 0x40)? this.bgwin.set() : this.bgwin.unset();
                (val & 0x80)? this.lcdon.set() : this.lcdon.unset();
            }
        }
    })(this);

    // Status of STAT Controller pg 55



    // 00 : enable cpu access to display RAM
    // 01 : In VBLANK
    // 02 : Searching
    // 03 : VRAM read mode
    public stat = (function (self : Registers) {
        let _val = 0x00;
        let set  = (val : number, intr : Interrupt, setflag ?: Function) => {
            return ()=> {
                if(setflag){ setflag() }

                //Set interrupt flag only if interrupt is allowed
                if(self.memory.interrupt.ime){
                    self.memory.interrupt.setRequestInterrupt(intr);
                    _val |= val ;
                }
            }
        };
        let unset = (val : number)=> { return ()=> {_val &= ~val}};
        let get = (val : number)=> { return ()=> { return _val & val ? 1 : 0}};
        let setFlag = (val : number) => { return ()=> {_val &= 0xFC; _val |= val}};
        return {
            getAll: function () { return _val },
            reset : function(){ _val = 0x85},
            interrupts: {
                lycoincidence: {
                    set : set(0x44, Interrupts.LCDC),
                    unset : unset(0x44),
                    get : get(0x40)
                },
                oaminterrupt: {
                    set : set(0x20, Interrupts.LCDC, setFlag(0x02)),
                    unset : unset(0x22),
                    get : get(0x20)
                },
                vblank: {
                    set : set(0x10, Interrupts.VBLANK, setFlag(0x01)),
                    unset : unset(0x11),
                    get : get(0x10)
                },
                hblank: {
                    set : set(0x08, Interrupts.LCDC, setFlag(0x00)),
                    unset : unset(0x08),
                    get : get(0x08)
                },
            },
            modeFlag: {
                hblank:     {set : setFlag(0x00), get : function(){return ((_val & 0x03) == 0x00) ? 1 : 0}},
                vblank:     {set : setFlag(0x01), get : function(){return ((_val & 0x03) == 0x01) ? 1 : 0}},
                oamlock:    {set : setFlag(0x02), get : function(){return ((_val & 0x03) == 0x02) ? 1 : 0}},
                vramlock:   {set : setFlag(0x03), get : function(){return ((_val & 0x03) == 0x03) ? 1 : 0}}
            },
            lyco : {
                set :   function(){_val |= 0x04},
                unset : function(){_val &= ~(0x04)},
                get :   function(){return (_val & 0x04) ? 1 : 0}
            }
        }
    })(this);
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

    public reset() {
        this.scy = 0x00;
        this.scx = 0x00;
        this.ly = 0x00;
        this.lyc = 0x00;
        this.wx = 0x00;
        this.wy = 0x00;
        this.bgp = 0xFC;
        this.obp0 = 0xFF;
        this.obp1 = 0xFF;

        this.stat.reset();
        this.lcdc.lcdon.set();
        this.lcdc.tilemap.set();
        this.lcdc.bgon.set();
    }
}