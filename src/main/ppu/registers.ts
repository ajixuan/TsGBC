import {Memory} from "../memory/memory";
/**
 * Created by hkamran on 12/16/2016.
 */
export class Registers {
    private scrollX : number;
    private scrollY : number;
    private WNDPOSX : number;
    private WNDPOSY : number;

    private memory : Memory;

    constructor(memory : Memory) {
        this.memory = memory;
    }

    public getControl() {
        return this.memory.io[40];

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