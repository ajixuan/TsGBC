import {Memory} from "../memory/memory";
/**
 * Created by hkamran on 12/16/2016.
 */
export class Registers {
    public scx : number = 0;
    public scy: number = 0;

    //Window overlay
    public wx: number = 0;
    public wy: number = 0;

    public lcdc: number;

    // Status of LCD Controller pg 55
    // 00 : hblank
    // 01 : vblank
    // 02 : OAM read mode
    // 03 : VRAM read mode
    public stat: number = 0;

    public bcps: number = 0;
    public bcpd: number = 0;
    public ocps: number = 0;
    public ocpd: number = 0;

    public dma: number = 0;
    public bgp: number = 0;
    public obp0: number = 0;
    public obp1: number = 0;

    public ly : number = 0;
    public lyc : number = 0;

    private memory : Memory;

    constructor(memory : Memory) {
        this.memory = memory;
    }

    public getControl() {
        return this.memory.io[40];
    }

    public reset(){
        this.lcdc = 0x91;
        this.scy = 0x00;
        this.scx = 0x00;
        this.lyc = 0x00;
        this.bgp = 0xFC;
        this.wx = 0x00;
        this.wy = 0x00;
    }

    private control : {
            stop: number,
            wndSelection: number,
            wndOn : number,
            bgCharSelection: number,
            bgCodeSelection : number,
            objSelection : number,
            objOn : number,
            mode : number
        } =
        {
            stop : 0,
            wndSelection : 0,
            wndOn : 0,
            bgCharSelection : 0,
            bgCodeSelection : 0,
            objSelection : 0,
            objOn : 0,
            mode : 0
        };

    private status :  {

    };


}