const viridisColormap = require('../src/viridis-colormap');

describe("Verify float to color changing works", () => {

  test("Check the number of colors is 100", () => {
    expect(viridisColormap.viridis).toHaveLength(100);
  });

  test("Check that a couple colors are correct", () => {
    expect(viridisColormap.viridis[0]).toEqual([0.267004, 0.004874, 0.329415]);
    let lastColor = viridisColormap.viridis.length - 1;
    expect(viridisColormap.viridis[lastColor]).toEqual([0.993248, 0.906157, 0.143936]);
  });
});