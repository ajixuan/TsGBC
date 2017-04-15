import {Macros} from "./macros";


export class Screen {

    private canvas : any;
    private context : any;

    public HEIGHT : number = 144;
    public WIDTH : number = 160;

    private ZOOM : number = 3;
    private SPACING : number = 0;

    private COLORS : string[] = [
        "#000000",
        "#515151",
        "#9e9e9e",
        "#dee0e2"
    ];

    public FRAME : number[];

    constructor() {
        this.canvas = document.getElementById("screen");

        if (this.canvas == null) {
            console.error("Unable to locate canvas: screen");
        }
        console.info("Screen is ready!");

        this.FRAME = [this.HEIGHT * this.WIDTH];
        this.reset();
    }

    public reset() : void {
        this.canvas.width  = this.WIDTH * (this.ZOOM + this.SPACING);
        this.canvas.height = this.HEIGHT * (this.ZOOM + this.SPACING);
        this.context = this.canvas.getContext('2d');

        for (var y = 0; y < this.HEIGHT; y++) {
            for (var x = 0; x < this.WIDTH; x++) {
                var random : number = Math.floor(Math.random() * this.COLORS.length);
                this.setBufferPixel(x, y, random);
            }
        }
        this.printBuffer();
    }

    public setZoom(zoom : number) {
        this.ZOOM = zoom <= 0 ? 1 : zoom;
        this.reset();
    }

    public getZoom() : number {
        return this.ZOOM;
    }

    public setSpacing(spacing : number) {
        this.SPACING = spacing;
        this.reset();
    }

    public printBuffer() : void {
        for (var y = 0; y < this.HEIGHT; y++) {
            for (var x = 0; x < this.WIDTH; x++) {
                var index = this.FRAME[(y * this.WIDTH) + x];
                var hex = this.COLORS[index];

                this.context.fillStyle = hex;
                this.context.fillRect(
                    x * (this.ZOOM + this.SPACING),
                    y * (this.ZOOM + this.SPACING),
                    (this.ZOOM),
                    (this.ZOOM)
                );
            }
        }
    }

    public printRow(tile : Array<Array<number>>, x : number, y : number){

        for(var cell = 0; cell<tile.length; cell++){
            x += cell;
            var row = Math.floor(y % Macros.PIXELS);
            var index = tile[row][x];
            var hex = this.COLORS[index]

            this.setBufferPixel(x, y, index);
            this.context.fillStyle = hex;
            this.context.fillRect(
                x * (this.ZOOM + this.SPACING),
                y * (this.ZOOM + this.SPACING),
                (this.ZOOM),
                (this.ZOOM)
            );
        }

    }


    /**
     * Sets up a buffer of pixels to be printed according to the color
     * @param x coordinate
     * @param y coordinate
     * @param index the color scheme
     */
    private setBufferPixel(x : number, y : number, index : number) : void {
        this.FRAME[(y * this.WIDTH) + x] = index;
    }

}