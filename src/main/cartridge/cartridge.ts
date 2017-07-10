import {Memory} from "../memory/memory";
import {Controller} from "./controllers/controller";
import {None} from "./controllers/none";
import {MBC1} from "./controllers/mbc1";
export class Cartridge {

    public url : string;
    public type : Type;
    public controller : Controller;

    //Enums
    private types : {[key : number]: Type} = {
        0 : {name : "NONE", id: 0, hasRom: false, hasRam: false},
        1 : {name : "MBC1", id: 1, hasRom: false, hasRam: false},
        2 : {name : "MBC1+RAM", id: 1, hasRom: false, hasRam: true},
        3 : {name : "MBC1+RAM+BATTERY", id: 1, hasRom: false, hasRam: true},
    };
    private romSizes : {[key : number] : number} =  {
        0 : 32,
        1 : 64,
        2 : 128,
        3 : 256,
        4 : 512,
        5 : 1024,
        6 : 2048,
        7 : 4049,
        8 : 8192,
        52 : 0,
        53 : 0,
        54 : 0,
    };
    private ramSizes : {[key : number] : number} = {
        0 : 0,
        1 : 2,
        2 : 8,
        3 : 32,
        4 : 128,
        5 : 64
    };

    constructor(rom : number[], url : string) {
        this.url = url;

        this.type  = this.types[rom[0x147]];
        this.type.romSize = this.romSizes[rom[0x148]];
        this.type.ramSize = this.ramSizes[rom[0x149]];

        switch (this.type.id){
            case 0:
                this.controller = new None(rom);
                break;
            case 1:
            case 2:
            case 3:
                this.controller = new MBC1(rom);
                break;
            default:
                throw "Unable to create cartridge for " + url;
        }

        console.info("-------------------------------------------------" + "\n"
            + "Successfully created cartridge for " + url + "\n"
            + "Type: " + this.type.name + "\n"
            + "ROM: " + this.type.romSize + "\n"
            + "RAM: " + this.type.ramSize + "\n"
            + "-------------------------------------------------" );
    }

    public readByte(addr: number) : number {
        return this.controller.readByte(addr);
    }

    public writeByte(addr: number, val : number) {
        this.controller.writeByte(addr, val);
    }

    public static load(url : string, memory : Memory) : Cartridge {
        var req = new XMLHttpRequest();

        req.open('GET', url, false);

        req.overrideMimeType('text/plain; charset=x-user-defined');
        req.send(null);

        var content = null;
        if (req.status != 200) {
            throw "Unable to locate cartridge at " + url;
        } else {
            content = req.responseText;
        }

        var bytes = [];
        for (var i = 0; i < content.length; ++i) {
            var code = content.charCodeAt(i);
            bytes.push(code & 0xFF);
        }

        var cartridge = new Cartridge(bytes, url);
        return cartridge;
    }
}

export interface Type {
    name : string;
    id : number;
    hasRom : boolean;
    hasRam : boolean;
    romSize? : number;
    ramSize? : number;
}



