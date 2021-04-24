const viridis = require('../src/viridis-theme');

describe("Verify float to color changing works", () => {

  test("Check the number of colors is 100", () => {
    expect(viridis.viridisTheme).toHaveLength(100);
  });

  test("Check that a couple colors are correct", () => {
    expect(viridis.viridisTheme[0]).toEqual([0.267004, 0.004874, 0.329415]);
    let lastColor = viridis.viridisTheme.length - 1;
    expect(viridis.viridisTheme[lastColor]).toEqual([0.993248, 0.906157, 0.143936]);
  });
});