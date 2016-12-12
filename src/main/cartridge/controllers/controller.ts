import {Memory} from "../../memory/memory";
/**
 * Created by hkamran on 12/11/2016.
 */
export interface Controller {
    rom : number[];
    readByte(addr : number) : number;
    writeByte(addr : number, val : number) : void;
}