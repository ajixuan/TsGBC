import {Joypad} from "./io/joypad";
export class Keyboard {

    joypad : Joypad;

    public static mapping : any = {
        up: 87,          //w
        down: 83,        //s
        left: 65,        //a
        right: 68,       //d
        a: 71,           //g
        b: 72,           //h
        start: 84,       //t
        select: 89,      //y
        space: 32        //space
    };

    constructor(joypad : Joypad) {
        this.joypad = joypad;

    }

    init() {

        document.onkeyup = function (e) {
            let code = e.keyCode;
            let key = Keyboard.mapping;

            console.log("Releasing" + code);
            if (code == key.up) {
                this.joypad.releaseUp();
            } else if (code == key.down) {
                this.joypad.releaseDown();
            } else if (code == key.left) {
                this.joypad.releaseLeft();
            } else if (code == key.right) {
                this.joypad.releaseRight();
            } else if (code == key.a) {
                this.joypad.releaseA();
            } else if (code == key.b) {
                this.joypad.releaseB();
            } else if (code == key.start) {
                this.joypad.releaseStart();
            } else if (code == key.select) {
                this.joypad.releaseSelect();
            }

        }.bind(this);

        document.onkeydown = function (e) {
            let code = e.keyCode;
            let key = Keyboard.mapping;

            console.log("Pressing " + code);
            if (code == key.up) {
                this.joypad.pressUp();
            } else if (code == key.down) {
                this.joypad.pressDown();
            } else if (code == key.left) {
                this.joypad.pressLeft();
            } else if (code == key.right) {
                this.joypad.pressRight();
            } else if (code == key.a) {
                this.joypad.pressA();
            } else if (code == key.b) {
                this.joypad.pressB();
            } else if (code == key.start) {
                this.joypad.pressStart();
            } else if (code == key.select) {
                this.joypad.pressSelect();
            }

        }.bind(this);

        console.info("Keyboard is binded to joypad!");
    }

}