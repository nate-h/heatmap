// Here's my Heatmap implementation.
// I use two canvases so I can split up the background from the user selection.

class Heatmap
{
    constructor() {

        this.data = null;
        this.isDrawingRect = false;
        this._zoom = 1;
        this.selectedRegion = null;

        // Our axis label values.
        this.xMin = 0;
        this.xMax = 0;
        this.yMin = 0;
        this.yMax = 0;

        // Setup canvases.
        this.imageCanvas = document.getElementById('image-canvas');
        this.imageContext = this.imageCanvas.getContext('2d');
        this.drawingCanvas = document.getElementById('drawing-canvas');
        this.drawingContext = this.drawingCanvas.getContext('2d');

        // Load initial heatmap data.
        this.setupDataSource(document.getElementById('data-source').value);

        // Setup mouse drag events.
        this.setupMouseEvents();
    }

    /**
     * Add the event listeners for mousedown, mousemove, and mouseup
     */
    setupMouseEvents() {

        // Setup drag events.
        this.drawingCanvas.addEventListener('mousedown', e => {
            this.isDrawingRect = true;
            let [x, y] = this.canvasPosToHeatmapPos(e.offsetX, e.offsetY);
            this.selectedRegion = {
                x1: x,
                y1: y,
                x2: x,
                y2: y
            };

        });
        this.drawingCanvas.addEventListener('mousemove', e => {
            if (this.isDrawingRect === true) {
                let [x, y] = this.canvasPosToHeatmapPos(e.offsetX, e.offsetY);
                this.selectedRegion.x2 = x;
                this.selectedRegion.y2 = y;
                this.drawSelection();
            }
        });
        window.addEventListener('mouseup', e => {
            this.isDrawingRect = false;
        });

        // Define button behaviors.
        document.getElementById("export-button").addEventListener('click', e => {
            this.exportData();
        });
        document.getElementById("clear-button").addEventListener('click', e => {
            this.selectedRegion = null;
            this.drawSelection();
        });

        // Data source change.
        document.getElementById("data-source").addEventListener('change', e => {
            this.setupDataSource(e.target.value);
        });

        // Zoom/Navigating controls.
        document.getElementById("zoom-in").addEventListener('click', e => {
            this.zoom += 0.5;
        });
        document.getElementById("zoom-out").addEventListener('click', e => {
            this.zoom -= 0.5;
        });
        document.getElementById("move-left").addEventListener('click', e => {
            this.move('left');
        });
        document.getElementById("move-up").addEventListener('click', e => {
            this.move('up');
        });
        document.getElementById("move-down").addEventListener('click', e => {
            this.move('down');
        });
        document.getElementById("move-right").addEventListener('click', e => {
            this.move('right');
        });

        // Set default export type.
        let exportRadioButtons = document.getElementsByName('export-type');
        for (const radioButton of exportRadioButtons) {
            if (radioButton.value === 'png') {
                radioButton.checked = true;
            }
        }
    }

    get zoom() {
        return this._zoom;
    }

    set zoom(newZoom) {

        this._zoom = Math.max(Math.min(newZoom, 10), 1);

        // Calculate new dimensions and update bounds.
        let newHeatmapWidth = Math.round(this.data[0].length / this._zoom);
        let newHeatmapHeight = Math.round(this.data.length / this._zoom);

        this.xMax = this.xMin + newHeatmapWidth - 1;
        this.yMax = this.yMin + newHeatmapHeight - 1;

        // Ensure x doesn't overflow.
        let overflowX = this.xMax - this.data[0].length + 1;
        if (overflowX > 0) {
            this.xMin = this.xMin - overflowX;
            this.xMax = this.xMax - overflowX;
        }

        // Ensure y doesn't overflow.
        let overflowY = this.yMax - this.data.length + 1;
        if (overflowY > 0) {
            this.yMin = this.yMin - overflowY;
            this.yMax = this.yMax - overflowY;
        }

        // Now update dimensions for both canvas.
        this.imageCanvas.width = newHeatmapWidth;
        this.imageCanvas.height = newHeatmapHeight;
        this.drawingCanvas.width = newHeatmapWidth;
        this.drawingCanvas.height = newHeatmapHeight;

        // Update zoom text and redraw everything.
        document.getElementById("zoom-text").innerHTML =
            `Zoom: ${this._zoom.toFixed(1)}x`;
        this.drawAll();
    }

    /**
     * Converts a canvas position to data index position.
     * @param {number} canvasX Pixel offset from left of canvas.
     * @param {number} canvasY Pixel offset from top of canvas.
     * @returns the index into the data.
     */
    canvasPosToHeatmapPos(canvasX, canvasY) {

        let xPercent = canvasX / this.drawingCanvas.clientWidth;
        let yPercent = canvasY / this.drawingCanvas.clientHeight;

        let x = Math.round(this.xMin + (this.xMax - this.xMin) * xPercent);
        let y = Math.round(this.yMin + (this.yMax - this.yMin) * yPercent);

        return [x, y];
    }

    /**
     * Load local json file and redraw canvas.
     * @param {string} source The filename of the local data source.
     */
    setupDataSource(source) {

        fetch(`sample-heatmaps/${source}.json`)
        .then(response => response.json())
        .then(json => {

            this.data = json;

            // Change context dimensions to new dimensions.
            let width = this.data[0].length;
            let height = this.data.length;
            this.imageCanvas.width = width;
            this.imageCanvas.height = height;
            this.drawingCanvas.width = width;
            this.drawingCanvas.height = height;

            // Our axis label values.
            this.xMin = 0;
            this.xMax = width - 1;
            this.yMin = 0;
            this.yMax = height - 1;

            this.selectedRegion = null;

            // Resetting zoom also redraws everything.
            this.zoom = 1;
        });
    }

    /**
     * Draws background and possible user selection.
     */
    drawAll() {
        this.updateAxis();
        this.drawHeatmap();
        this.drawSelection();
    }

    /**
     * Updates the four axis labels.
     */
    updateAxis() {
        document.getElementById("x-min").innerHTML = this.xMin;
        document.getElementById("x-max").innerHTML = this.xMax;
        document.getElementById("y-min").innerHTML = this.yMin;
        document.getElementById("y-max").innerHTML = this.yMax;
    }

    /**
     * Updates the four axis labels.
     */
     updateSelectedRegionDisplay() {
        if (this.selectedRegion) {
            document.getElementById("export-button").disabled = false;
            let start = `${this.selectedRegion.x1}, ${this.selectedRegion.y1}`;
            let stop = `${this.selectedRegion.x2}, ${this.selectedRegion.y2}`;
            document.getElementById("selected-region-start").innerHTML = start;
            document.getElementById("selected-region-stop").innerHTML = stop;
        } else {
            document.getElementById("export-button").disabled = true;
            document.getElementById("selected-region-start").innerHTML = 'na';
            document.getElementById("selected-region-stop").innerHTML = 'na';
        }
    }

    /**
     * Draws heatmap on a dedicated image canvas.
     */
    drawHeatmap() {
        if (this.data) {
            let width =  this.xMax - this.xMin + 1; // this.data[0].length;
            let height = this.yMax - this.yMin + 1;
            let imageData = this.imageContext.createImageData(width, height);
            let index = 0;

            let rows = this.data.slice(this.yMin, this.yMax + 1);

            for (const row of rows) {
                let values = row.slice(this.xMin, this.xMax + 1);
                for (const value of values) {
                    let color = getColor(value);
                    imageData.data[4 * index + 0] = color[0] * 255;
                    imageData.data[4 * index + 1] = color[1] * 255;
                    imageData.data[4 * index + 2] = color[2] * 255;
                    imageData.data[4 * index + 3] = 255;
                    index += 1;
                }
            }
            this.imageContext.putImageData(imageData, 0, 0);
        }
    }

    /**
     * Draws the user's selection.
     */
    drawSelection() {
        this.clearSelection();
        this.updateSelectedRegionDisplay();
        if (this.selectedRegion) {
            // Translate values since upper left may not be 0,0.
            let translatedX1 = this.selectedRegion.x1 - this.xMin;
            let translatedX2 = this.selectedRegion.x2 - this.xMin;
            let translatedY1 = this.selectedRegion.y1 - this.yMin;
            let translatedY2 = this.selectedRegion.y2 - this.yMin;
            this.drawRect(translatedX1, translatedY1, translatedX2, translatedY2);
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

    /**
     * Handle new move direction signals and adjust based on current position.
     * @param {string} direction which direction we're moving.
     */
    move(direction) {

        // The amount moved in both the x and y direction is based off of the
        // length of the x side only intentionally.
        // This way you move the same in both the x and y direction.
        let deltaDir = Math.round((this.xMax - this.xMin) / 10);
        let heatmapWidth = this.data[0].length;
        let heatmapHeight = this.data.length ;


        switch (direction) {
            case 'up':
                let newYMin = Math.max(this.yMin - deltaDir, 0);
                this.yMax = this.yMax + newYMin - this.yMin;
                this.yMin = newYMin;
                break;
            case 'down':
                let newYMax = Math.min(this.yMax + deltaDir, heatmapHeight - 1);
                this.yMin = this.yMin + newYMax - this.yMax;
                this.yMax = newYMax;
                break;
            case 'right':
                let newXMax = Math.min(this.xMax + deltaDir, heatmapWidth - 1);
                this.xMin = this.xMin + newXMax - this.xMax;
                this.xMax = newXMax;
                break;
            case 'left':
                let newXMin = Math.max(this.xMin - deltaDir, 0);
                this.xMax = this.xMax + newXMin - this.xMin;
                this.xMin = newXMin;
                break;
            default:
                console.error("Should have hit a move direction case.");
                break;
        }

        // Now finally redraw everything after updating our position.
        this.drawAll();
    }

    exportData() {

        // Bail if got here without selecting a region.
        if (!this.selectedRegion) {
            return;
        }

        // Get default export type.
        let exportType = '';
        let exportTypes = document.getElementsByName('export-type');
        for (const radioButton of exportTypes) {
            if (radioButton.checked) {
                exportType = radioButton.value;
            }
        }

        // Get some info about the download.
        // Possibly correct the upper-left corner.
        let x1 =  this.selectedRegion.x1;
        let y1 =  this.selectedRegion.y1;
        let x2 =  this.selectedRegion.x2;
        let y2 =  this.selectedRegion.y2;

        let xs = Math.min(x1, x2);
        let ys = Math.min(y1, y2);
        let xe = Math.max(x1, x2);
        let ye = Math.max(y1, y2);
        let source = document.getElementById('data-source').value;
        let fileName = `heatmap_${source}_${xs}_${ys}_${xe}_${ye}`;

        // Export data for specified type.
        if (exportType === 'png') {
            // Extract coordinates of canvas where region is.
            let translatedXs = xs - this.xMin;
            let translatedYs = ys - this.yMin;
            let translatedXe = xe - this.xMin;
            let translatedYe = ye - this.yMin;
            this.saveSnapshot(`${fileName}.png`, translatedXs, translatedYs,
                translatedXe, translatedYe);
        } else {
            const exportedData = this.extractJsonFromRegion(xs, ys, xe, ye);
            this.saveJSON(exportedData, `${fileName}.json`);
        }
    }

    extractJsonFromRegion(xs, ys, xe, ye) {
        let exportedData = [];
        let rows = this.data.slice(ys, ye + 1);
        for (const row of rows) {
            let values = row.slice(xs, xe + 1);
            exportedData.push(values);
        }
        return exportedData;
    }

    saveSnapshot(filename, xs, ys, xe, ye) {

        let w = xe - xs;
        let h = ye - ys;

        // Create new canvas and draw region to it.
        const newCanvas = document.createElement('canvas');
        newCanvas.width = w;
        newCanvas.height = h;
        const newContext = newCanvas.getContext('2d');
        newContext.drawImage(this.imageCanvas, xs, ys, w, h, 0, 0, w, h);

        // Create image and download it.
        const newImage = document.createElement('img');
        newImage.src = newCanvas.toDataURL("image/png");
        const a = document.createElement('a');
        a.href = newImage.src;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    saveJSON(data, filename){

        // Bail if no data.
        if(!data) {
            console.error('No data');
            return;
        }

        // Correct for no name supplied.
        if(!filename) {
            filename = 'noName.json';
        }

        // Stringify json.
        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4);
        }

        // Simulate clicking on button that downloads data.
        let blob = new Blob([data], {type: 'text/json'});
        let e = document.createEvent('MouseEvents');
        let a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':');
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
    }
}