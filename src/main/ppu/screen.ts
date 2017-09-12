
export class Screen {

    private canvas : any;
    private context : any;

    public static PIXELS : number = 8;
    public static TILES : number = 32;
    public HEIGHT : number = 142;
    public WIDTH : number = 160;

    private ZOOM : number = 3;
    public static MIN_ZOOM : number = 2;
    private SPACING : number = 0;

    private COLORS : number[] = [
        0x103810,
        0x316231,
        0x8cac10,
        0x798836
    ];

    public FRAME : ImageData;

    constructor() {
        this.canvas = document.getElementById("screen");
        this.context = this.canvas.getContext('2d');

        if (this.canvas == null) {
            console.error("Unable to locate canvas: screen");
        }
        console.info("Screen is ready!");
        this.reset();
    }

    public reset() : void {
        this.canvas.width  = this.WIDTH * (this.ZOOM + this.SPACING);
        this.canvas.height = this.HEIGHT * (this.ZOOM + this.SPACING);

        this.FRAME = this.context.createImageData(
            this.WIDTH * (this.ZOOM + this.SPACING),
            this.HEIGHT * (this.ZOOM + this.SPACING)
        );

        //Print static
        for (let y = 0; y < this.HEIGHT; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                let random : number = Math.floor(Math.random() * this.COLORS.length);
                this.setBufferPixel(x, y, random);
            }
        }

        this.printBuffer();
    }

    public setZoom(zoom : number) {
        this.ZOOM = zoom <= Screen.MIN_ZOOM ? Screen.MIN_ZOOM : zoom;

        this.reset();
    }

    public getZoom() : number {
        return this.ZOOM;
    }

    public setSpacing(spacing : number) {
        this.SPACING = spacing;
        this.reset();
    }

    /**
     * Prints the entire screen
     */
    public printBuffer() : void {
        this.context.putImageData(this.FRAME, 0 ,0);
    }

    /**
     * Print an entire row across the screen from the buffer
     * @param tile
     * @param x
     * @param y
     */
    public printBufferRow(y : number){
        for(let x = 0; x<this.WIDTH; x++){
            let index = this.FRAME[(y * this.WIDTH) + x];
            let hex = this.COLORS[index];
            this.context.fillStyle = hex;
            this.context.fillRect(
                x * (this.ZOOM  + this.SPACING),
                y * (this.ZOOM + this.SPACING),
                (this.ZOOM),
                (this.ZOOM)
            );
        }
    }

    /**
     * Sets one pixel in the screen buffer
     * @param x coordinate
     * @param y coordinate
     * @param index the color scheme
     */
    public setBufferPixel(x : number, y : number, index : number) : void {
        let color = this.COLORS[index];
        let py, px, coordinates;
        y--;
        let zoomVal = (this.ZOOM  + this.SPACING);
        x = x * zoomVal;
        y = y * Math.pow(zoomVal, 2) * this.WIDTH;
        for (let zoomy = 0; zoomy < zoomVal; zoomy++){
            py = y + (zoomy * this.WIDTH * zoomVal);
                for (let zoomx = 0 ; zoomx < zoomVal; zoomx++){
                    px = (x + zoomx);
                coordinates = (py + px) * 4;

                //RGB + transparency
                this.FRAME.data[coordinates + 0] = color >> 16 & 0xFF;
                this.FRAME.data[coordinates + 1] = color >> 8 & 0xFF;
                this.FRAME.data[coordinates + 2] = color & 0xFF;
                this.FRAME.data[coordinates + 3] = 0xFF;
            }
        }
    }
}