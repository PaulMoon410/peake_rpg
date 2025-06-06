// game.js - Main game logic for Peake RPG

// Game state
let gameState = {
  location: "spawn", // Start at the spawn room with 3 doors
  inventory: [],
  stats: {
    health: 100,
    coins: 10,
    strength: 5,
    agility: 5
  },
  log: []
};

// Backstory text for scrolling intro
const backstoryLines = [
  "You are Elias, a solitary man who has lived most of your life in the deep woods beyond the edge of civilization.",
  "For years, you have survived by your wits, guided by the rhythms of the wild and the silence of the trees.",
  "But lately, the forest has grown restless. Shadows move where none should, and the animals flee from something unseen.",
  "Each night, you dream of a creeping darkness—an ancient force stirring beneath the land, threatening to swallow all.",
  "No one in the nearby village believes your warnings. To them, you are just a hermit, a ghost from the timberline.",
  "Yet you know: something is coming. You alone can sense it, and you alone may stand in its way.",
  "So, with little more than your resolve and a few belongings, you step from the woods and approach the village gates.",
  "The world is uneasy, and your journey begins at the border between wild and town.",
  "",
  "(Type 'help' for a list of commands.)"
];

// Map town coordinates to pixel positions on the Cruar's Cove map image
const townCoordToPixel = {
  // Example mappings (tweak as needed for accuracy)
  // Format: 'x,y': [left, top] (in percent of image width/height)
  '0,0': [36, 60],      // Village Plaza (center)
  '0,-1': [36, 50],     // North Road
  '0,-2': [36, 42],     // Blacksmith's Forge
  '1,0': [48, 60],      // General Store (right of plaza)
  '-1,0': [25, 60],     // Village Tavern (left of plaza)
  '0,1': [36, 70],      // South Lane
  '1,1': [48, 70],      // Apothecary
  '-2,0': [15, 60],     // Mayor's House
  '-1,1': [25, 70],     // Old Woman's Cottage
  '1,-1': [48, 50],     // Guard Post
  // Add more as needed
};

function renderRoom() {
  // Check for spawn room first, then room, then overworld
  let desc = "";
  if (window.spawnPoint && window.spawnPoint[gameState.location]) {
    const room = window.spawnPoint[gameState.location];
    desc = `== ${room.name} ==\n${room.description}\n`;
    if (room.npcs && room.npcs.length) desc += `People here: ${room.npcs.map(n=>n.name||n).join(", ")}\n`;
    if (room.exits) desc += `Exits: ` + Object.keys(room.exits).map(dir => {
      if (dir === 'n') return 'north (n)';
      if (dir === 's') return 'south (s)';
      if (dir === 'e') return 'east (e)';
      if (dir === 'w') return 'west (w)';
      return dir;
    }).join(", ") + "\n";
  } else if (window.roomDetails && window.roomDetails[gameState.location]) {
    const room = window.roomDetails[gameState.location];
    desc = `== ${room.name} ==\n${room.description}\n`;
    if (room.objects && room.objects.length) desc += `You see: ${room.objects.join(", ")}\n`;
    if (room.npcs && room.npcs.length) desc += `People here: ${room.npcs.join(", ")}\n`;
    if (room.exits) desc += `Exits: ${Object.keys(room.exits).join(", ")}\n`;
  } else if (window.gameMap && window.gameMap[gameState.location]) {
    desc = `== Wilderness ==\n${window.gameMap[gameState.location]}\n(You are at ${gameState.location})`;
    // Show available directions for overworld
    let [x, y] = gameState.location.split(",").map(Number);
    const directions = [];
    if (window.gameMap[`${x},${y-1}`]) directions.push("north (n)");
    if (window.gameMap[`${x},${y+1}`]) directions.push("south (s)");
    if (window.gameMap[`${x+1},${y}`]) directions.push("east (e)");
    if (window.gameMap[`${x-1},${y}`]) directions.push("west (w)");
    if (directions.length) desc += `\nExits: ${directions.join(", ")}`;
  } else {
    desc = "You are lost in the void.";
  }
  setOutput(desc, true);
  renderMap();
  updateTownMapMarker();
}

function setOutput(text, showStatsInline = false) {
  const consoleDiv = document.getElementById("console");
  if (consoleDiv) {
    let statsLine = "";
    if (showStatsInline) {
      // Color health: green >70, yellow 31-70, red <=30
      const h = gameState.stats.health;
      let healthColor = h > 70 ? '#6f6' : h > 30 ? '#ff6' : '#f66';
      statsLine = `<br><span style='color:${healthColor}'>health: ${h}</span> | ` +
        `<span style='color:#6cf'>coins: ${gameState.stats.coins}</span> | ` +
        `<span style='color:#fc6'>strength: ${gameState.stats.strength}</span> | ` +
        `<span style='color:#ccf'>agility: ${gameState.stats.agility}</span>`;
      statsLine = `<div style='margin:6px 0 10px 0; padding:4px 0; border-bottom:1px solid #444;'>${statsLine}</div>`;
    }
    // Add a divider before each new command output for clarity
    if (text && text.trim() !== "") {
      consoleDiv.innerHTML += `<div style='margin:10px 0 4px 0; border-top:1px solid #333;'></div>`;
    }
    consoleDiv.innerHTML += text.replace(/\n/g, '<br>') + (statsLine || "") + "\n";
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
  }
  gameState.log.push(text);
}

function renderStats() {
  const statsDiv = document.getElementById("stats");
  statsDiv.innerHTML = Object.entries(gameState.stats).map(([k,v]) => `<b>${k}:</b> ${v}`).join(" | ");
}

function renderInventory() {
  const invUl = document.getElementById("inventory");
  invUl.innerHTML = gameState.inventory.length ? gameState.inventory.map(item => `<li>${item}</li>`).join("") : "<li>(empty)</li>";
}

function renderMap() {
  const mapDiv = document.getElementById("gameMapDisplay");
  const townImg = document.getElementById("townMapImg");
  const marker = document.getElementById("playerMarker");
  if (!mapDiv) return;

  // If in town (Cruar's Cove), show the image map and marker
  if (window.townStart && window.townStart[gameState.location]) {
    if (townImg) townImg.style.display = 'block';
    if (marker) marker.style.display = 'block';
    // Use the global townCoordToPixel mapping
    if (typeof window.townCoordToPixel === 'undefined') {
      window.townCoordToPixel = {
        '5,5': [50, 60],      // Town Center
        '5,4': [50, 50],      // Blacksmith Forge
        '5,6': [50, 70],      // Tavern
        '4,5': [40, 60],      // General Store
        '6,5': [60, 60],      // Guild Hall
        // Add more as needed
      };
    }
    const coords = window.townCoordToPixel[gameState.location];
    if (coords && townImg && marker) {
      const w = townImg.offsetWidth;
      const h = townImg.offsetHeight;
      marker.style.left = (coords[0] / 100 * w) + 'px';
      marker.style.top = (coords[1] / 100 * h) + 'px';
      marker.style.display = 'block';
    } else if (marker) {
      marker.style.display = 'none';
    }
    // Hide ASCII map if present
    if (mapDiv.querySelector('pre')) mapDiv.querySelector('pre').style.display = 'none';
  } else {
    // Outside town: hide image and marker, show ASCII map
    if (townImg) townImg.style.display = 'none';
    if (marker) marker.style.display = 'none';
    // Render ASCII map as before
    let html = '<pre style="font-size:1em;line-height:1.2;">';
    const MAP_WIDTH = 10;
    const MAP_HEIGHT = 10;
    let [px, py] = gameState.location.split(",").map(Number);
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (x === px && y === py) {
          html += '[X]';
        } else {
          html += '[ ]';
        }
      }
      html += '\n';
    }
    html += '</pre>';
    mapDiv.innerHTML = html;
  }
}
