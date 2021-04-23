// Here's my Heatmap implementation.
// I use two canvases so I can split up the background from the user selection.

class Heatmap
{
    constructor() {

        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this._zoom = 1;

        // Setup canvases.
        this.imageCanvas = document.getElementById('image-canvas');
        this.imageContext = this.imageCanvas.getContext('2d');
        this.drawingCanvas = document.getElementById('drawing-canvas');
        this.drawingContext = this.drawingCanvas.getContext('2d');

        // Load first initial image.
        this.img = document.getElementById('source');
        this.img.addEventListener('load', e => {
            this.drawAll();

            console.log(this.img.width);
            console.log(this.img.height);
        });

        // Setup mouse drag events.
        this.setupMouseEvents();
    }

    /**
     * Add the event listeners for mousedown, mousemove, and mouseup
     */
    setupMouseEvents() {

        // Setup drag events.
        this.drawingCanvas.addEventListener('mousedown', e => {
            this.startX = this.endX = e.offsetX;
            this.startY = this.endY =  e.offsetY;
            this.isDrawingRect = true;
        });
        this.drawingCanvas.addEventListener('mousemove', e => {
            if (this.isDrawingRect === true) {
                this.endX = e.offsetX;
                this.endY = e.offsetY;
                this.drawSelection();
            }
        });
        window.addEventListener('mouseup', e => {
            this.isDrawingRect = false;
        });

        // Define button behaviors.
        document.getElementById("export-button").addEventListener('click', e => {
            console.log('Export');
        });
        document.getElementById("clear-button").addEventListener('click', e => {
            this.isDrawingRect = false;
            this.drawSelection();
        });

        // Zoom/Navigating controls.
        document.getElementById("zoom-in").addEventListener('click', e => {
            this.zoom += 0.5;
        });
        document.getElementById("zoom-out").addEventListener('click', e => {
            this.zoom -= 0.5;
        });
        document.getElementById("move-left").addEventListener('click', e => {
            console.log('left');
        });
        document.getElementById("move-up").addEventListener('click', e => {
            console.log('up');
        });
        document.getElementById("move-down").addEventListener('click', e => {
            console.log('down');
        });
        document.getElementById("move-right").addEventListener('click', e => {
            console.log('right');
        });
    }

    get width() {
        return this.drawingCanvas.width;
    }

    get height() {
        return this.drawingCanvas.height;
    }

    get zoom() {
        return this._zoom;
    }

    set zoom(newZoom) {
        this._zoom = Math.max(Math.min(newZoom, 10), 1);
        document.getElementById("zoom-text").innerHTML = `Zoom: ${this._zoom.toFixed(1)}x`;
        this.drawAll();

    }

    /**
     * Draws background and possible user selection.
     */
    drawAll() {
        console.log('Draw all');
        this.drawHeatmap();
        this.drawSelection();
    }

    /**
     * Draws heatmap on a dedicated image canvas.
     */
    drawHeatmap() {
        this.imageContext.drawImage(
            this.img, 0, 0, this.img.width, this.img.height,
            0, 0, this.width, this.height
        );
    }

    /**
     * Draws the user's selection.
     */
    drawSelection() {
        this.clearSelection();
        if (this.isDrawingRect) {
            this.drawRect(this.startX, this.startY, this.endX, this.endY);
        }
    }

    /**
     * Clears the drawingContext so old drawings go away.
     */
    clearSelection() {
        this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
    }

    /**
     * Draws a rectangle from the two diagonal points passed in.
     * @param {number} x1 upper left x
     * @param {number} y1 upper left y
     * @param {number} x2 lower left x
     * @param {number} y2 lower left y
     */
    drawRect(x1, y1, x2, y2) {
        this.drawingContext.beginPath();
        this.drawingContext.strokeStyle = 'red';
        this.drawingContext.lineWidth = 1;

        // Possibly correct the upper-left corner.
        let x = Math.min(x1, x2);
        let y = Math.min(y1, y2);
        let width = Math.abs(Math.min(x1-x2));
        let height = Math.abs(Math.min(y1-y2));

        this.drawingContext.rect(x, y, width, height);
        this.drawingContext.stroke();
        this.drawingContext.closePath();
    }
}