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

            console.log("Pressing " + code);
            if (code == key.up) {
                this.joypad.release.up();
            } else if (code == key.down) {
                this.joypad.release.down();
            } else if (code == key.left) {
                this.joypad.release.left();
            } else if (code == key.right) {
                this.joypad.release.right();
            } else if (code == key.a) {
                this.joypad.release.a();
            } else if (code == key.b) {
                this.joypad.release.b();
            } else if (code == key.start) {
                this.joypad.release.start();
            } else if (code == key.select) {
                this.joypad.release.select();
            }

        }.bind(this);

        document.onkeydown = function (e) {
            let code = e.keyCode;
            let key = Keyboard.mapping;

            if (code == key.up) {
                this.joypad.press.up();
            } else if (code == key.down) {
                this.joypad.press.down();
            } else if (code == key.left) {
                this.joypad.press.left();
            } else if (code == key.right) {
                this.joypad.press.right();
            } else if (code == key.a) {
                this.joypad.press.a();
            } else if (code == key.b) {
                this.joypad.press.b();
            } else if (code == key.start) {
                this.joypad.press.start();
            } else if (code == key.select) {
                this.joypad.press.select();
            }

        }.bind(this);

        console.info("Keyboard is binded to joypad!");
    }

}