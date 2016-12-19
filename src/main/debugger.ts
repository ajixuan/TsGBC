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

        var gameboy = Debugger.gameboy;

        if (gameboy.cpu.last == null) {
            var eventStr = "ERROR";
            var eventElement = $(".log ul");
            eventElement.append("<li class='error'>" + eventStr + "</li>");
            $(".log").scrollTop($(".log").prop("scrollHeight"));
            return;
        }

        $('#cpucycles').html(gameboy.cpu.cycles.toString());
        $('#ticks').html(gameboy.ticks.toString());
        $('#pc').html("0x" + gameboy.cpu.registers.getPC().toString(16).toUpperCase());
        $('#sp').html("0x" + gameboy.cpu.registers.getSP().toString(16).toUpperCase());

        $('#af').html("0x" + gameboy.cpu.registers.getAF().toString(16).toUpperCase());
        $('#bc').html("0x" + gameboy.cpu.registers.getBC().toString(16).toUpperCase());
        $('#de').html("0x" + gameboy.cpu.registers.getDE().toString(16).toUpperCase());
        $('#hl').html("0x" + gameboy.cpu.registers.getHL().toString(16).toUpperCase());

        $('#opcode').html("0x" + gameboy.cpu.last.opcode.toString(16).toUpperCase());
        $('#opname').html(gameboy.cpu.last.operation.name.toUpperCase());
        $('#opmode').html(gameboy.cpu.last.operation.mode.name.toUpperCase());
        $('#opaddr').html("0x" + gameboy.cpu.last.opaddr.toString(16).toUpperCase());


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
