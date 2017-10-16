import {Registers} from "./registers";
import {Operations, Operation} from "./operations";
import {Memory} from "../memory/memory";
import {Stack} from "../memory/stack";
import {Debugger} from "../debugger";
import {Interrupts, Interrupt} from "../io/interrupts";

export class Cpu {

    public registers: Registers;
    public memory: Memory;
    public operations: Operations;
    public stack: Stack;
    public interrupts: Interrupts;
    public halt: boolean;
    public static CLOCK = { main: 0, cycles: 0, div: 0, tima: 0, tma: 0, tac: 0 };
    public last: { operation: Operation, opcode: number, opaddr: number };

    constructor(memory: Memory) {
        this.registers = new Registers();
        this.memory = memory;
        this.interrupts = memory.interrupts;
        this.stack = new Stack(memory, this.registers);
        this.operations = new Operations(this);
    }

    /**
     * Reset the CPU.
     */
    public reset(): void {

        this.registers.setAF(0x1180);
        // this.registers.setAF(0x01B0);
        this.registers.setBC(0x0013);
        this.registers.setDE(0x00D8);
        this.registers.setHL(0x014D);

        this.registers.setSP(0xFFFE);
        this.registers.setPC(0x100);

        this.memory.nr[0xFF10 - 0xFF10] = 0x80; //NR10
        this.memory.nr[0xFF11 - 0xFF10] = 0xBF; //NR11
        this.memory.nr[0xFF12 - 0xFF10] = 0xF3; //NR12
        this.memory.nr[0xFF14 - 0xFF10] = 0xBF; //NR14
        this.memory.nr[0xFF16 - 0xFF10] = 0x3F; //NR21
        this.memory.nr[0xFF17 - 0xFF10] = 0x00; //NR22
        this.memory.nr[0xFF19 - 0xFF10] = 0xBF; //NR24
        this.memory.nr[0xFF1A - 0xFF10] = 0x7F; //NR30
        this.memory.nr[0xFF1B - 0xFF10] = 0xFF; //NR31
        this.memory.nr[0xFF1C - 0xFF10] = 0x9F; //NR32
        this.memory.nr[0xFF1E - 0xFF10] = 0xBF; //NR33
        this.memory.nr[0xFF20 - 0xFF10] = 0xFF; //NR41
        this.memory.nr[0xFF23 - 0xFF10] = 0xBF; //NR30
        this.memory.nr[0xFF24 - 0xFF10] = 0x77; //NR50
        this.memory.nr[0xFF25 - 0xFF10] = 0xF3; //NR51
        this.memory.nr[0xFF26 - 0xFF10] = 0xF1; //NR52

        this.last = {
            operation: this.operations.get(0x00),
            opcode: 0x00,
            opaddr: 0x0000
        };
    }

    /**
     * Handler for the CPU interrupts.
     */
    private handledInterrupts(interrupt: Interrupt): void {

        if (interrupt == null) {
            this.interrupts.enableAllInterrupts();
            return;
        }

        this.halt = false;
        this.interrupts.disableAllInterrupts();
        this.interrupts.clearInterruptFlag(interrupt);

        //Clear stat interrupts flags
        this.memory.ppu.registers.stat.clear();

        //Push all registers on to the stack
        /* Just push pc onto stack
         this.stack.pushWord(this.registers.getHL());
         this.stack.pushWord(this.registers.getAF());
         this.stack.pushWord(this.registers.getBC());
         this.stack.pushWord(this.registers.getDE());

         this.stack.pushWord(this.registers.getSP());
         */
        this.stack.pushWord(this.registers.getPC());
        this.registers.setPC(interrupt.address);
    }

    /**
     * Performs a single CPU cycle.
     */
    public tick(): number {
        let clock = Cpu.CLOCK;

        let hardwareInterrupt, oldPC, operation, args,
            pc = this.registers.getPC(), opcode = this.memory.readByte(pc++);

        if (this.halt) {
            opcode = 0x00
        } else if(opcode == 0xCB){
            opcode = (opcode << 8) | this.memory.readByte(pc++);
        }

        operation = this.operations.get(opcode);

        if (operation == null) {
            this.last = null;
            Debugger.display();
            throw "Unknown opcode execution 0x" + opcode.toString(16).toUpperCase();
        }

        args = operation.mode.getValue(pc, operation.size - 1);
        oldPC = this.registers.getPC();

        if (this.interrupts.ime) { hardwareInterrupt = true }

        operation.execute(args);

        //If pc did not change during op execution, increment pc
        if (oldPC == this.registers.getPC() && opcode != 0x18) {
            this.registers.setPC(this.registers.getPC() + operation.size & 0xFFFF);
        }

        //Debug Information
        this.last = {
            operation: operation,
            opcode: opcode,
            opaddr: args
        };

        //Update Infromation
        clock.cycles = operation.cycle;
        this.increaseTimer();

        //Service interrupt only if IME is set prior to execution
        if (this.interrupts.hasInterrupts() && hardwareInterrupt) {
            this.handledInterrupts(this.interrupts.getInterrupt());
            clock.cycles = 12;
        }

        if (Debugger.status.cpu && Debugger.status.switch) {
            Debugger.display();
        }

        return clock.cycles;
    }


    private increaseTimer():void{
        let clock = Cpu.CLOCK;

        if((clock.cycles/4) >= 4){
            clock.main++;
            clock.cycles -= 4
            if(clock.main % 16 == 0){
                clock.div = (clock.div + 1) % 0xFF;
            }
        }

        if(clock.tac & 4){
            let threshold;
            switch(clock.tac & 3) {
                case 0: threshold = 64; break; // 4K
                case 1: threshold =  1; break; // 256K
                case 2: threshold =  4; break; // 64K
                case 3: threshold = 16; break; // 16K
                default: throw "control register for timer set to invalid val: " + clock.tac.toString();
            }

            if(clock.main >= threshold){
                clock.main = 0;
                clock.tima++;

                if(clock.tima > 0xFF){
                    clock.tima = clock.tma;
                    this.interrupts.setInterruptFlag(Interrupts.TIMER);
                }
            }
        }
    }
}