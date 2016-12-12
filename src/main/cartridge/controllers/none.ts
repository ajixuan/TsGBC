/**
 * Created by hkamran on 12/11/2016.
 */

import {Controller} from "./controller";
export class None implements Controller {

    public rom : number[];

    constructor( rom : number[]) {
        this.rom = rom;
    }

    public readByte(addr: number) : number {
        return 0;
    }
    public writeByte(addr: number, val : number) : number {
        return 0;
    }
}