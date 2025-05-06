window.gameMap = {};

for (let y = 0; y < 10; y++) {
  for (let x = 0; x < 10; x++) {
    const key = `${x},${y}`;
    let desc = "";

    // Add custom flavor for a few areas
    if (x === 5 && y === 5) {
      desc = "You arrive at the central plaza. Cracked stones and broken fountains hint at a once-great city.";
    } else if (y === 0) {
      desc = "To the north lies a jagged cliff. The air smells of salt and wind.";
    } else if (x === 0) {
      desc = "A thick forest lines the western edge of the region.";
    } else if (x === 9 || y === 9) {
      desc = "Here the land fades into shadows, as if the world ends beyond.";
    } else {
      desc = `A quiet patch of land at coordinates (${x}, ${y}).`;
    }

    window.gameMap[key] = desc;
  }
}
