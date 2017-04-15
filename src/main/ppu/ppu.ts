import {Memory} from "../memory/memory";
import {Screen} from "./screen";
import {Registers} from "./registers";

export class Ppu {
    private screen: Screen;
    private memory: Memory;
    private tileset: Array<Array<Array<number>>>;
    private registers: Registers;

    //PPu units
    private bgmapbase: number;
    private bgtilebase: number;
    private bgon: number;
    private objon: number;
    private objblock: number;
    private winon: number;
    private lcdon: number;
    private winbase: number;

    //Macros
    private PIXELNUM: number = 8;

    private


    constructor(memory: Memory) {
        this.screen = new Screen();
        this.memory = memory;
        this.registers = new Registers(this.memory);
        this.reset();
    }

    /**
     * reset()
     * Resets the bitmap
     */
    public reset(): void {
        this.tileset = [];
        this.registers.reset();

        //Go through all tiles
        for (var i = 0; i < 384; i++) {
            this.tileset[i] = [];

            //For each tile there are 8 bits
            for (var j = 0; j < 8; j++) {
                //Since each pixel consist 2 bytes, store values here
                this.tileset[i][j] = [0, 0, 0, 0, 0, 0, 0, 0];
            }
        }
    }

    /**
     * Write value to VRAM addr
     * Updates one row of pixels
     *
     * @param addr
     * @param val
     */
    public updateTile(addr: number): void {

        // Cut down the address so it is a number
        // that represents one of the 384 tiles
        // Addr is between 0x8000 - 0x97FF

        // Last byte doesn't matter because each row is
        // 2 bytes, so the second byte of the row will
        // belong to the same row of bytes
        addr &= 0x1FFE;

        // Each tile has 8 rows, each row takes 2 bytes. Divide the rows
        // by 16 (shift 4 == divide 16)
        // This will give us the tile number that the row belongs to
        var tile = (addr >> 4) & 0x1FF;

        // Find the row number of the tile
        var y = (addr >> 1) & 0x7;
        var pindex;

        //8 bits
        for (var x = 0; x < 8; x++) {
            pindex = 1 << x;

            this.tileset[tile][y][x] =
                this.memory.readByte(addr) & pindex +
                this.memory.readByte(addr + 1) & pindex;
        }
    }

    /**
     * Helper function for getting the vram tile in tile
     * object form
     * @param index
     */
    private getVramTile(tile: number): Array<Array<number>> {

        //-------------Memory in map 1
        if ((this.registers.lcdc & 0x10) != 0) {
            return this.tileset[tile];
        }

        //-------------Memory in map 2
        //If lcdc is set to map 2
        //0x8800 is beginning of address, which starts from +128 tiles

        //Convert to negative
        if (tile & 0x80) {
            tile -= (1 << 8); //Sign extension
            tile += 128;      //Make value positive
        }

        //Pad 128 tiles
        return this.tileset[tile + 128];
    }

    /**
     * Render scan on one tick
     */
    public renderscan(): void {

        //Render bg data (0x3FF addresses)


        switch (this.registers.stat) {
            //Horizontal blanking
            case 0:
            //Vertical blanking
            case 1:
            //OAM Rendering
            case 2:
            //VRAM Rendering
            case 3:
                // render at ly
                if (this.registers.ly >= 144) {
                    //Vertical blank
                    this.registers.stat = 0;
                    this.registers.ly++;
                } else {
                    //Get the tile of our current ly
                    var ycoor = ((32 * Math.floor((this.registers.ly + this.registers.scy) / 8)) ) % 32;

                    for (var x = 0; x < this.screen.WIDTH; x++) {

                        //Get the tile number
                        var xcoor = (Math.floor((this.registers.scx + x) / 8)) % 32;

                        //Get the tile number
                        var tile = this.getVramTile(xcoor + ycoor);

                        //Display the tile on screen
                        this.screen.printRow(tile, this.registers.scx, this.registers.ly + this.registers.scy);
                    }
                }
        }

    }

    /**
     * Gpu handles writing bytes to its own registers
     * @param addr
     * @param val
     */
    public writeByte(addr: number, val: number): void {
        switch (addr) {
            case 0xFF40:
                this.bgon = (val & 0x01) ? 1 : 0;                   //Bg Display
                this.objon = (val & 0x02) ? 1 : 0;
                this.objblock = (val & 0x04) ? 1 : 0;
                this.bgmapbase = (val & 0x08) ? 0x9C00 : 0x9800;    //Two bg map locations
                this.bgtilebase = (val & 0x10) ? 0x8000 : 0x8800;   //Two bg tile locations

                this.winon = (val & 0x20) ? 1 : 0;
                this.winbase = (val & 0x40) ? 0x9C00 : 0x9800;      //Window code area selection
                this.lcdon = (val & 0x80) ? 1 : 0;                  //LCDC controller
                this.registers.lcdc = val;
            case 0xFF42:
                this.registers.scy = val;
            case 0xFF43:
                this.registers.scx = val;
            case 0xFF44:
                this.registers.ly = val;
            case 0xFF45:
                this.registers.lyc = val;
            case 0xFF46:
                //DMA
                //Transfers 40 x 32 bits of data
                //val is the starting address of transfer
                //val is always the upper 8 bits, so need to be shifted
                for (var i = 0; i < 0x9F; i++) {
                    var data = this.memory.readByte((val << 8) + i);
                    this.memory.oam[i] = data;
                }
            case 0xFF4A:
                this.registers.wy = val;
            case 0xFF4B:
                this.registers.wx = val;
            case 0xFF68:
                this.registers.bcps = val;
            case 0xFF69:
                this.registers.bcpd = val;
            case 0xFF6A:
                this.registers.ocps = val;
            case 0xFF6B:
                this.registers.ocpd = val;
        }
    }

    public readByte(addr: number): number {

        switch (addr) {
            case 0xFF40:
                return this.registers.lcdc;
            case 0xFF42:
                return this.registers.scy;
            case 0xFF43:
                return this.registers.scx;
            case 0xFF44:
                return this.registers.ly;
            case 0xFF45:
                return this.registers.lyc;
            case 0xFF4A:
                return this.registers.wy;
            case 0xFF4B:
                return this.registers.wx;
            case 0xFF68:
                return this.registers.bcps;
            case 0xFF69:
                return this.registers.bcpd;
            case 0xFF6A:
                return this.registers.ocps;
            case 0xFF6B:
                return this.registers.ocpd;

        }

    }

}