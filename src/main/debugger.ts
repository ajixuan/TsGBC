/**
 * Created by hkamran on 12/18/2016.
 */
import {GameBoy} from './gameboy';

export class Debugger {
    public static status: boolean = true;
    private static gameboy: GameBoy;
    private static logLines: number = 500;
    private static logBuffer: Array<String> = new Array<String>();

    private static bgmap: Array<Number> = Array.apply(null, Array(0x800)).map(Number.prototype.valueOf, 0);
    private static COLORS: string[] = [
        "#000000",
        "#515151",
        "#9e9e9e",
        "#dee0e2",
        "#a00000"
    ];
    private static ZOOM : number = 1.5;


    public static pushLog(eventStr : String): void {
        //Add to log
        if(this.logBuffer){
            this.logBuffer.length = 0;

        }
        this.logBuffer.push(eventStr);
    }

    public static clearLog(): void {
        $(".log ul").empty();
    }

    public static display(): void {

        if (Debugger.gameboy == null) {
            return console.error("Error: Debugger doesn't have GameBoy set!");
        }

        let gameboy = Debugger.gameboy;

        //Clear log if overflowing
        if ($(".log li").length > Debugger.logLines) {
            Debugger.clearLog();
        }

        if (this.logBuffer.length > Debugger.logLines) {
            this.logBuffer.length = 0;
        }

        let html = "";
        while (this.logBuffer.length > 0) {
            html += "<li>" + this.logBuffer.shift() + "</li>";
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
        $('#ime').html("0x" + gameboy.memory.interrupts.ime.toString(16));
        $('#if').html("0x" + gameboy.memory.interrupts.if.toString(16));
        $('#ie').html("0x" + gameboy.memory.interrupts.ie.toString(16));

        $('#tpf').change(function () {
            if ($(this).val()) {
                gameboy.tpf = $(this).val()
            }
        });

        if (gameboy.cartridge.type) {
            $('#url').html(gameboy.cartridge.url);
            $('#type').html(gameboy.cartridge.type.name);
        }

        Debugger.printStack();
    }


    public static renderBGmap() {
        let gameboy = Debugger.gameboy;
        let bgmap: any = document.getElementById("bgmap");
        let zoom = Debugger.ZOOM;

        bgmap.width = 32 * 9 * zoom;
        bgmap.height = 32 * 9 * zoom;
        let context : any = bgmap.getContext("2d");

        let block = 0;
        for (let i = 0; i < 0x800; i++) {
            let tilenum = gameboy.memory.vram[0x1800 + i];
            let tile = gameboy.ppu.vramTileset[tilenum];

            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    context.fillStyle = Debugger.COLORS[tile[y][x]];
                    context.fillRect(((block % 32) * 9 + x) * zoom , (Math.floor(block / 32) * 9 + y) * zoom , zoom, zoom);
                }

                //Print last red dot
                context.fillStyle = Debugger.COLORS[4];
                context.fillRect(((block % 32) * 9 + 8) * zoom, (Math.floor(block / 32) * 9  + y) * zoom, zoom, zoom);
            }

            //Print bottom border
            for (let x = 0; x < 9; x++) {
                context.fillStyle = Debugger.COLORS[4];
                context.fillRect(((block % 32) * 9 + x) * zoom , (Math.floor(block / 32) * 9 + 8) * zoom , zoom, zoom);
            }

            block++;
        }
    }

    public static renderTilemap() {
        let gameboy = Debugger.gameboy;
        let bgmap: any = document.getElementById("tilemap");
        let zoom = Debugger.ZOOM;

        bgmap.width = 16 * 9 * zoom;
        bgmap.height = 21 * 9 * zoom;
        let context : any = bgmap.getContext("2d");

        for(let block = 0; block < 384; block++){
            let tile = gameboy.ppu.vramTileset[block];

            //Print 1 block
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    context.fillStyle = Debugger.COLORS[tile[y][x]];
                    context.fillRect(((block % 16) * 9 + x) * zoom, (Math.floor(block / 16) * 9 + y ) * zoom, zoom, zoom);
                }

                //Print last red dot
                context.fillStyle = Debugger.COLORS[4];
                context.fillRect(((block % 16) * 9 + 8) * zoom, (Math.floor(block / 16) * 9 + y) * zoom, zoom, zoom);
            }

            //Print bottom border
            for (let x = 0; x < 9; x++) {
                context.fillStyle = Debugger.COLORS[4];
                context.fillRect(((block % 16) * 9 + x )* zoom, (Math.floor(block / 16) * 9 + 8) * zoom, zoom, zoom);
            }
        }
    }

    public static printStack(){
        let gameboy = Debugger.gameboy;
        let sp = gameboy.cpu.registers.getSP();

        //Cleanup
        $("#stack ul").html('');

        //Print up and down 10 addresses in stack
        for(let i = sp + 10; i > sp - 10; i-=2){
            let upper: number = 0;
            let lower: number = 0;

            if(i > 0xFFFE){
                continue
            } else if (i < 0xC000) {
                upper = gameboy.memory.cartridge.readByte(i) ; lower = gameboy.memory.cartridge.readByte(i - 1);
            } else if (i < 0xE000) {
                upper = gameboy.memory.cpu.ram[i - 0xC000] ; lower = gameboy.memory.cpu.ram[i - 1 - 0xC000];
            } else if (i <= 0xFFFE) {
                upper = gameboy.memory.cpu.stack[i - 0xFF80]  ; lower = gameboy.memory.cpu.stack[i - 1 - 0xFF80];

            } else {
                continue
            }

            if(i == sp){
                //Create cursor
                $("#stack ul").append("<li style='background-color:#3394FF'>"
                    + "<div style='float:left;margin-left: 20px'>" + i.toString(16) + ":" + upper.toString(16)
                    + "</div><div style='float:left;margin-left: 20px'>" + (i-1).toString(16) + ":" + lower.toString(16)
                    + "</div><div style='clear:both'></div></li>");
            } else {
                $("#stack ul").append("<li>" +
                    "<div style='float:left;margin-left: 20px'>"
                    + i.toString(16) + ":" + upper.toString(16) + "</div><div style='float:left;margin-left:20px'> "
                    + (i-1).toString(16) + ":" + lower.toString(16) + "</div><div style='clear:both'></div></li>");
            }
        }
    }


    public static init(gameboy: GameBoy) {
        Debugger.gameboy = gameboy;
        console.info("Debugger is ready!");
        Debugger.display();
    }

}
