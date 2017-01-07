/**
 * Created by aji on 12/22/2016.
 */
import {GameBoy} from '../main/gameboy';
import { suite, test, slow, timeout, skip, only} from "mocha-typescript";

import assert = ts.Debug.assert;

var gameboy = null;
var cpu = null;
var memory = null;

try {
    gameboy = new GameBoy();
} catch (e) {
    console.error("Unable to load GameBoy");
    console.error(e);
    return;
}

cpu= gameboy.cpu;
memory = gameboy.memory;


@suite("ALU 8Bit")
class OperationsTest {

    @test("0xC6 ALU ADD test")
    testOutput() {
        var a = memory.readByte(cpu.registers.getA());
        var b = memory.readByte(cpu.registers.getB());
        var result = a + b;
        console.log(a); console.log(b);
        cpu.operations.get(0xC6).execute(0);



        //Check if flags are set
        assert(cpu.registers.getSubtractFlag() == 0, "Subtract flag is not reset");
        if()
        assert(cpu.registers.getSubtractFlag() == 0, "Subtract flag is not reset");


        //Check if the correct value is set
        memory.readByte(cpu.registers.getA());

    }

    @test("should pass when promise resolved")
    promise_pass_resolved() {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), 1);
        });
    }
