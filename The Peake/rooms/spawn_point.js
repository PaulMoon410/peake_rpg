// spawn_point.js - Starting room with 3 doors for Peake RPG

window.spawnPoint = {
  "spawn": {
    name: "Mysterious Chamber",
    description: "You awaken in a dimly lit chamber. Three imposing doors stand before you: one to the north, one to the east, and one to the west. Each door seems to hum with potential.",
    exits: { n: "door_north", e: "door_east", w: "door_west" },
    npcs: []
  },
  "door_north": {
    name: "North Door",
    description: "A heavy wooden door with iron bands. It is closed for now.",
    exits: { s: "spawn" },
    npcs: []
  },
  "door_east": {
    name: "East Door",
    description: "A polished stone door with a faint blue glow. It is closed for now.",
    exits: { w: "spawn" },
    npcs: []
  },
  "door_west": {
    name: "West Door",
    description: "A battered metal door with strange runes. It is closed for now.",
    exits: { e: "spawn" },
    npcs: []
  }
};

// Helper to get a spawn room by id
window.getSpawnRoom = function(id) {
  return window.spawnPoint[id] || null;
};
