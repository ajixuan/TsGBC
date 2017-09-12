import {Memory} from "../memory/memory";
import {Screen} from "./screen";
import {Registers} from "./registers";

type Obj = {
    x: number;
    y: number;
    tile: number;
    attr: number;
}

export class Ppu {
    private screen: Screen;
    private memory: Memory;
    public vramTileset: Array<Array<Array<number>>>;
    public oamTileset: Array<Obj>;


    public clock: number = 0;
    public registers: Registers;

    constructor(memory: Memory) {
        this.screen = new Screen();
        this.memory = memory;
        this.registers = new Registers(this.memory);
        this.memory.ppu = this;
        this.reset();
    }

    /**
     * reset()
     * Resets the bitmap
     */
    public reset(): void {
        this.vramTileset = [];
        this.oamTileset = [];
        this.registers.reset();
        this.clock = 0;

        //Go through all tiles
        for (let i = 0; i < 384; i++) {
            this.vramTileset[i] = [];

            //For each tile there are 8 bits
            for (let j = 0; j < 8; j++) {
                //Since each pixel consist 2 bytes, store values here
                this.vramTileset[i][j] = [0, 0, 0, 0, 0, 0, 0, 0];
            }
        }

        for (let i = 0; i < 40; i++) {
            let obj: Obj = {
                x: 0,
                y: 0,
                tile: 0,
                attr: 0
            }
            this.oamTileset[i] = obj;
        }

    }

    public updateOamSprite(addr: number): void {
        let index = addr - 0xFE00;
        let block = Math.floor((index / 4));
        let prop = index % 4;
        let val = this.memory.oam[index];
        switch (prop) {
            case 0:
                this.oamTileset[block].y = val;
                break;
            case 1:
                this.oamTileset[block].x = val;
                break;
            case 2:
                this.oamTileset[block].tile = val;
                break;
            case 3:
                this.oamTileset[block].attr = val;
                break;
        }
    }

    /**
     * Write value to VRAM addr
     * Updates one row of pixels
     *
     * @param addr
     */
    public updateVramTile(addr: number): void {

        // Cut down the address so it is a number
        // that represents one of the 384 tiles
        // Addr is between 0x8000 - 0x97FF

        // Last byte doesn't matter because each row is
        // 2 bytes, so the second byte of the row will
        // belong to the same row of bytes

        //Total number of rows of pixels needed
        let line = addr - 0x8000;

        // Each tile has 8 rows, each row takes 2 bytes.
        // Divide the rows by 16 (shift 4 == divide 16)
        // This will give us the tile number that the row belongs to
        let tile = (line >> 4);

        // Find the row number of the tile
        let y = (line >> 1) % 8;
        let pindex;

        //8 bits
        for (let x = 0; x < 8; x++) {
            pindex = 0x80 >> x;
            let pixel = this.vramTileset[tile][y][x];

            if (line % 2) {
                ((this.memory.vram[line] & pindex) ? pixel |= 2 : pixel &= ~2);
            } else {
                ((this.memory.vram[line] & pindex) ? pixel |= 1 : pixel &= ~1);
            }
            this.vramTileset[tile][y][x] = pixel;
        }
    }

    /**
     * Helper function for getting the vramlock tile in tile
     * object form
     * @param tile
     */
    public getVramTile(block: number): Array<Array<number>> {

        let tile;
        //BGmap 2 0x9C00
        if (this.registers.lcdc.bgmap.get()) {
            tile = this.memory.vram[block + 0x9C00 - 0x8000];
        }
        //BGmap 1 0x9800
        else {
            tile = this.memory.vram[block + 0x9800 - 0x8000];
        }

        // In tile map 2
        if (this.registers.lcdc.tilemap.get() == 0) {

            //Check if negative
            if (tile & 0x80) {
                tile -= (1 << 8); //Sign extension
                tile += 0x80;     //convert -0x08 to 0
            }

            //Since 0x8800 is beginning of address,
            //which is 0x80 tiles ahead of 0x8000
            // 0x80 x 8 x 2 = 0x800
            tile += 0x80;
        }

        if (!this.vramTileset[tile]) {
            throw "ERROR: Tile number: " + tile + " does not exist";
        }

        return this.vramTileset[tile];
    }


    /**
     * Render scan on one tick
     */
    public renderscan(cycles: number): void {
        let stat = this.registers.stat;
        let lcdc = this.registers.lcdc;

        this.clock += cycles;
        stat.lyco.unset();

        //LCD is off, reset renderscan
        if (!this.registers.lcdc.lcdon.get()) {
            stat.interrupts.hblank.set();
            this.clock = 0;
            return;
        }

        //Set the ly,lyc coincidence interrupt
        if (this.registers.ly == this.registers.lyc) {
            stat.lyco.set();
        }

        //Cycle through stat
        if (stat.modeFlag.hblank.get() && this.clock >= 204) {
            stat.modeFlag.oamlock.set();
            this.clock = 0;

        } else if (stat.modeFlag.vblank.get() && this.clock >= 456) {
            if (this.registers.ly > 153 || this.registers.ly == 0) {
                this.registers.ly = 0;
                stat.modeFlag.vramlock.set();
                stat.interrupts.vblank.unset();
            } else {
                this.registers.ly++;
                this.clock = 0;
            }

        } else if (stat.modeFlag.oamlock.get() && this.clock >= 80) {

            let x, y, chr, attr, tile;
            let spriteCount = 0;

            //8x16 Sprites
            if (lcdc.objsize.get()) {


            }

            //for each tile in oam
            for (let i = 0; i < this.oamTileset.length; i++) {
                if (spriteCount >= 10) {
                    return;
                }

                x = this.oamTileset[i].x - 8;
                y = this.oamTileset[i].y - 16;
                chr = this.oamTileset[i].tile;
                attr = this.oamTileset[i].attr;

                //Check if the obj is within current scanline
                if ((y >= 16 && y < 160) && (x >= 8 && x < 168)) {
                    if (this.registers.ly >= y && this.registers.ly < y + 8) {

                        tile = this.vramTileset[chr];


                        //Print one line
                        for (let col = 0; col < 8; col++) {
                            if ((x + col) > this.screen.WIDTH) {
                                return;
                            }

                            let offset = col * 4;
                            let bg =
                                this.screen.FRAME.data[y][x + offset] |
                                this.screen.FRAME.data[y][x + offset + 1] |
                                this.screen.FRAME.data[y][x + offset + 2];

                            if ((attr & 0x01) && bg > 0) {
                                continue;
                            }

                            this.screen.setBufferPixel(x + col, this.registers.ly, tile[this.registers.ly - y][col]);
                        }
                    }
                }
            }

            stat.modeFlag.vramlock.set();
            this.registers.ly++;
            this.clock = 0;

        } else if (stat.modeFlag.vramlock.get() && this.clock >= 172) {
            let mapy, mapx, tile;
            let row = this.registers.ly;

            if (lcdc.lcdon.get()) {
                this.clock = 0;

                //Vertical blank
                if (this.registers.ly == 144) {
                    stat.interrupts.vblank.set();
                    this.screen.printBuffer();
                    return;
                }

                //Y coordinate does not change during line render
                mapy = (this.registers.ly + this.registers.scy) % 256;
                //ycoor = Screen.TILES * Math.floor(y / Screen.PIXELS);

                //Render whole line
                for (let cell = 0; cell < this.screen.WIDTH; cell++) {
                    mapx = (this.registers.scx + cell);

                    //TODO: Make it so it only gets tile when needs to
                    let tilenum = (mapx >> 3) + ((mapy >> 3) * 0x20);
                    tile = this.getVramTile(tilenum);
                    this.screen.setBufferPixel(cell, row, tile[row % Screen.PIXELS][cell % Screen.PIXELS]);
                }
                stat.modeFlag.hblank.set();
            }
        }
    }

    public requestRead(addr: number): number {
        //Vram
        let val;
        if (addr < 0xA000) {
            if (this.registers.stat.modeFlag.vramlock.get()) {
                val = 0xFF;
            }
            val = this.memory.vram[addr - 0x8000];
        }
        //OAM
        else if (addr < 0xFEA0) {
            val = this.memory.oam[addr - 0xFE00];

            if (this.registers.stat.modeFlag.vramlock.get() || this.registers.stat.modeFlag.oamlock.get()) {
                val = 0xFF;
            }
        }

        return val;
    }

    /**
     * Method for external processes to make writes to vram.
     * VRAM is ppu controlled, external processes must
     * make request to write to vram
     */
    public requestWrite(addr: number, val: number): void {

        //Vram
        if (addr < 0xA000) {
            if (this.registers.stat.modeFlag.vramlock.get()) {
                //console.log("ERROR: VRAM locked");
                return;
            }

            this.memory.vram[addr - 0x8000] = val;
            if (addr < 0x9800) {
                this.updateVramTile(addr);
            }
        }
        //OAM
        else if (addr < 0xFEA0) {
            if (this.registers.stat.modeFlag.vramlock.get() || this.registers.stat.modeFlag.oamlock.get()) {
                //console.log("ERROR: OAM locked");
                return;
            }

            this.memory.oam[addr - 0xFE00] = val;
            this.updateOamSprite(addr);
        }
    }
}

