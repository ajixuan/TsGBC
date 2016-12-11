/**
 * Created by hkamran on 12/5/2016.
 */


export class Memory {

    //PPU
    private bank0 : number[] = [0x1800];
    private data1 : number[] = [0x400];
    private data2 : number[] = [0x400];

    //switchable ram
    private expansion : number[] = [0x2000];

    private ram : number[] = [0x2000];

    private oam : number[] = [0xA0];
    private io : number[] = [0x80];
    private stack : number[] = [0x7E];
    private interrupt : number[] = [0x1];


    public writeByte(addr: number, val : number): void {
        if (addr < 0x8000) {
            //Cartridge
        } else if (addr < 0xA000) {
            //PPU
        } else if (addr < 0xC000) {
            //Switchable RAM
        } else if (addr < 0xE000) {
            //RAM
        } else if (addr < 0xFE00) {
            //RAM - 0x2000
        } else if (addr < 0xFEA0) {
            //OAM
        } else if (addr < 0xFF00) {
            //error
        } else if (addr < 0xFF80) {
            //io
        } else if (addr < 0xFFFF) {
            //stack
        } else if (addr == 0xFFFF) {
            //interrupt
        } else {
            throw "error";
        }
    }

    public readByte(addr: number): number {
        if (addr < 0x8000) {
            //Cartridge
        } else if (addr < 0xA000) {
            //PPU
        } else if (addr < 0xC000) {
            //Switchable RAM
        } else if (addr < 0xE000) {
            //RAM
        } else if (addr < 0xFE00) {
            //RAM - 0x2000
        } else if (addr < 0xFEA0) {
            //OAM
        } else if (addr < 0xFF00) {
            //error
        } else if (addr < 0xFF80) {
            //io
        } else if (addr < 0xFFFF) {
            //stack
        } else if (addr == 0xFFFF) {
            //interrupt
        } else {
            throw "error";
        }
        return 0;
    }

    public writeWord(addr: number, val : number): void {
        //TODO
    }

    public readWord(address: number): number {
        //TODO
        return 0;
    }

    public pushByte(val : number): void {
        //TODO
    }

    public popByte() : number {
        //TODO
        return 0;
    }

}