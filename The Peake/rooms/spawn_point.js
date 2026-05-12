// spawn_point.js - Starting room with 3 doors for Peake RPG

window.spawnPoint = {
  "spawn": {
    name: "Mysterious Chamber",
    description: "You awaken in a dimly lit chamber. Three imposing doors stand before you: one to the north, one to the east, and one to the west. A heavy hatch leads outside.\n\nType 'help' to see commands, or try 'n', 'e', 'w', or 'out' to leave the chamber.",
    exits: { n: "door_north", e: "door_east", w: "door_west", out: "mainMap:5,5" },
    npcs: []
  },
  "door_north": {
    name: "North Door",
    description: "A heavy wooden door with iron bands. It is closed for now.\n\nYou can step back with 's' or leave through the hatch with 'out'.",
    exits: { s: "spawn", out: "mainMap:5,5" },
    npcs: []
  },
  "door_east": {
    name: "East Door",
    description: "A polished stone door with a faint blue glow. It is closed for now.\n\nYou can step back with 'w' or leave through the hatch with 'out'.",
    exits: { w: "spawn", out: "mainMap:5,5" },
    npcs: []
  },
  "door_west": {
    name: "West Door",
    description: "A battered metal door with strange runes. It is closed for now.\n\nYou can step back with 'e' or leave through the hatch with 'out'.",
    exits: { e: "spawn", out: "mainMap:5,5" },
    npcs: []
  }
};

// Helper to get a spawn room by id
window.getSpawnRoom = function(id) {
  return window.spawnPoint[id] || null;
};
