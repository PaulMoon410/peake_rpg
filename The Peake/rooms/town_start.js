// town_start.js

window.townStart = {
  "5,5": {
    name: "Easton’s Rest - Town Center",
    description: "Bustling with activity, this central square is surrounded by shops, homes, and the clatter of travelers and townsfolk.",
    npcs: ["Town Crier", "Merchant", "Child"],
    exits: {
      north: "5,4",
      south: "5,6",
      east: "6,5",
      west: "4,5"
    }
  },

  "5,4": {
    name: "Blacksmith Forge",
    description: "The clang of metal and hiss of steam ring out as the blacksmith hammers on a glowing blade.",
    npcs: ["Blacksmith"],
    exits: {
      south: "5,5"
    }
  },

  "5,6": {
    name: "Dusty Tankard Tavern",
    description: "The smell of ale and stew wafts out. Inside, laughter and arguments compete over a bard’s song.",
    npcs: ["Bartender", "Drunken Sailor"],
    exits: {
      north: "5,5"
    }
  },

  "4,5": {
    name: "General Store",
    description: "A modest wooden shop filled with supplies from rations to rope. The keeper eyes you from behind the counter.",
    npcs: ["Shopkeeper"],
    objects: ["Health Potion", "Rope", "Lantern"],
    exits: {
      east: "5,5"
    }
  },

  "6,5": {
    name: "Guild Hall",
    description: "Tall stone columns and worn banners greet aspiring adventurers. A guild recruiter waits near a bulletin board.",
    npcs: ["Guild Recruiter"],
    exits: {
      west: "5,5"
    }
  }
};

// Merge with roomDetails if loaded
window.roomDetails = Object.assign({}, window.roomDetails || {}, window.townStart);
