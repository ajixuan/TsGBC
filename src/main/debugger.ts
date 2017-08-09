/**
 * Created by hkamran on 12/18/2016.
 */
import {GameBoy} from './gameboy';

export class Debugger {
    public static status: boolean = true;
    private static gameboy: GameBoy;
    private static logLimit: 500;
    private static bgmap: Array<Number> = Array(0x800).map(Number.prototype.valueOf, 0);
    private static COLORS: string[] = [
        "#000000",
        "#515151",
        "#9e9e9e",
        "#dee0e2",
        "#a00000"
    ];
    private static ZOOM: number = 1.5;


    public static printLog(): void {
        //Add to log
        let cpu = Debugger.gameboy.cpu;
        let memory = Debugger.gameboy.memory;
        let eventStr =
            "PC:" + cpu.registers.getPC().toString(16).toUpperCase()
            //            + " Op:" + this.last.opcode.toString(16).toUpperCase()
            + " SP:" + cpu.registers.getSP().toString(16).toUpperCase() + "|"
            + " AF:" + cpu.registers.getAF().toString(16).toUpperCase() + "|"
            + " BC:" + cpu.registers.getBC().toString(16).toUpperCase() + "|"
            + " DE:" + cpu.registers.getDE().toString(16).toUpperCase() + "|"
            + " HL:" + cpu.registers.getHL().toString(16).toUpperCase() + "|"
            + " LCDC:" + memory.ppu.registers.lcdc.getAll().toString(16).toUpperCase() + "|"
            + " STAT:" + memory.ppu.registers.stat.getAll().toString(16).toUpperCase() + "|"
            + " ie:" + cpu.interrupts.ie.toString(16).toUpperCase() + "|"
            + " if:" + cpu.interrupts.if.toString(16).toUpperCase();

        if (Debugger.gameboy.cpu.last == null) {
            let eventStr = "ERROR";
            let eventElement = $(".log ul");
            eventElement.append("<li class='error'>" + eventStr + "</li>");
            $(".log").scrollTop($(".log").prop("scrollHeight"));
            return;
        }


        if ($(".log li").length > Debugger.logLimit) {
            $(".log ul").empty();
        }

        let html = "<li>" + eventStr + "</li>";

        $(".log ul").append(html);
        $(".log").scrollTop($(".log").prop("scrollHeight"));

    }

    public static display(): void {

        if (Debugger.gameboy == null) {
            return console.error("Error: Debugger doesn't have GameBoy set!");
        }

        let gameboy = Debugger.gameboy;

        Debugger.printLog();
        Debugger.printStack();

        //Print to screen
        $('#cpucycles').html(gameboy.cpu.clock.t.toString());
        $('#ppucycles').html(gameboy.ppu.clock.toString());
        $('#ticks').html(gameboy.ticks.toString());
        $('#pc').html("0x" + gameboy.cpu.registers.getPC().toString(16).toUpperCase());
        $('#sp').html("0x" + gameboy.cpu.registers.getSP().toString(16).toUpperCase());

        $('#zero').html("z: " + Number(gameboy.cpu.registers.getZeroFlag()).toString(2));
        $('#subtract').html("s: " + Number(gameboy.cpu.registers.getSubtractFlag()).toString(2));
        $('#halfcarry').html("h: " + Number(gameboy.cpu.registers.getHalfFlag()).toString(2));
        $('#fullcarry').html("c: " + Number(gameboy.cpu.registers.getCarryFlag()).toString(2));

        $('#af').html("0x" + gameboy.cpu.registers.getAF().toString(16).toUpperCase());
        $('#bc').html("0x" + gameboy.cpu.registers.getBC().toString(16).toUpperCase());
        $('#de').html("0x" + gameboy.cpu.registers.getDE().toString(16).toUpperCase());
        $('#hl').html("0x" + gameboy.cpu.registers.getHL().toString(16).toUpperCase());

        if (gameboy.cpu.last) {
            $('#opcode').html("0x" + gameboy.cpu.last.opcode.toString(16).toUpperCase());
            $('#opname').html(gameboy.cpu.last.operation.name.toUpperCase());
            $('#opmode').html(gameboy.cpu.last.operation.mode.name.toUpperCase());
            $('#opaddr').html("0x" + gameboy.cpu.last.opaddr.toString(16).toUpperCase());
            $('#operand').html(gameboy.cpu.last.opaddr.toString(16).toUpperCase());
        }

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

    }


    public static renderBGmap() {
        let gameboy = Debugger.gameboy;
        let bgmap: any = document.getElementById("bgmap");
        let zoom = Debugger.ZOOM;

        bgmap.width = 32 * 9 * zoom;
        bgmap.height = 32 * 9 * zoom;
        let context: any = bgmap.getContext("2d");

        let block = 0;
        for (let i = 0; i < 0x800; i++) {
            let tilenum = gameboy.memory.vram[0x1800 + i];
            let tile = gameboy.ppu.vramTileset[tilenum];

            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    context.fillStyle = Debugger.COLORS[tile[y][x]];
                    context.fillRect(((block % 32) * 9 + x) * zoom, (Math.floor(block / 32) * 9 + y) * zoom, zoom, zoom);
                }

                //Print last red dot
                context.fillStyle = Debugger.COLORS[4];
                context.fillRect(((block % 32) * 9 + 8) * zoom, (Math.floor(block / 32) * 9 + y) * zoom, zoom, zoom);
            }

            //Print bottom border
            for (let x = 0; x < 9; x++) {
                context.fillStyle = Debugger.COLORS[4];
                context.fillRect(((block % 32) * 9 + x) * zoom, (Math.floor(block / 32) * 9 + 8) * zoom, zoom, zoom);
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
        let context: any = bgmap.getContext("2d");

        for (let block = 0; block < 384; block++) {
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
                context.fillRect(((block % 16) * 9 + x ) * zoom, (Math.floor(block / 16) * 9 + 8) * zoom, zoom, zoom);
            }
        }
    }

    public static printStack() {
        let gameboy = Debugger.gameboy;
        let sp = gameboy.cpu.registers.getSP();

        //Cleanup
        $("#stack ul").html('');

        //Print up and down 10 addresses in stack
        for (let cur = sp + 10; cur > sp - 10; cur -= 2) {

            //Upper and lower bits
            let upper = 0;
            let lower = 0;

            //Handle stack jumps
            if (cur < 0xC000) {
                upper = gameboy.memory.cartridge.readByte(cur);
                lower = gameboy.memory.cartridge.readByte(cur - 1);
            } else if (cur < 0xE000) {
                upper = gameboy.memory.cpu.ram[cur - 0xC000];
                lower = gameboy.memory.cpu.ram[cur - 1 - 0xC000];
            } else if (cur >= 0xFF80 && cur <= 0xFFFE) {
                upper = gameboy.memory.cpu.stack[cur - 0xFF80];
                lower = gameboy.memory.cpu.stack[cur - 1 - 0xFF80];
            } else {
                continue;
            }

            if (cur == sp) {
                //Create cursor
                $("#stack ul").append("<li style='background-color:#3394FF'>"
                    + "<div style='float:left;margin-left: 20px'>" + cur.toString(16) + ":" + upper.toString(16)
                    + "</div><div style='float:left;margin-left: 20px'>" + (cur - 1).toString(16) + ":" + lower.toString(16)
                    + "</div><div style='clear:both'></div></li>");
            } else {
                $("#stack ul").append("<li>" +
                    "<div style='float:left;margin-left: 20px'>"
                    + cur.toString(16) + ":" + upper.toString(16) + "</div><div style='float:left;margin-left:20px'> "
                    + (cur - 1).toString(16) + ":" + lower.toString(16) + "</div><div style='clear:both'></div></li>");
            }
        }
    }

    public static initMemmap() {
        var row:any = [],
            memory = Debugger.gameboy.memory;
        for (let i = 0; i <= 0xFFF0; i += 0x10) {
            (function (addr, row) {
                setTimeout(function () {
                    row[addr/0x10] = "<tr>" + "<th>0x" + addr.toString(16) + "</th>";
                    for(let i =0; i<=0xF; i++){
                        row[addr/0x10] += "<td>" + memory.readByte(addr+i) + "</td>"
                    }
                    row[addr/0x10] += "</tr>";
                    if((i+addr) % 0x2220 == 0){
                        row.map(function(curr){$("#memmap").append(curr)});
                    }
                }, 2);
            })(i, row);
        }
    }


    public static printmap() {
        let row;
        for (let i = 0; i <= 0xFFF0; i += 0x10) {

            // for (let j = 0; j <= 0xF; j++) {
            //     row += "<td>" + memory.readByte(addr + j) + "</td>";
            // }
            // row += "</tr>";
        }
    }


    public static init(gameboy: GameBoy) {
        Debugger.gameboy = gameboy;
        console.info("Debugger is ready!");
        Debugger.initMemmap();
        Debugger.display();
    }

}
