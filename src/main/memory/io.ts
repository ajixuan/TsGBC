export class Io {

    //Controller
    private p1 : number = 0;    //0xFF00

    //Divider
    private div : number = 0;   //0xFF04

    //Timers
    private tma : number = 0;   //0xFF05
    private tima : number = 0;  //0xFF06
    private tac : number = 0;   //0xFF07


    constructor(){
        this.p1 = 0xCF;
        this.div = 0xAB;
        this.tma = 0;
        this.tima = 0;
        this.tac = 0;
    }


    /**
     * Controller
     */
    public setP1(num:number): void {
        this.isValid(num, 0xFF, "Register argument too large for p1: " + num);
        num &= 0x3F;
        this.p1 &= 0xCF;
        this.p1 |= num;
    }

    public getP1() : number {
        return this.p1;
    }

    /**
     * Divider
     */
    public setDiv(num:number): void {
        this.isValid(num, 0xFF, "Register argument too large for p1: " + num);
        this.div += num;
    }

    public getDiv() : number {
        return this.div;
    }

    /**
     * Timer
     */
    public setTima(num:number):void{
        this.isValid(num, 0xFF, "Register argument too large for p1: " + num);
        this.tima += num;
    }

    public getTima() : number {
        return this.tima;
    }


    public setTma(num:number):void{
        this.isValid(num, 0xFF, "Register argument too large for p1: " + num);
        this.tma += num;
    }

    public getTma() : number {
        return this.tma;
    }


    public setTac(num:number):void{
        this.isValid(num, 0xFF, "Register argument too large for p1: " + num);
        this.tac += num;
    }

    public getTac() : number {
        return this.tac;
    }


    /**`
     * Misc
     */

    private isValid(num : number, size: number, error : string): void {
        if (num == null || num > size || num < 0) {
            throw error;
        }
    }



}