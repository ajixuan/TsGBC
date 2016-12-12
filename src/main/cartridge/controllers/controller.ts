import {Memory} from "../../memory/memory";
/**
 * Created by hkamran on 12/11/2016.
 */
export interface Controller {
    rom : number[];
    memory: Memory;
    readByte(addr : number) : number;
    writeByte(addr : number, val : number) : void;
}