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

    constructor(memory: Memory) {
        this.screen = new Screen();
        this.memory = memory;
        this.registers = Registers(this.memory);
        this.reset();
    }

    /**
     * reset()
     * Resets the bitmap
     */
    public reset(): void {
        this.tileset = [];

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
     * Return the address of the tile that is corresponding
     * to the tile number
     * @param index
     */
    private getTile(index: number): number {
        //Check the lcdc for tile map

        //Map 1
        var mapaddr = 0x8000;

        //Map 2
        if(this.registers.lcdc & 0x10 == 0){
            mapaddr = 0x8800;

            //Convert value to negative
            if(index & 0x80) {
                index -= (1 << 8); //Sign extension trick
            }
        } else {



        }




        //Get tile
        this.tileset


    }

    /**
     * Render scan on one tick
     */
    public renderscan(): void {

        //Render bg data (0x3FF addresses)
        for (var i = 0; i < 0x3FF; i++) {
            //Char data
            var data = this.readByte(this.bgmapbase + i);


        }

        this.registers.scy;
        //Render obj

    }

    /**
     * Gpu handles writing bytes to its own registers
     * @param addr
     * @param val
     */
    public writeByte(addr: number, val: number): void {
        if (addr == 0xFF40) {
            this.bgon = (val & 0x01) ? 1 : 0;                   //Bg Display
            this.objon = (val & 0x02) ? 1 : 0;
            this.objblock = (val & 0x04) ? 1 : 0;
            this.bgmapbase = (val & 0x08) ? 0x9C00 : 0x9800;    //Two bg map locations
            this.bgtilebase = (val & 0x10) ? 0x8000 : 0x8800;   //Two bg tile locations

            this.winon = (val & 0x20) ? 1 : 0;
            this.winbase = (val & 0x40) ? 0x9C00 : 0x9800;      //Window code area selection
            this.lcdon = (val & 0x80) ? 1 : 0;                  //LCDC controller
            this.registers.lcdc = val;
        } else if (addr == 0xFF42) {
            this.registers.scy = val;
        } else if (addr == 0xFF43) {
            this.registers.scx = val;
        } else if (addr == 0xFF44) {
            this.registers.ly = val;
        } else if (addr == 0xFF45) {
            this.registers.lyc = val;
        } else if (addr == 0xFF46) {
            //DMA
            //Transfers 40 x 32 bits of data
            //val is the starting address of transfer
            //val is always the upper 8 bits, so need to be shifted
            for (var i = 0; i < 0x9F; i++) {
                var data = this.memory.readByte((val << 8) + i);
                this.memory.oam[i] = data;
            }
        } else if (addr == 0xFF4A) {
            this.registers.wy = val;
        } else if (addr == 0xFF4B) {
            this.registers.wx = val;
        } else if (addr == 0xFF68) {
            this.registers.bcps = val;
        } else if (addr == 0xFF69) {
            this.registers.bcpd = val;
        } else if (addr == 0xFF6A) {
            this.registers.ocps = val;
        } else if (addr == 0xFF6B) {
            this.registers.ocpd = val;
        }
    }

    public readByte(addr: number): number {

        if (addr < 0x9FFF) {
            //Return color for pixel

        }

        switch (addr & 0xF000) {
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