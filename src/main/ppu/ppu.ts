import {Memory} from "../memory/memory";
import {Screen} from "./screen";
import {Registers} from "./registers";

export class Ppu {
    private screen: Screen;
    private memory: Memory;
    private vramTileset: Array<Array<Array<number>>>;
    private oamTileset: Array<Array<Array<number>>>;

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
    }

    public updateOamTile(addr: number): void {
        addr &= 0xFF;
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
        addr &= 0x1FFE;

        // Each tile has 8 rows, each row takes 2 bytes. Divide the rows
        // by 16 (shift 4 == divide 16)
        // This will give us the tile number that the row belongs to
        let tile = (addr >> 4) & 0x1FF;

        // Find the row number of the tile
        let y = (addr >> 1) & 0x7;
        let pindex;

        //8 bits
        for (let x = 0; x < 8; x++) {
            pindex = 1 << x;

            this.vramTileset[tile][y][x] =
                ((this.memory.readByte(addr) & pindex) ? 1 : 0) +
                ((this.memory.readByte(addr + 1) & pindex) ? 2 : 0);
        }
    }

    /**
     * Helper function for getting the vramlock tile in tile
     * object form
     * @param tile
     */
    private getVramTile(block: number): Array<Array<number>> {

        //BGmap 1 0x9800
        let tile;
        if (this.registers.lcdc.bgwin.get()) {
            tile = this.memory.readWord(block + 0x9C00);
        }
        //BGmap 2 0x9C00
        else {
            tile = this.memory.readWord(block + 0x9800);
        }

        // Memory in map 2
        if (this.registers.lcdc.bgmap.get() == 0) {
            //If lcdc is set to map 2
            //0x8800 is beginning of address, which starts from +128 tiles

            //Check if negative
            if (tile & 0x80) {
                tile -= (1 << 8); //Sign extension
                tile += 0x80;     //-0x80 is index 0, pad 128
            }
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

        //Set the ly,lyc coincidence interrupt
        if (this.registers.ly == this.registers.lyc) {
            stat.interrupts.lycoincidence.set();
        }

        //Cycle through stat
        if (stat.modeFlag.hblank.get() && this.clock >= 204) {
            stat.modeFlag.oamlock.set();

            if (stat.interrupts.lycoincidence.get()) {
                stat.interrupts.lycoincidence.unset()
            }

            this.registers.ly++;
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
            lcdc.bgon.set();
            stat.modeFlag.vramlock.set();
            this.clock = 0;

        } else if (stat.modeFlag.vramlock.get() && this.clock >= 172) {
            if (lcdc.bgon.get() & lcdc.lcdon.get()) {
                this.clock = 0;

                //Vertical blank
                if (this.registers.ly == 144) {
                    stat.interrupts.vblank.set();
                    //this.screen.printBuffer();
                    return;
                }

                //Get the tiles of our current ly
                let y, x, tile, ycoor, xcoor;

                //Y coordinate does not change during line render
                y = this.registers.ly + this.registers.scy;
                //ycoor = Screen.TILES * Math.floor(y / Screen.PIXELS);

                //Render whole line
                for (let cell = 0; cell < this.screen.WIDTH; cell++) {
                    x = this.registers.scx + cell;
                    //xcoor = Math.floor(x / Screen.PIXELS);

                    tile = this.getVramTile(x + (y * 32));
                    this.screen.setBufferPixel(x, y, tile[y % Screen.PIXELS][x % Screen.PIXELS]);
                }
                this.screen.printBufferRow(y);
                stat.interrupts.hblank.set();


            } else {
                console.log("ERROR, lcdc does not have bg enabled");
            }
        }
    }

    public requestRead(addr: number): number {
        //Vram
        let val;
        if (addr < 0xA000) {
            if (this.registers.stat.modeFlag.vramlock.get()) {
                val =  0xFF;
            }
            val =  this.memory.vram[addr - 0x8000];
        }
        //OAM
        else if (addr < 0xFEA0) {
            if (this.registers.stat.modeFlag.vramlock.get() || this.registers.stat.modeFlag.oamlock.get()) {
                val =  0xFF;
            }

            val =  this.memory.oam[addr - 0xFE00];
        } else if (addr == 0xFF40) {
            val =  this.registers.lcdc.getAll();
        } else if (addr == 0xFF42) {
            val =  this.registers.scy;
        } else if (addr == 0xFF43) {
            val =  this.registers.scx;
        } else if (addr == 0xFF44) {
            val =  this.registers.ly;
        } else if (addr == 0xFF45) {
            val =  this.registers.lyc;
        } else if (addr == 0xFF4A) {
            val =  this.registers.wy;
        } else if (addr == 0xFF4B) {
            val =  this.registers.wx;
        } else if (addr == 0xFF68) {
            val =  this.registers.bcps;
        } else if (addr == 0xFF69) {
            val =  this.registers.bcpd;
        } else if (addr == 0xFF6A) {
            val =  this.registers.ocps;
        } else if (addr == 0xFF6B) {
            val =  this.registers.ocpd;
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
            if (!this.registers.stat.modeFlag.vramlock.get()) {
                console.log("ERROR: VRAM locked");
                return;
            }

            this.memory.vram[addr - 0x8000] = val;
            this.updateVramTile(addr);
        }
        //OAM
        else if (addr < 0xFEA0) {
            if (!this.registers.stat.modeFlag.vramlock.get()) {
                console.log("ERROR: OAM locked");
                return;
            }

            this.memory.oam[addr - 0xFE00] = val;
            this.updateOamTile(addr);
        } else if (addr == 0xFF40) {
            this.registers.lcdc.setAll(val);
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
            for (let i = 0; i < 0x9F; i++) {
                let data = this.memory.readByte((val << 8) + i);
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

}