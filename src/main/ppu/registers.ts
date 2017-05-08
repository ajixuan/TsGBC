import {Memory} from "../memory/memory";
import {Interrupts} from "../io/interrupts";

/**
 * Created by hkamran on 12/16/2016.
 */
export class Registers {
    private interrupts: Interrupts;

    public scx: number = 0;
    public scy: number = 0;

    //Window overlay
    public wx: number = 0;
    public wy: number = 0;


    //@formatter:off
    // LCD Controller
    public lcdc  = (function(){
        var _val = 0x00;
        return { //Toggles for the flags
            set : {
                lcdon :     function(){ _val ^= 0x80 }(),
                bgwin :     function(){ _val ^= 0x40 }(),
                winon :     function(){ _val ^= 0x20 }(),
                tilemap :   function(){ _val ^= 0x10 }(),
                bgmap :     function(){ _val ^= 0x08 }(),
                objsize :   function(){ _val ^= 0x04 }(),
                objon :     function(){ _val ^= 0x02 }(),
                bgon :      function(){ _val ^= 0x01 }(),
            },
            lcdon :     function(){ return (_val &= 0x80) ? 1 : 0  }(),
            bgwin :     function(){ return (_val &= 0x40) ? 1 : 0  }(),
            winon :     function(){ return (_val &= 0x20) ? 1 : 0  }(),
            tilemap :   function(){ return (_val &= 0x10) ? 1 : 0  }(),
            bgmap :     function(){ return (_val &= 0x08) ? 1 : 0  }(),
            objsize :   function(){ return (_val &= 0x04) ? 1 : 0  }(),
            objon :     function(){ return (_val &= 0x02) ? 1 : 0  }(),
            bgon :      function(){ return (_val &= 0x01) ? 1 : 0  }(),
            get : function(){ return _val },
        }
    })()

    // Status of LCD Controller pg 55


    // 00 : enable cpu access to display RAM
    // 01 : In VBLANK
    // 02 : Searching
    // 03 : VRAM read mode
    public stat = (function(){
        var _val = 0x00;
        return {
            lycoincidence: function () { _val ^= 0x40; }(),
            oaminterrupt: function () { _val ^= 0x20; }(),
            vblank: function () { _val ^= 0x11; }(),
            hblank: function () { _val ^= 0x08; }(),
            get : function(){ return _val; },
            set : function(val) {_val = val}
        }
        })();

    //@formatter:on


    public bcps: number = 0;
    public bcpd: number = 0;
    public ocps: number = 0;
    public ocpd: number = 0;

    public dma: number = 0;
    public bgp: number = 0;
    public obp0: number = 0;
    public obp1: number = 0;

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

        //0x91 @formatter:off
        this.lcdc.set.lcdon; this.lcdc.set.tilemap; this.lcdc.set.bgon;
        //@formatter:on

        //0x85
        this.stat.set(0x85);
    }

    private status: {};

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