import {Memory} from "../memory/memory";
import {Screen} from "./screen";
export class Ppu {

    private screen : Screen;

    constructor(memory : Memory) {
        this.screen = new Screen();
    }

}