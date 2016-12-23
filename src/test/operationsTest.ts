/**
 * Created by aji on 12/22/2016.
 */
import {GameBoy} from '../main/gameboy';
import {System} from '';


import assert = require('assert');
describe('Operations', function() {
    describe('#carryFlags()', function() {
        it('should set carry flags', function() {
            var gameboy = null;
            var debug = null;

            var loadGameBoy = function() {
                System.import('gameboy').then(function(e) {
                    try {
                        gameboy = new e.GameBoy();
                    } catch (e) {
                        console.error("Unable to load GameBoy");
                        console.error(e);
                        return;
                    }

                    gameboy.load("./roms/Tetris.gb");
                    gameboy.reset();
                    loadDebugger();
                    console.info("Gameboy is ready!");
                }).catch(
                    function(err){
                        console.error("Unable to load GameBoy");
                        console.error(err);
                    }
                );
            }

            loadGameBoy();


            operations.get(0x87);
            assert.equal(, [1,2,3].indexOf(4));
        });
    });
});