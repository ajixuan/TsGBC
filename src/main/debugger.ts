/**
 * Created by hkamran on 12/18/2016.
 */
import {GameBoy} from './gameboy';

export class Debugger {
    public static status : boolean = true;
    private static gameboy : GameBoy;

    public static display() : void {
        if (!Debugger.status) {
            return;
        }

        if (Debugger.gameboy == null) {
            console.error("Error: Debugger doesn't have GameBoy set!");
        }

        let gameboy = Debugger.gameboy;

        if (gameboy.cpu.last == null) {
            let eventStr = "ERROR";
            let eventElement = $(".log ul");
            eventElement.append("<li class='error'>" + eventStr + "</li>");
            $(".log").scrollTop($(".log").prop("scrollHeight"));
            return;
        }

        $('#cpucycles').html(gameboy.cpu.clock.t.toString());
        $('#ticks').html(gameboy.ticks.toString());
        $('#pc').html("0x" + gameboy.cpu.registers.getPC().toString(16).toUpperCase());
        $('#sp').html("0x" + gameboy.cpu.registers.getSP().toString(16).toUpperCase());

        $('#flags').html(Number(gameboy.cpu.registers.getF() >> 4).toString(2));


        $('#af').html("0x" + gameboy.cpu.registers.getAF().toString(16).toUpperCase());
        $('#bc').html("0x" + gameboy.cpu.registers.getBC().toString(16).toUpperCase());
        $('#de').html("0x" + gameboy.cpu.registers.getDE().toString(16).toUpperCase());
        $('#hl').html("0x" + gameboy.cpu.registers.getHL().toString(16).toUpperCase());
        $('#scanlines').html(gameboy.ppu.registers.ly.toString());

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


        if (gameboy.cartridge.type) {
            $('#url').html(gameboy.cartridge.url);
            $('#type').html(gameboy.cartridge.type.name);
        }

        //Add to log
        var eventStr = "PC:" + gameboy.cpu.registers.getPC().toString(16).toUpperCase()
            + " SP:" + gameboy.cpu.registers.getSP().toString(16).toUpperCase();
        var eventElement = $(".log ul");
        eventElement.append("<li>"+eventStr+"</li>");
        $(".log").scrollTop($(".log").prop("scrollHeight"));
    }

    public static init(gameboy : GameBoy) {
        Debugger.gameboy = gameboy;
        console.info("Debugger is ready!");
        Debugger.display();
    }
}
