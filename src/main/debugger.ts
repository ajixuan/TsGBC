/**
 * Created by hkamran on 12/18/2016.
 */
import {GameBoy} from './gameboy';

export class Debugger {
    public static status : boolean = true;
    private static gameboy : GameBoy;

    private static logBuffer : Array<String> = new Array<String>();


    public static pushLog() : void {
        //Add to log
        var eventStr = "PC:" + Debugger.gameboy.cpu.registers.getPC().toString(16).toUpperCase()
            + " SP:" + Debugger.gameboy.cpu.registers.getSP().toString(16).toUpperCase();
        this.logBuffer.push(eventStr);
    }

    public static display() : void {

        if (Debugger.gameboy == null) {
            return console.error("Error: Debugger doesn't have GameBoy set!");
        }

        let gameboy = Debugger.gameboy;


        //Clear log if overflowing
        if($(".log li").length > 100){
            $(".log ul").empty();
        }

        if(this.logBuffer.length > 100){
            this.logBuffer.length = 0;
        }

        if (!Debugger.status) { return };

        let html = "";
        while(this.logBuffer.length > 0){
            html += "<li>"+this.logBuffer.shift()+"</li>";
        }

        $(".log ul").append(html);
        $(".log").scrollTop($(".log").prop("scrollHeight"));

        if (gameboy.cpu.last == null) {
            let eventStr = "ERROR";
            let eventElement = $(".log ul");
            eventElement.append("<li class='error'>" + eventStr + "</li>");
            $(".log").scrollTop($(".log").prop("scrollHeight"));
            return;
        }

        //Print to screen
        $('#cpucycles').html(gameboy.cpu.clock.t.toString());
        $('#ppucycles').html(gameboy.ppu.clock.toString());
        $('#ticks').html(gameboy.ticks.toString());
        $('#pc').html("0x" + gameboy.cpu.registers.getPC().toString(16).toUpperCase());
        $('#sp').html("0x" + gameboy.cpu.registers.getSP().toString(16).toUpperCase());

        $('#zero').html("z: " + Number(gameboy.cpu.registers.getZeroFlag()).toString(2));
        $('#subtract').html("s: " + Number(gameboy.cpu.registers.getSubtractFlag()).toString(2));
        $('#halfcarry').html("h: " + Number(gameboy.cpu.registers.getHalfFlag()).toString(2));
        $('#fullcarry').html("f: " + Number(gameboy.cpu.registers.getCarryFlag()).toString(2));

        $('#af').html("0x" + gameboy.cpu.registers.getAF().toString(16).toUpperCase());
        $('#bc').html("0x" + gameboy.cpu.registers.getBC().toString(16).toUpperCase());
        $('#de').html("0x" + gameboy.cpu.registers.getDE().toString(16).toUpperCase());
        $('#hl').html("0x" + gameboy.cpu.registers.getHL().toString(16).toUpperCase());

        $('#opcode').html("0x" + gameboy.cpu.last.opcode.toString(16).toUpperCase());
        $('#opname').html(gameboy.cpu.last.operation.name.toUpperCase());
        $('#opmode').html(gameboy.cpu.last.operation.mode.name.toUpperCase());
        $('#opaddr').html("0x" + gameboy.cpu.last.opaddr.toString(16).toUpperCase());
        $('#operand').html(gameboy.cpu.last.opaddr.toString(16).toUpperCase());

        //PPU Register
        $('#lcdc').html("0x" + gameboy.ppu.registers.lcdc.getAll().toString(16));
        $('#stat').html("0x" + gameboy.ppu.registers.stat.getAll().toString(16));
        $('#ly').html(gameboy.ppu.registers.ly.toString());

        //Interrupts
        $('#ime').html("0x" + gameboy.memory.interrupt.ime.toString(16));
        $('#if').html("0x" + gameboy.memory.interrupt.if.toString(16));
        $('#ie').html("0x" + gameboy.memory.interrupt.ie.toString(16));

        $('#tpf').change(function(){
            if($(this).val()) {
                gameboy.tpf = $(this).val()
            }
        });

        if (gameboy.cartridge.type) {
            $('#url').html(gameboy.cartridge.url);
            $('#type').html(gameboy.cartridge.type.name);
        }

    }

    public static init(gameboy : GameBoy) {
        Debugger.gameboy = gameboy;
        console.info("Debugger is ready!");
        Debugger.display();
    }

}
