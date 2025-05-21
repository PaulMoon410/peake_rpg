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
  if (!mapDiv || !window.gameMap) return;
  let html = '<pre style="font-size:1em;line-height:1.2;">';
  const MAP_WIDTH = 10;
  const MAP_HEIGHT = 10;
  let [px, py] = gameState.location.split(",").map(Number);

  // Build a lookup for shop locations and types
  const shopMarkers = {};
  if (window.roomDetails) {
    for (const key in window.roomDetails) {
      const room = window.roomDetails[key];
      if (room.name && room.name.toLowerCase().includes("shop")) {
        // Try to extract coordinates from the key (e.g., shop_5_5)
        const match = key.match(/(\d+)[_,](\d+)/);
        if (match) {
          const sx = parseInt(match[1], 10);
          const sy = parseInt(match[2], 10);
          // Use first letter of shop type or $ if not found
          let marker = '$';
          if (room.name.toLowerCase().includes('supply')) marker = 'S';
          else if (room.name.toLowerCase().includes('bank')) marker = 'B';
          else if (room.name.toLowerCase().includes('general')) marker = 'G';
          else if (room.name.toLowerCase().includes('weapon')) marker = 'W';
          shopMarkers[`${sx},${sy}`] = marker;
        }
      }
    }
  }

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const coord = `${x},${y}`;
      if (x === px && y === py) {
        html += '[<span style="color:#6cf;font-weight:bold;">X</span>]'; // Player position
      } else if (shopMarkers[coord]) {
        html += '[<span style="color:#fc6;font-weight:bold;">' + shopMarkers[coord] + '</span>]';
      } else {
        html += '[ ]';
      }
    }
    html += '\n';
  }
  html += '</pre>';
  // Add a legend
  html += '<div style="font-size:0.95em;margin-top:6px;">Legend: <span style="color:#6cf;font-weight:bold;">X</span>=You, <span style="color:#fc6;font-weight:bold;">S</span>=Supply Shop, <span style="color:#fc6;font-weight:bold;">B</span>=Bank, <span style="color:#fc6;font-weight:bold;">G</span>=General Store, <span style="color:#fc6;font-weight:bold;">W</span>=Weapon Shop, <span style="color:#fc6;font-weight:bold;">$</span>=Other Shop</div>';
  mapDiv.innerHTML = html;
}

function handleCommand() {
  const input = document.getElementById("commandInput");
  const cmd = input.value.trim().toLowerCase();
  input.value = "";
  if (!cmd) return;
  processCommand(cmd);
}

function processCommand(cmd) {
  // Check for spawn room first, then room, then overworld
  let spawnRoom = window.spawnPoint && window.spawnPoint[gameState.location];
  let room = !spawnRoom && window.roomDetails && window.roomDetails[gameState.location];
  let isOverworld = !spawnRoom && !room && window.gameMap && window.gameMap[gameState.location];
  if (!spawnRoom && !room && !isOverworld) {
    setOutput("You are lost. Try 'exit' to return.");
    return;
  }

  // Movement (works for spawn, room, and overworld)
  if (["n","s","e","w","north","south","east","west","out","exit"].includes(cmd)) {
    if (spawnRoom && spawnRoom.exits) {
      let dir = cmd;
      if (dir === "north") dir = "n";
      if (dir === "south") dir = "s";
      if (dir === "east") dir = "e";
      if (dir === "west") dir = "w";
      let exitKey = dir;
      if (dir === "n") exitKey = "n";
      if (dir === "s") exitKey = "s";
      if (dir === "e") exitKey = "e";
      if (dir === "w") exitKey = "w";
      if (spawnRoom.exits[exitKey]) {
        gameState.location = spawnRoom.exits[exitKey];
        renderRoom();
        renderStats();
        renderInventory();
        return;
      } else if (spawnRoom.exits[cmd]) {
        gameState.location = spawnRoom.exits[cmd];
        renderRoom();
        renderStats();
        renderInventory();
        return;
      }
      setOutput("You can't go that way.");
      return;
    } else if (room && room.exits) {
      let dir = cmd;
      if (dir === "north") dir = "n";
      if (dir === "south") dir = "s";
      if (dir === "east") dir = "e";
      if (dir === "west") dir = "w";
      let exitKey = dir;
      if (dir === "n") exitKey = "north";
      if (dir === "s") exitKey = "south";
      if (dir === "e") exitKey = "east";
      if (dir === "w") exitKey = "west";
      if (room.exits[exitKey]) {
        gameState.location = room.exits[exitKey];
        renderRoom();
        renderStats();
        renderInventory();
        return;
      } else if (room.exits[cmd]) {
        gameState.location = room.exits[cmd];
        renderRoom();
        renderStats();
        renderInventory();
        return;
      }
      setOutput("You can't go that way.");
      return;
    } else if (isOverworld) {
      let [x, y] = gameState.location.split(",").map(Number);
      if (cmd === "n" || cmd === "north") y--;
      if (cmd === "s" || cmd === "south") y++;
      if (cmd === "e" || cmd === "east") x++;
      if (cmd === "w" || cmd === "west") x--;
      const newLoc = `${x},${y}`;
      if (window.gameMap[newLoc]) {
        gameState.location = newLoc;
        renderRoom();
        renderStats();
        renderInventory();
        return;
      } else {
        setOutput("You can't go that way.");
        return;
      }
    }
  }

  // Room-specific commands
  if (room) {
    // Take object
    if (cmd.startsWith("take ")) {
      const item = cmd.slice(5).trim();
      if (room.objects && room.objects.includes(item)) {
        gameState.inventory.push(item);
        room.objects = room.objects.filter(o => o !== item);
        setOutput(`You take the ${item}.`);
        renderInventory();
        renderRoom();
        return;
      } else {
        setOutput("That item isn't here.");
        return;
      }
    }
    // Drop object
    if (cmd.startsWith("drop ")) {
      const item = cmd.slice(5).trim();
      const idx = gameState.inventory.indexOf(item);
      if (idx !== -1) {
        gameState.inventory.splice(idx, 1);
        if (!room.objects) room.objects = [];
        room.objects.push(item);
        setOutput(`You drop the ${item}.`);
        renderInventory();
        renderRoom();
        return;
      } else {
        setOutput("You don't have that item.");
        return;
      }
    }
    // Examine item
    if (cmd.startsWith("examine ")) {
      const item = cmd.slice(8).trim();
      if ((room.objects && room.objects.includes(item)) || gameState.inventory.includes(item)) {
        setOutput(`You examine the ${item}. It's seen better days.`); // Placeholder
        return;
      } else {
        setOutput("You don't see that item here or in your inventory.");
        return;
      }
    }
    // Talk to NPC
    if (cmd.startsWith("talk to ")) {
      const npc = cmd.slice(8).trim();
      if (room.npcs && room.npcs.includes(npc)) {
        setOutput(`${npc} says: 'Hello, survivor.'`); // Placeholder
        return;
      } else {
        setOutput("That person isn't here.");
        return;
      }
    }
    // Shop interaction (if in shop)
    if (room.name && room.name.toLowerCase().includes("shop") && cmd.startsWith("buy ")) {
      const item = cmd.slice(4).trim();
      if (gameState.stats.coins >= 5) {
        gameState.stats.coins -= 5;
        gameState.inventory.push(item);
        setOutput(`You buy the ${item} for 5 coins.`);
        renderStats();
        renderInventory();
        return;
      } else {
        setOutput("You don't have enough coins.");
        return;
      }
    }
  }

  // Look
  if (cmd === "look") {
    renderRoom();
    return;
  }
  // Inventory
  if (cmd === "inventory" || cmd === "inv") {
    setOutput("Inventory: " + (gameState.inventory.length ? gameState.inventory.join(", ") : "(empty)"), true);
    return;
  }
  // Stats
  if (cmd === "stats") {
    setOutput("", true);
    return;
  }
  // Help
  if (cmd === "help") {
    setOutput("Commands: n,s,e,w,look,take <item>,drop <item>,examine <item>,talk to <npc>,buy <item>,inventory,stats,save,load,help,exit", true);
    return;
  }
  // Save
  if (cmd === "save") {
    saveGame();
    return;
  }
  // Load
  if (cmd === "load") {
    loadGame();
    return;
  }
  setOutput("Unknown command. Type 'help' for options.");
}

function showBackstory(callback) {
  const input = document.getElementById("commandInput");
  const execBtn = document.querySelector("button[onclick='handleCommand()']");
  if (input) input.disabled = true;
  if (execBtn) execBtn.disabled = true;
  let i = 0;
  function nextLine() {
    if (i < backstoryLines.length) {
      setOutput(backstoryLines[i]);
      i++;
      setTimeout(nextLine, 1500);
    } else {
      // Add a clear separator and blank lines for readability
      setOutput("\n------------------------------\n");
      setOutput("");
      setOutput("");
      if (input) input.disabled = false;
      if (execBtn) execBtn.disabled = false;
      if (callback) callback();
    }
  }
  nextLine();
}

document.addEventListener("DOMContentLoaded", () => {
  // Force the starting location to 'spawn' every time the game loads
  gameState.location = "spawn";
  showBackstory(() => {
    renderRoom();
    renderStats();
    renderInventory();
  });
});
