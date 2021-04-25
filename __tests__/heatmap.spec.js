// There's a lot to test for the heatmap.
// These tests just focus on some of the more important functions.

const Heatmap = require('../src/heatmap');

describe("Heatmap fundamentals work", () => {

  test("extractJsonFromRegion works", () => {
    let dummyData = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
    let heatmap = new Heatmap();
    heatmap.data = dummyData;
    let regionJson = heatmap.extractJsonFromRegion(1, 1, 2, 2);
    expect(regionJson).toEqual([[4, 5], [7, 8]]);
  });

  test("swapSoUpperLeftLowerRight works", () => {
    let heatmap = new Heatmap();
    let orderedPoints = heatmap.swapSoUpperLeftLowerRight(1, 2, 3, 4);
    expect(orderedPoints).toEqual([1, 2, 3, 4]);
    let unorderedPoints = heatmap.swapSoUpperLeftLowerRight(8, 7, 6, 5);
    expect(unorderedPoints).toEqual([6, 5, 8, 7]);
  });

  test("canvasPosToHeatmapPos works", () => {
    let heatmap = new Heatmap();
    heatmap.drawingCanvas = {};
    heatmap.drawingCanvas.clientWidth = 500;
    heatmap.drawingCanvas.clientHeight = 500;
    heatmap.xMin = 5;
    heatmap.xMax = 10;
    heatmap.yMin = 50;
    heatmap.yMax = 100;
    let pos = heatmap.canvasPosToHeatmapPos(100, 100);
    expect(pos).toEqual([6, 60]);
  });

});