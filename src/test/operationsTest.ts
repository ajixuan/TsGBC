/**
 * Created by aji on 12/22/2016.
 */
import {GameBoy} from '../main/gameboy';
import assert = require('assert');


var gameboy = null;
var operations = null;

try {
    gameboy = new GameBoy();
} catch (e) {
    console.error("Unable to load GameBoy");
    console.error(e);
    return;
}

operations = gameboy.cpu.operations;


describe('Operations', function() {
    describe('#carryFlags()', function() {
        it('should set carry flags', function() {
            operations.get(0x87);
            assert.equal(, [1,2,3].indexOf(4));
        });
    });
});