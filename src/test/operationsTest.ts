/**
 * Created by aji on 12/22/2016.
 */
import {GameBoy} from '../main/gameboy';
import { suite, test, slow, timeout, skip, only} from "mocha-typescript";

try {
    var gameboy = new GameBoy();
} catch (e) {
    console.error("Unable to load GameBoy");
    console.error(e);
}

var cpu = gameboy.cpu;
var memory = gameboy.memory;


describe("ALU 8Bit", function(){
    describe("0xC6 ALU ADD test", function(){
        //Write the test byte to the position in memory
        memory.writeByte(1, 20);
        memory.writeByte(2, 20);

        cpu.registers.setA(1);
        cpu.registers.setB(2);

        var a = memory.readByte(cpu.registers.getA());
        var b = memory.readByte(cpu.registers.getB());
        var result = a + b;
        console.log(a); console.log(b); console.log(result);
        cpu.operations.get(0xC6).execute(0);

        //Check if flags are set
        it("should reset subtractflag", ()=>{
            if(cpu.registers.getSubtractFlag() == 0){
                throw new Error("Subtractflag is not reset");
            }
        });

        //Check if the correct value is set
        memory.readByte(cpu.registers.getA());

    })

})

