/**
 * Created by hkamran on 12/18/2016.
 */
import {GameBoy} from './gameboy';

export class Debugger {
    public static status: boolean = false;
    private static memqueue = {};
    private static memmap : Element = document.getElementsByTagName("tbody")[0];
    private static gameboy: GameBoy;
    private static logLimit = 500;
    private static bgmap: Array<Number> = Array(0x800).fill(0);
    private static COLORS: string[] = [
        "#000000",
        "#515151",
        "#9e9e9e",
        "#dee0e2",
        "#a00000"
    ];
    private static ZOOM: number = 1.5;

    public static display(): void {
        let gameboy = Debugger.gameboy;

        if (gameboy == null) {
            return console.error("Error: Debugger doesn't have GameBoy set!");
        }

        Debugger.printLog();
        Debugger.printStack();

        //Print to screen
        document.getElementById('cpucycles').innerHTML = gameboy.cpu.clock.t.toString();
        document.getElementById('ppucycles').innerHTML = gameboy.ppu.clock.toString();
        document.getElementById('ticks').innerHTML = gameboy.ticks.toString();
        document.getElementById('pc').innerHTML = "0x" + gameboy.cpu.registers.getPC().toString(16).toUpperCase();
        document.getElementById('sp').innerHTML = "0x" + gameboy.cpu.registers.getSP().toString(16).toUpperCase();

        document.getElementById('zero').innerHTML = "z: " + Number(gameboy.cpu.registers.getZeroFlag()).toString(2);
        document.getElementById('subtract').innerHTML = "s: " + Number(gameboy.cpu.registers.getSubtractFlag()).toString(2);
        document.getElementById('halfcarry').innerHTML = "h: " + Number(gameboy.cpu.registers.getHalfFlag()).toString(2);
        document.getElementById('fullcarry').innerHTML = "c: " + Number(gameboy.cpu.registers.getCarryFlag()).toString(2);

        document.getElementById('af').innerHTML = "0x" + gameboy.cpu.registers.getAF().toString(16).toUpperCase();
        document.getElementById('bc').innerHTML = "0x" + gameboy.cpu.registers.getBC().toString(16).toUpperCase();
        document.getElementById('de').innerHTML = "0x" + gameboy.cpu.registers.getDE().toString(16).toUpperCase();
        document.getElementById('hl').innerHTML = "0x" + gameboy.cpu.registers.getHL().toString(16).toUpperCase();

        if (gameboy.cpu.last) {
            document.getElementById('opcode').innerHTML = "0x" + gameboy.cpu.last.opcode.toString(16).toUpperCase();
            document.getElementById('opname').innerHTML = gameboy.cpu.last.operation.name.toUpperCase();
            document.getElementById('opmode').innerHTML = gameboy.cpu.last.operation.mode.name.toUpperCase();
            document.getElementById('opaddr').innerHTML = "0x" + gameboy.cpu.last.opaddr.toString(16).toUpperCase();
            document.getElementById('operand').innerHTML = gameboy.cpu.last.opaddr.toString(16).toUpperCase();
        }

        //PPU Register
        document.getElementById('lcdc').innerHTML = "0x" + gameboy.ppu.registers.lcdc.getAll().toString(16);
        document.getElementById('stat').innerHTML = "0x" + gameboy.ppu.registers.stat.getAll().toString(16);
        document.getElementById('ly').innerHTML = gameboy.ppu.registers.ly.toString();

        //Interrupts
        document.getElementById('ime').innerHTML = "0x" + gameboy.memory.interrupts.ime.toString(16);
        document.getElementById('if').innerHTML = "0x" + gameboy.memory.interrupts.if.toString(16);
        document.getElementById('ie').innerHTML = "0x" + gameboy.memory.interrupts.ie.toString(16);

        $('#tpf').change(function () {
            if ($(this).val()) {

                gameboy.tpf = Number.parseInt($(this).val().toString());
            }
        });

        if (gameboy.cartridge.type) {
            document.getElementById('url').innerHTML = gameboy.cartridge.url;
            document.getElementById('type').innerHTML = gameboy.cartridge.type.name;
        }
    }

    public static printLog(): void {
        //Add to log
        let cpu = Debugger.gameboy.cpu;
        let memory = Debugger.gameboy.memory;
        let log :Element= document.getElementsByClassName("log")[0];
        let li = log.getElementsByTagName("li");
        let ul = log.getElementsByTagName("ul")[0];
        let html = document.createElement("li");
        html.innerHTML =
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
            let eventElement = document.createElement("li");
            eventElement.setAttribute("class","error");
            eventElement.innerHTML = "ERROR";
            ul.appendChild(eventElement);
            log.scrollTo(0, log.scrollHeight);
            return;
        }

        if (li.length > Debugger.logLimit) {
            log.removeChild(ul);
            ul = document.createElement("ul");
            log.appendChild(ul);
            console.log("ye");
        }

        ul.appendChild(html);
        log.scrollTo(0, log.scrollHeight);
    }


    public static renderBGmap() {
        let gameboy = Debugger.gameboy;
        let bgmap: any = document.getElementById("vrammap");
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
        let bgmap: any = document.getElementById("vrammap");
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

    public static resetMemmap() {
        let queue = {};
        let memory = Debugger.gameboy.memory;
        $("tbody tr").remove();

        for (let i = 0x8000; i <= 0xFFF0; i += 0x10) {
            (function (addr) {
                setTimeout(function () {
                    let keys;
                    let index = Math.floor((addr - 0x8000) / 0x10);

                    //Header
                    let th : Element = document.createElement("th");
                    th.innerHTML = "0x" + addr.toString(16);

                    //Row
                    queue[index] = document.createElement("tr");
                    queue[index].appendChild(th);
                    for (let j = 0; j <= 0xF; j++) {
                        //Column
                        let td : Element = document.createElement("td");
                        td.innerHTML = memory.readByte(addr + j).toString(16);
                        queue[index].appendChild(td);
                    }

                    if (addr == 0xFFF0) {
                        keys = Object.keys(queue);
                        for(let k = 0; k<keys.length; k++){
                            Debugger.memmap.appendChild(queue[keys[k]]);
                        }
                        queue = {};
                    }
                }, 100);
            })(i);
        }
    }

    public static updatemap(addr: number): void {
        let val = Debugger.gameboy.memory.readByte(addr);

        if (val == null) {return}

        if (Debugger.status) {
            Debugger.writeMem(addr, val);
        }

        Debugger.memqueue[addr] = val;
    }

    public static clearMemqueue() {
        Object.keys(Debugger.memqueue).map(function (addr) {
                Debugger.writeMem(Number.parseInt(addr), Debugger.memqueue[addr]);
        });

        Debugger.memqueue = {};
    }


    private static writeMem(addr: number, val: number) {
        let tr = Math.floor((addr - 0x8000) / 0x10);
        let td = (addr & 0xF) + 1;

        try{
            Debugger.memmap
                .children[tr]
                .children[td]
                .innerHTML = val.toString(16);
        } catch(e){
            console.log(e.toString());
            console.log(tr + " " + td);
        }
    }


    public static init(gameboy: GameBoy) {
        Debugger.gameboy = gameboy;
        Debugger.status = true;
        console.info("Debugger is ready!");
        Debugger.resetMemmap();
        Debugger.display();
    }

}
