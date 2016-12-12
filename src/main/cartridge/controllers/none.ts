/**
 * Created by hkamran on 12/11/2016.
 */

import {Controller} from "./controller";
import {Memory} from "../../memory/memory";
export class None implements Controller {

    public memory : Memory;
    public rom : number[];

    constructor( rom : number[], memory : Memory) {
        this.memory = memory;
        this.rom = rom;
    }

    public readByte(addr: number) : number {
        return 0;
    }
    public writeByte(addr: number, val : number) : number {
        return 0;
    }
}