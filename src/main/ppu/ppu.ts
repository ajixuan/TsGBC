import {Memory} from "../memory/memory";
import {Screen} from "./screen";
import {Registers} from "./registers";

export class Ppu {
    private screen: Screen;
    private memory: Memory;
    private tileset: Array<Array<Array<number>>>;
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
        this.tileset = [];
        this.registers.reset();
        this.clock = 0;

        //Go through all tiles
        for (let i = 0; i < 384; i++) {
            this.tileset[i] = [];

            //For each tile there are 8 bits
            for (let j = 0; j < 8; j++) {
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
        let tile = (addr >> 4) & 0x1FF;

        // Find the row number of the tile
        let y = (addr >> 1) & 0x7;
        let pindex;

        //8 bits
        for (let x = 0; x < 8; x++) {
            pindex = 1 << x;

            this.tileset[tile][y][x] =
                this.memory.readByte(addr) & pindex +
                this.memory.readByte(addr + 1) & pindex;
        }
    }

    /**
     * Helper function for getting the vramlock tile in tile
     * object form
     * @param tile
     */
    private getVramTile(tile: number): Array<Array<number>> {

        //-------------Memory in map 1
        if (this.registers.lcdc.bgmap.get()) {
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
    public renderscan(cycles: number): void {
        this.clock += cycles;

        //Set the ly,lyc coincidence interrupt
         if (this.registers.ly == this.registers.lyc) {
            this.registers.stat.interrupts.lycoincidence.set();
         }

        //Cycle through stat
        if (this.registers.stat.modeFlag.hblank.get() && this.clock >= 204) {
            this.registers.stat.modeFlag.oamlock.set();

            if(this.registers.stat.interrupts.lycoincidence.get()){
                this.registers.stat.interrupts.lycoincidence.unset()
            }

            this.registers.ly++;
            this.clock = 0;

        } else if (this.registers.stat.modeFlag.vblank.get() && this.clock >= 456) {

            if (this.registers.ly > 153 || this.registers.ly == 0) {
                this.registers.ly = 0;
                this.registers.stat.modeFlag.vramlock.set();
                this.registers.stat.interrupts.vblank.unset();
            } else {
                this.registers.ly++;
                this.clock = 0;
            }

        } else if (this.registers.stat.modeFlag.oamlock.get() && this.clock >= 80) {
            this.registers.lcdc.bgon.set();
            this.registers.stat.modeFlag.vramlock.set();
            this.clock = 0;

        } else if (this.registers.stat.modeFlag.vramlock.get() && this.clock >= 172) {
            if (this.registers.lcdc.bgon.get() & this.registers.lcdc.lcdon.get()) {
                //Vertical blank
                if (this.registers.ly == 144) {
                    this.registers.stat.interrupts.vblank.set();
                    //this.screen.printBuffer();

                } else {
                    //Get the tile of our current ly
                    let y, x, tile, ycoor, xcoor;

                    //Y coordinate does not change during line render
                    y = this.registers.ly + this.registers.scy;
                    ycoor = Screen.TILES * Math.floor(y / Screen.PIXELS);

                    //Render whole line
                    for (let cell = 0; cell < this.screen.WIDTH; cell++) {
                        x = this.registers.scx + cell;
                        xcoor = Math.floor(x / Screen.PIXELS);

                        //Get new tile
                        if (cell % Screen.PIXELS == 0) {
                            tile = this.getVramTile(xcoor + ycoor % 256);
                        }

                        this.screen.setBufferPixel(x, y, tile[y % Screen.PIXELS][x % Screen.PIXELS]);
                    }
                    this.screen.printBuffer();
                    this.registers.stat.interrupts.hblank.set();
                }

                this.clock = 0;
            }
        }
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
            this.updateTile(addr);

            //OAM
        } else if (addr < 0xFEA0) {
            if (!this.registers.stat.modeFlag.vramlock.get()) {
                console.log("ERROR: OAM locked");
                return;
            }

            this.memory.oam[addr - 0xFE00] = val;

        } else {
            this.writeByte(addr, val);
        }
    }

    /**
     * Gpu handles writing bytes to its own registers
     * @param addr
     * @param val
     */
    private writeByte(addr: number, val: number): void {
        switch (addr) {
            case 0xFF40:
                if (val & 0x01) this.registers.lcdc.bgon.set();
                if (val & 0x02) this.registers.lcdc.objon.set();
                if (val & 0x04) this.registers.lcdc.objsize.set();
                if (val & 0x08) this.registers.lcdc.tilemap.set();
                if (val & 0x10) this.registers.lcdc.bgwin.set();
                if (val & 0x20) this.registers.lcdc.objon.set();
                if (val & 0x40) this.registers.lcdc.bgwin.set();
                if (val & 0x80) this.registers.lcdc.lcdon.set();
                break;
            case 0xFF42:
                this.registers.scy = val;
                break;
            case 0xFF43:
                this.registers.scx = val;
                break;
            case 0xFF44:
                this.registers.ly = val;
                break;
            case 0xFF45:
                this.registers.lyc = val;
                break;
            case 0xFF46:
                //DMA
                //Transfers 40 x 32 bits of data
                //val is the starting address of transfer
                //val is always the upper 8 bits, so need to be shifted
                for (let i = 0; i < 0x9F; i++) {
                    let data = this.memory.readByte((val << 8) + i);
                    this.memory.oam[i] = data;
                }
                break;
            case 0xFF4A:
                this.registers.wy = val;
                break;
            case 0xFF4B:
                this.registers.wx = val;
                break;
            case 0xFF68:
                this.registers.bcps = val;
                break;
            case 0xFF69:
                this.registers.bcpd = val;
                break;
            case 0xFF6A:
                this.registers.ocps = val;
                break;
            case 0xFF6B:
                this.registers.ocpd = val;
                break;
        }
    }

    public readByte(addr: number): number {

        switch (addr) {
            case 0xFF40:
                return this.registers.lcdc.getAll();
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