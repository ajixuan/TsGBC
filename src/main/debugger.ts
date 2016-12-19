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

        $('#cpucycles').html(gameboy.cpu.cycles.toString());
        $('#pc').html("0x" + gameboy.cpu.registers.getPC().toString(16).toUpperCase());
        $('#sp').html("0x" + gameboy.cpu.registers.getSP().toString(16).toUpperCase());
    }

    public static init(gameboy : GameBoy) {
        Debugger.gameboy = gameboy;
        console.info("Debugger is ready!");
        Debugger.display();
    }
}
