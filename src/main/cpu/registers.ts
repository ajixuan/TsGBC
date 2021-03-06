/**
 * Created by hkamran on 12/5/2016.
 */
export class Registers {

    private a : number = 0;

    private f : { zero : number, subtract : number, half : number, carry : number} = {
        zero : 0,
        subtract : 0,
        half : 0,
        carry : 0
    };

    private b : number = 0;
    private c : number = 0;

    private d : number = 0;
    private e : number = 0;

    private h : number = 0;
    private l : number = 0;

    private sp : number = 0;
    private pc : number = 0;



    public clock : {m : number, t : number} = {
        m : 0,
        t : 0
    };


    constructor() {
        //Set flags to initial state
        this.setZeroFlag(1);
        this.setCarryFlag(1);
        this.setHalfFlag(1);
    }

    /**
     * PC (Program Counter) 16 bits
     *
     * Note: Holds the address of the next intructions
     */

    public setPC(num : number): void {
        //this.isValid(num, 0xFFFF, "Register argument to large for PC: " + num);
        this.pc = num;
    }

    public getPC(): number {
        return this.pc;
    }

    /**
     * SP (Stack Pointer) 16 bits
     *
     * Note: Pointer to the stack data (index)
     */

    public setSP(num : number): void {
        //this.isValid(num, 0xFFFF, "Register argument to large for SP: " + num);
        this.sp = num;
    }

    public getSP(): number {
        return this.sp;
    }

    /**
     * Register A & F (sometimes referred to as AF) 16 bits or 2x8 bits
     *
     * Note: A is the accumulator register and F holds the flags
     */

    public setA(num : number): void {
        //this.isValid(num, 0xFF, "Register argument to large for A: " + num);
        this.a = num;
    }

    public getA(): number {
        return this.a;
    }

    public setAF(num : number) : void {
        //this.isValid(num, 0xFFFF, "Register argument to large for AF: " + num);
        this.setA(num >> 8);  //high
        this.setF(num & 0xFF);    //low
    }

    public getAF() : number {
        return this.getA() << 8 | this.getF() & 0xFF;
    }

    /**
     * Register F - 8 bits
     *
     * ZSHC 0000
     *
     * (Z) Zero Flag
     * (S) Substract Flag
     * (H) Half Substract Flag
     * (C) Carry Flag
     */

    public setZeroFlag(num : number) {
        //this.isValid(num, 0x1, "Register argument to large for Zero: " + num);
        this.f.zero = num;
    }

    public getZeroFlag() : number {
        return this.f.zero;
    }

    public setSubtractFlag(num : number) {
        //this.isValid(num, 0x1, "Register argument to large for Subtract: " + num);
        this.f.subtract = num;
    }

    public getSubtractFlag() : number {
        return this.f.subtract;
    }

    public setHalfFlag(num : number) {
        //this.isValid(num, 0x1, "Register argument to large for Half: " + num);
        this.f.half = num;
    }

    public getHalfFlag() : number {
        return this.f.half;
    }

    public setCarryFlag(num : number) {
        //this.isValid(num, 0x1, "Register argument to large for Carry: " + num);
        this.f.carry = num;
    }

    public getCarryFlag() : number {
        return this.f.carry;
    }

    public setF(num : number): void {
        //this.isValid(num, 0xFF, "Register argument to large for F: " + num);
        this.f.zero =       (num & 0x80)? 1 : 0;
        this.f.subtract =   (num & 0x40)? 1: 0;
        this.f.half =       (num & 0x20)? 1: 0;
        this.f.carry =      (num & 0x10)? 1: 0;
    }


    public getF() : number {
        //MAX is 0xF0
        return this.f.zero << 7 | this.f.subtract << 6 | this.f.half << 5 | this.f.carry << 4;
    }

    /**
     * Register B & C (sometimes referred to as BC) 16 bits or 2x8 bits
     *
     * Note: These are utility registers
     */

    public setB(num : number): void {
        //this.isValid(num, 0xFF, "Register argument to large for B: " + num);
        this.b = num;
    }

    public getB() : number {
        return this.b & 0xFF;
    }

    public setC(num : number): void {
        //this.isValid(num, 0xFF, "Register argument to large for C: " + num);
        this.c = num;
    }

    public getC() : number {
        return this.c & 0xFF;
    }

    public setBC(num : number) : void {
        //this.isValid(num, 0xFFFF, "Register argument to large for BC: " + num);
        this.setB(num >> 8);       //high
        this.setC(num & 0xFF);    //low
    }

    public getBC() : number {
        return this.getB() << 8 | this.getC();
    }

    /**
     * Register D & E (sometimes referred to as DE) 16 bits or 2x8 bits
     *
     * Note: These are utility registers
     */

    public setD(num : number): void {
        //this.isValid(num, 0xFF, "Register argument to large for D: " + num);
        this.d = num;
    }

    public getD() : number {
        return this.d;
    }

    public setE(num : number): void {
        //this.isValid(num, 0xFF, "Register argument to large for E: " + num);
        this.e = num;
    }

    public getE() : number {
        return this.e & 0xFF;
    }

    public setDE(num : number) : void {
        //this.isValid(num, 0xFFFF, "Register argument to large for DE: " + num);
        this.setD(num >> 8);      //high
        this.setE(num & 0xFF);    //low
    }

    public getDE() : number {
        return this.getD() << 8 | this.getE();
    }

    /**
     * Register H & L (sometimes referred to as HL) 16 bits or 2x8 bits
     *
     * Note: These are utility registers
     */

    public setH(num : number): void {
        //this.isValid(num, 0xFF, "Register argument to large for H: " + num);
        this.h = num;
    }

    public getH() : number {
        return this.h;
    }

    public setL(num : number): void {
        //this.isValid(num, 0xFF, "Register argument to large for L: " + num);
        this.l = num;
    }

    public getL() : number {
        return this.l;
    }

    public setHL(num : number) : void {
        //this.isValid(num, 0xFFFF, "Register argument to large for HL: " + num);
        this.setH(num >> 8);  //high
        this.setL(num & 0xFF);    //low
    }

    public getHL() : number {
        return this.getH() << 8 | this.getL();
    }


    /**
     * Misc
     */

    private isValid(num : number, size: number, error : string): void {
        if (num == null || num > size || num < 0) {
            var err = new Error(error);
            throw err;
        }
    }

}