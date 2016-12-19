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


    private setBufferPixel(x : number, y : number, index : number) : void {
        this.FRAME[(y * this.WIDTH) + x] = index;
    }

}