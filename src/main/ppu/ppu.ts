import {Memory} from "../memory/memory";
import {Screen} from "./screen";
export class Ppu {

    private screen : Screen;
    private memory : Memory;
    private tileset : Array<Array<Array<number>>>;


    constructor(memory : Memory) {
        this.screen = new Screen();
        this.memory = memory;
        this.reset();
    }

    /**
     * reset()
     * Resets the bitmap
     */
    public reset() : void {
        this.tileset = [];

        //Go through all tiles
        for(var i = 0; i < 384; i++){
            this.tileset[i] = [];

            //For each tile there are 8 bits
            for(var j = 0; j < 8; j++)
            {
                //Since each pixel consist 2 bytes, store values here
                this.tileset[i][j] = [0,0,0,0,0,0,0,0];
            }
        }
    }

    /**
     * Write value to VRAM addr
     * @param addr
     * @param val
     */
    public updateTile(addr: number) : void {

        // Cut down the address so it is a number
        // that represents one of the 384 tiles
        // The last address doesn't matter because
        // each tile takes 2 bytes, so 2 addresses
        addr &= 0x1FFE;

        //Each tile has 8 bytes. Divide the pixels by 8 (2 * 4 = 8)
        var tile = (addr >> 4) & 0x1FF;

        //We don't care about last address because each pixel takes up 2 addr
        var y = (addr >> 1) & 0x7;

        var pindex;
        for(var x = 0; x < 8; x++){
            pindex = 1 << x;

            this.tileset[tile][y][x] =
                this.memory.readByte(addr) & pindex +
                this.memory.readByte(addr + 1) & pindex;
        }
    }

    public renderscan(): void {


    }
}