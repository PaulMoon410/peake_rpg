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

// town_start.js - Large Village Definition for Peake RPG
// Each key is a coordinate string, value is a room object

window.townMap = {
  "0,0": {
    name: "Village Plaza",
    description: "You stand in the bustling village plaza. Paths lead in all directions. A fountain gurgles at the center. Villagers chat and children play.",
    exits: { n: "0,-1", s: "0,1", e: "1,0", w: "-1,0" },
    npcs: [
      { name: "Mayor Peake", dialogue: "Welcome to our village! Explore, trade, and make yourself at home." }
    ]
  },
  "0,-1": {
    name: "North Road",
    description: "A cobbled road lined with lanterns. To the north is the blacksmith. South returns to the plaza.",
    exits: { s: "0,0", n: "0,-2" },
    npcs: []
  },
  "0,-2": {
    name: "Blacksmith's Forge",
    description: "The clang of metal rings out. Tools and weapons hang on the walls. The blacksmith wipes sweat from his brow.",
    exits: { s: "0,-1" },
    npcs: [
      { name: "Blacksmith Ada", dialogue: "Need a blade or a repair? I can help—for a price." }
    ],
    shop: "blacksmith"
  },
  "1,0": {
    name: "General Store",
    description: "Shelves are packed with goods: food, rope, lanterns, and more. The shopkeeper greets you warmly.",
    exits: { w: "0,0" },
    npcs: [
      { name: "Shopkeeper Lin", dialogue: "Looking for supplies? I've got what you need." }
    ],
    shop: "general"
  },
  "-1,0": {
    name: "Village Tavern",
    description: "Laughter and music spill from the tavern. The smell of stew and ale fills the air.",
    exits: { e: "0,0" },
    npcs: [
      { name: "Barkeep Joss", dialogue: "Pull up a chair! Travelers always have the best stories." },
      { name: "Drunkard", dialogue: "Did you see the ghost by the well? Hic!" }
    ]
  },
  "0,1": {
    name: "South Lane",
    description: "A quiet lane with a few small homes. The apothecary is to the east.",
    exits: { n: "0,0", e: "1,1" },
    npcs: []
  },
  "1,1": {
    name: "Apothecary",
    description: "Jars of herbs and potions line the shelves. The apothecary mixes something in a mortar.",
    exits: { w: "0,1" },
    npcs: [
      { name: "Apothecary Mira", dialogue: "Potions for health, stamina, or... stranger needs?" }
    ],
    shop: "apothecary"
  },
  "-2,0": {
    name: "Mayor's House",
    description: "A stately home with a tidy garden. The mayor sometimes invites guests inside.",
    exits: { e: "-1,0" },
    npcs: [
      { name: "Mayor Peake", dialogue: "My door is always open to those who help the village." }
    ]
  },
  "-1,1": {
    name: "Old Woman's Cottage",
    description: "A cozy cottage with smoke curling from the chimney. The old woman knits by the window.",
    exits: { n: "-1,0" },
    npcs: [
      { name: "Old Woman", dialogue: "Have you met my cat? He likes shiny things." }
    ]
  },
  "1,-1": {
    name: "Guard Post",
    description: "A wooden watchtower stands here. A guard keeps a watchful eye on the road.",
    exits: { s: "1,0" },
    npcs: [
      { name: "Guard", dialogue: "Stay out of trouble and you'll be fine." }
    ]
  }
};

// Helper to get a room in the village by coordinates
window.getVillageRoom = function(x, y) {
  return window.townMap[`${x},${y}`] || null;
};

// Optionally, merge this with your main map logic or use as a separate map when in the village.
