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

const multiplayerState = {
  connected: false,
  players: [],
  chat: [],
  stream: null,
};

const debugState = {
  lines: [],
  maxLines: 120,
};

const npcFallbackDialogue = {
  "town crier": "Hear ye! The old woods have been restless lately.",
  merchant: "Fresh goods, fair prices. That's the promise.",
  child: "I lost a shiny thing near the fountain!",
  blacksmith: "If it squeaks, it needs oil. If it bends, it needs heat.",
  bartender: "I hear everything. Buy a drink if you want the rest.",
  "drunken sailor": "The sea keeps secrets better than people do.",
  shopkeeper: "Take a look around. Necessity is my specialty.",
  "guild recruiter": "Adventure starts with a task and a bit of nerve.",
  "grumpy vendor": "If you need something, buy it. If not, move along.",
  "silent watcher": "..."
};

function updateTownMapMarker() {
  // The current UI uses an ASCII map, so there is no moving marker to update.
}

function getCurrentRoom() {
  return (window.spawnPoint && window.spawnPoint[gameState.location]) ||
    (window.roomDetails && window.roomDetails[gameState.location]) ||
    (window.townMap && window.townMap[gameState.location]) ||
    (window.townStart && window.townStart[gameState.location]) ||
    null;
}

function getNpcDialogue(name, room) {
  const normalizedName = String(name || "").toLowerCase();

  if (room && Array.isArray(room.npcs)) {
    const matchingNpc = room.npcs.find((npc) => {
      if (typeof npc === "string") return npc.toLowerCase() === normalizedName;
      return String(npc?.name || "").toLowerCase() === normalizedName;
    });

    if (matchingNpc && typeof matchingNpc === "object" && matchingNpc.dialogue) {
      return Array.isArray(matchingNpc.dialogue) ? matchingNpc.dialogue[0] : matchingNpc.dialogue;
    }
  }

  return npcFallbackDialogue[normalizedName] || `${name} nods at you...`;
}

function showNpcDialogueWindow(name, dialogue) {
  if (typeof window.showNpcDialogue === "function") {
    window.showNpcDialogue(name, dialogue);
  }
}

function getCurrentRoomName() {
  const room = getCurrentRoom();
  return room?.name || gameState.location;
}

function setLiveWorldStatus(message, isError = false) {
  const status = document.getElementById("liveWorldStatus");
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? "#ff8a8a" : "#9cd9ff";
}

function showWorldAnnouncement(message) {
  if (!message) return;
  setOutput(message, false);
  appendDebugLine(message, "muted");
}

function isOwnWorldAnnouncement(payload) {
  return Boolean(payload?.username && payload.username === getCloudUsername());
}

function setDebugStatus(message, isError = false) {
  const status = document.getElementById("debugStatus");
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? "#ff8a8a" : "#ffd37a";
}

function escapeDebugText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function debugLineClass(level) {
  switch (level) {
    case "ok": return "debug-line debug-ok";
    case "warn": return "debug-line debug-warn";
    case "error": return "debug-line debug-error";
    case "muted": return "debug-line debug-muted";
    default: return "debug-line debug-info";
  }
}

function appendDebugLine(message, level = "info") {
  const terminal = document.getElementById("debugTerminal");
  const timestamp = new Date().toLocaleTimeString();
  const line = { timestamp, level, message: String(message) };
  debugState.lines.push(line);
  if (debugState.lines.length > debugState.maxLines) {
    debugState.lines.splice(0, debugState.lines.length - debugState.maxLines);
  }

  if (!terminal) return;
  terminal.innerHTML = debugState.lines
    .map((entry) => `<span class="${debugLineClass(entry.level)}">[${entry.timestamp}] ${escapeDebugText(entry.message)}</span>`)
    .join("");
  terminal.scrollTop = terminal.scrollHeight;
}

function clearDebugTerminal() {
  debugState.lines = [];
  const terminal = document.getElementById("debugTerminal");
  if (terminal) {
    terminal.innerHTML = "";
  }
  setDebugStatus("Debug terminal cleared.");
}

function renderLivePlayers() {
  const playersEl = document.getElementById("livePlayers");
  if (!playersEl) return;
  if (!multiplayerState.players.length) {
    playersEl.textContent = "No players online.";
    return;
  }

  playersEl.innerHTML = multiplayerState.players
    .map((player) => `${player.username} :: ${player.roomName || player.location}`)
    .join("\n");
}

function renderLiveChat() {
  const chatEl = document.getElementById("liveChatLog");
  if (!chatEl) return;
  if (!multiplayerState.chat.length) {
    chatEl.textContent = "World chat is empty.";
    return;
  }

  chatEl.textContent = multiplayerState.chat
    .slice(-20)
    .map((entry) => entry.system ? `[world] ${entry.message}` : `${entry.username}: ${entry.message}`)
    .join("\n");
  chatEl.scrollTop = chatEl.scrollHeight;
}

function applyWorldSnapshot(world) {
  multiplayerState.players = Array.isArray(world?.players) ? world.players : [];
  multiplayerState.chat = Array.isArray(world?.chat) ? world.chat : [];
  renderLivePlayers();
  renderLiveChat();
  appendDebugLine(`World snapshot received: ${multiplayerState.players.length} players online, ${multiplayerState.chat.length} chat entries.`, "ok");
}

function canUseLiveWorld() {
  const baseUrl = getCloudBaseUrl();
  const looksLikePlaceholder = /your_render_backend|YOUR_RENDER_BACKEND/.test(baseUrl);
  return Boolean(getCloudToken() && baseUrl && !looksLikePlaceholder);
}

async function syncLivePresence() {
  if (!multiplayerState.connected || !getCloudToken()) return;
  try {
    appendDebugLine(`Syncing presence for ${getCloudUsername()} at ${gameState.location}...`, "muted");
    await cloudRequest("/api/world/update", "POST", {
      location: gameState.location,
      roomName: getCurrentRoomName(),
    });
    appendDebugLine(`Presence synced: ${gameState.location} (${getCurrentRoomName()})`, "ok");
  } catch (error) {
    appendDebugLine(`Presence sync failed: ${error.message}`, "error");
    setLiveWorldStatus(error.message, true);
  }
}

async function runBackendHealthCheck() {
  const baseUrl = getCloudBaseUrl();
  try {
    appendDebugLine(`Pinging backend at ${baseUrl}/api/ping...`, "muted");
    const response = await fetch(`${baseUrl}/api/ping`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    appendDebugLine(`Backend reachable: ${data.message || "ok"}`, "ok");
    setDebugStatus(`Backend connected: ${data.message || "ok"}`);
  } catch (error) {
    appendDebugLine(`Backend ping failed: ${error.message}`, "error");
    setDebugStatus(`Backend unreachable: ${error.message}`, true);
  }
}

async function testLiveWorldConnection() {
  try {
    appendDebugLine("Testing live world connection...", "muted");
    const result = await cloudRequest("/api/world/state", "GET");
    appendDebugLine(`Live world OK: ${result.world.players.length} players / ${result.world.chat.length} chat messages`, "ok");
    setLiveWorldStatus(`Backend connected: ${result.username}`);
  } catch (error) {
    appendDebugLine(`Live world test failed: ${error.message}`, "error");
    setLiveWorldStatus(error.message, true);
  }
}

window.connectLiveWorld = async function() {
  if (multiplayerState.connected) {
    setLiveWorldStatus("Already connected to live world.");
    return;
  }
  if (!canUseLiveWorld()) {
    setLiveWorldStatus("Set backend URL and sign in first.", true);
    return;
  }

  try {
    appendDebugLine(`Joining live world as ${getCloudUsername()}...`, "muted");
    const join = await cloudRequest("/api/world/join", "POST", {
      location: gameState.location,
      roomName: getCurrentRoomName(),
    });
    multiplayerState.connected = true;
    applyWorldSnapshot(join.world || {});
    showWorldAnnouncement(join.announcement?.text || `You enter ${getCurrentRoomName()}.`);
    appendDebugLine(`Joined live world: ${gameState.location} (${getCurrentRoomName()})`, "ok");

    const streamUrl = `${getCloudBaseUrl()}/api/world/stream?token=${encodeURIComponent(getCloudToken())}`;
    const stream = new EventSource(streamUrl);
    multiplayerState.stream = stream;

    appendDebugLine(`Opening event stream: ${streamUrl}`, "muted");

    stream.addEventListener("snapshot", (event) => {
      const payload = JSON.parse(event.data);
      applyWorldSnapshot(payload);
    });

    stream.addEventListener("heartbeat", (event) => {
      const payload = JSON.parse(event.data);
      appendDebugLine(`Heartbeat ${payload.now}`, "muted");
    });

    stream.addEventListener("room-message", (event) => {
      const payload = JSON.parse(event.data);
      if (!payload?.text) return;
      if (payload.location && payload.location !== gameState.location) return;
      if (isOwnWorldAnnouncement(payload)) return;
      showWorldAnnouncement(payload.text);
    });

    stream.onerror = () => {
      appendDebugLine("Live stream error or reconnect attempt detected.", "warn");
      setLiveWorldStatus("Live stream interrupted. Rejoin if needed.", true);
    };

    setLiveWorldStatus(`Connected as ${getCloudUsername()} in ${getCurrentRoomName()}.`);
  } catch (error) {
    multiplayerState.connected = false;
    appendDebugLine(`Join world failed: ${error.message}`, "error");
    setLiveWorldStatus(error.message, true);
  }
};

window.disconnectLiveWorld = async function() {
  try {
    if (multiplayerState.stream) {
      appendDebugLine("Closing live world stream.", "muted");
      multiplayerState.stream.close();
      multiplayerState.stream = null;
    }
    if (getCloudToken()) {
      await cloudRequest("/api/world/leave", "POST", {});
    }
  } catch (error) {
    setLiveWorldStatus(error.message, true);
  }
  multiplayerState.connected = false;
  multiplayerState.players = [];
  multiplayerState.chat = [];
  renderLivePlayers();
  renderLiveChat();
  setLiveWorldStatus("Offline");
  appendDebugLine("Left live world.", "warn");
};

window.sendLiveChat = async function() {
  const input = document.getElementById("liveChatInput");
  const message = input ? input.value.trim() : "";
  if (!message) return;
  if (!multiplayerState.connected) {
    setLiveWorldStatus("Join the live world before chatting.", true);
    return;
  }
  try {
    appendDebugLine("Sending live chat message...", "muted");
    await cloudRequest("/api/world/chat", "POST", { message });
    if (input) input.value = "";
    appendDebugLine(`Live chat sent: ${message}`, "ok");
  } catch (error) {
    appendDebugLine(`Live chat failed: ${error.message}`, "error");
    setLiveWorldStatus(error.message, true);
  }
};

function movePlayer(direction) {
  const room = getCurrentRoom();
  const exits = room?.exits || {};
  const directionAliases = {
    n: "north",
    s: "south",
    e: "east",
    w: "west",
    out: "out",
    outside: "out",
    exit: "out",
  };
  const target = exits[direction] || exits[directionAliases[direction]];

  if (!target) {
    setOutput("You can't go that way.", true);
    return;
  }

  if (typeof target === "string" && target.startsWith("mainMap:")) {
    gameState.location = target.split(":")[1];
  } else {
    gameState.location = target;
  }

  renderRoom();
  renderStats();
  renderInventory();
  syncLivePresence();
}

function initializeGame() {
  if (window.__peakeGameInitialized) return;
  window.__peakeGameInitialized = true;
  renderStats();
  renderInventory();
  renderRoom();
  if (gameState.location === "spawn") {
    setOutput("Start here: type 'help' for commands, or press n / e / w to inspect the three doors.", true);
  }
  appendDebugLine("Game initialized.", "ok");
  setOutput("You wake in a strange chamber with no map, no instructions, and only a few words from the dark:\n\"Walk carefully. Listen first. Survive.\"", true);
  showNpcDialogueWindow("Narrator", "Walk up to someone and type: talk [name]");
  runBackendHealthCheck();
}

function cloneGameState() {
  return JSON.parse(JSON.stringify(gameState));
}

function applyGameStateSave(saveData) {
  if (!saveData || typeof saveData !== "object") return;

  if (typeof saveData.location === "string") {
    gameState.location = saveData.location;
  }
  if (Array.isArray(saveData.inventory)) {
    gameState.inventory = saveData.inventory.slice();
  }
  if (saveData.stats && typeof saveData.stats === "object") {
    gameState.stats = {
      ...gameState.stats,
      ...saveData.stats,
    };
  }
  if (Array.isArray(saveData.log)) {
    gameState.log = saveData.log.slice();
  }
}

function getCloudElements() {
  return {
    baseUrl: document.getElementById("cloudApiBase"),
    username: document.getElementById("cloudUsername"),
    password: document.getElementById("cloudPassword"),
    status: document.getElementById("cloudSaveStatus"),
  };
}

function getCloudBaseUrl() {
  const elements = getCloudElements();
  const raw = elements.baseUrl?.value || localStorage.getItem("peakeCloudBaseUrl") || "https://peakerpg-backend.onrender.com";
  const value = raw.trim().replace(/\/$/, "");
  localStorage.setItem("peakeCloudBaseUrl", value);
  if (elements.baseUrl && elements.baseUrl.value !== value) {
    elements.baseUrl.value = value;
  }
  return value;
}

function getCloudToken() {
  return localStorage.getItem("peakeCloudToken") || "";
}

function setCloudAuth(username, token) {
  if (username) localStorage.setItem("peakeCloudUsername", username);
  if (token) localStorage.setItem("peakeCloudToken", token);
}

function getCloudUsername() {
  const elements = getCloudElements();
  const value = (elements.username?.value || localStorage.getItem("peakeCloudUsername") || "").trim();
  if (elements.username && !elements.username.value && value) {
    elements.username.value = value;
  }
  return value;
}

function setCloudStatus(message, isError = false) {
  const elements = getCloudElements();
  if (!elements.status) return;
  elements.status.textContent = message;
  elements.status.style.color = isError ? "#ff8a8a" : "#9cff9c";
}

async function cloudRequest(path, method, body) {
  appendDebugLine(`${method} ${path}`, "muted");
  const response = await fetch(`${getCloudBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getCloudToken() ? { "X-Session-Token": getCloudToken() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    appendDebugLine(`${method} ${path} failed: HTTP ${response.status} ${data.error || ""}`.trim(), "error");
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  appendDebugLine(`${method} ${path} ok`, "ok");
  return data;
}

window.runBackendHealthCheck = runBackendHealthCheck;
window.testLiveWorldConnection = testLiveWorldConnection;
window.clearDebugTerminal = clearDebugTerminal;

window.saveGame = function () {
  const data = btoa(JSON.stringify(cloneGameState()));
  navigator.clipboard.writeText(data);
  alert("Save code copied!");
};

window.downloadSave = function () {
  const data = btoa(JSON.stringify(cloneGameState()));
  const a = document.createElement("a");
  a.href = `data:text/plain;charset=utf-8,${data}`;
  a.download = "savegame.txt";
  a.click();
};

window.loadGame = function () {
  try {
    const data = document.getElementById("loadInput").value.trim();
    const parsed = JSON.parse(atob(data));
    applyGameStateSave(parsed);
    renderStats();
    renderInventory();
    renderRoom();
    showNpcDialogueWindow("Narrator", "Save loaded successfully.");
  } catch (e) {
    alert("Failed to load game.");
  }
};

window.registerCloudAccount = async function () {
  try {
    const username = getCloudUsername();
    const password = getCloudElements().password?.value || "";
    if (!username || !password) {
      setCloudStatus("Enter a username and password first.", true);
      return;
    }

    const result = await cloudRequest("/api/auth/register", "POST", { username, password });
    setCloudAuth(result.username, result.token);
    setCloudStatus(`Registered and signed in as ${result.username}.`);
    setLiveWorldStatus(`Ready to join live world as ${result.username}.`);
  } catch (error) {
    setCloudStatus(error.message, true);
  }
};

window.loginCloudAccount = async function () {
  try {
    const username = getCloudUsername();
    const password = getCloudElements().password?.value || "";
    if (!username || !password) {
      setCloudStatus("Enter a username and password first.", true);
      return;
    }

    const result = await cloudRequest("/api/auth/login", "POST", { username, password });
    setCloudAuth(result.username, result.token);
    setCloudStatus(`Signed in as ${result.username}.`);
    setLiveWorldStatus(`Ready to join live world as ${result.username}.`);
  } catch (error) {
    setCloudStatus(error.message, true);
  }
};

window.saveCloudGame = async function () {
  try {
    if (!getCloudToken()) {
      setCloudStatus("Sign in before cloud saving.", true);
      return;
    }

    const result = await cloudRequest("/api/save", "POST", {
      character: {
        stats: gameState.stats,
        inventory: gameState.inventory,
      },
      gameState: {
        location: gameState.location,
        log: gameState.log,
      },
    });

    setCloudStatus(`Cloud save complete for ${result.username} at ${new Date(result.savedAt).toLocaleString()}.`);
  } catch (error) {
    setCloudStatus(error.message, true);
  }
};

window.loadCloudGame = async function () {
  try {
    if (!getCloudToken()) {
      setCloudStatus("Sign in before cloud loading.", true);
      return;
    }

    const result = await cloudRequest("/api/save", "GET");
    if (result.character) {
      applyGameStateSave({
        stats: result.character.stats,
        inventory: result.character.inventory,
      });
    }
    if (result.gameState) {
      applyGameStateSave({
        location: result.gameState.location,
        log: result.gameState.log,
      });
    }
    renderStats();
    renderInventory();
    renderRoom();
    showNpcDialogueWindow("Narrator", `Cloud save loaded for ${result.username}.`);
    setCloudStatus(`Loaded cloud save for ${result.username}.`);
  } catch (error) {
    setCloudStatus(error.message, true);
  }
};

window.handleCommand = function() {
  const inputElement = document.getElementById("commandInput");
  const rawInput = inputElement ? inputElement.value.trim() : "";
  if (!rawInput) return;

  const input = rawInput.toLowerCase();
  const [command, ...rest] = input.split(/\s+/);
  const target = rest.join(" ");
  const room = getCurrentRoom();

  switch (command) {
    case "help":
      setOutput("Commands:\nlook\nhelp\nn/s/e/w\nout\nnorth/south/east/west\noutside/exit\ntalk [npc]\ntake/get [item]\nsay [message]\nwho", true);
      break;
    case "look":
      renderRoom();
      break;
    case "n":
    case "north":
      movePlayer("n");
      break;
    case "s":
    case "south":
      movePlayer("s");
      break;
    case "e":
    case "east":
      movePlayer("e");
      break;
    case "w":
    case "west":
      movePlayer("w");
      break;
    case "out":
    case "outside":
    case "exit":
      movePlayer("out");
      break;
    case "go":
      if (["out", "outside", "exit"].includes(target)) {
        movePlayer("out");
      } else if (["north", "south", "east", "west"].includes(target)) {
        movePlayer(target.charAt(0));
      } else {
        setOutput("Try 'go outside' or use a direction like n, s, e, or w.", true);
      }
      break;
    case "talk":
      if (!target) {
        setOutput("Talk to who?", true);
        break;
      }
      if (room && Array.isArray(room.npcs)) {
        const npcExists = room.npcs.some((npc) => {
          if (typeof npc === "string") return npc.toLowerCase() === target;
          return String(npc?.name || "").toLowerCase() === target;
        });

        if (npcExists) {
          const dialogue = getNpcDialogue(target, room);
          showNpcDialogueWindow(target, dialogue);
          setOutput(`${target} says: ${dialogue}`, false);
        } else {
          setOutput("That person isn't here.", true);
        }
      } else {
        setOutput("That person isn't here.", true);
      }
      break;
    case "take":
    case "get":
      if (room?.objects?.includes(target)) {
        gameState.inventory.push(target);
        room.objects = room.objects.filter(obj => obj !== target);
        setOutput(`You picked up the ${target}.`, true);
        renderInventory();
        renderRoom();
      } else {
        setOutput("That item isn't here.", true);
      }
      break;
    case "say":
      if (!target) {
        setOutput("Say what?", true);
        break;
      }
      setOutput(`You say: "${target}"`, true);
      if (multiplayerState.connected && getCloudToken()) {
        cloudRequest("/api/world/chat", "POST", { message: target }).catch((error) => {
          appendDebugLine(`Live speech failed: ${error.message}`, "error");
          setLiveWorldStatus(error.message, true);
        });
      }
      break;
    case "who":
      if (!multiplayerState.players.length) {
        setOutput("No players are currently online.", true);
        break;
      }
      setOutput(`Online: ${multiplayerState.players.map((player) => `${player.username} @ ${player.roomName || player.location}`).join(", ")}`, true);
      break;
    default:
      setOutput("Unknown command. Type 'help' to see options.", true);
      break;
  }

  if (inputElement) inputElement.value = "";
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGame);
} else {
  initializeGame();
}

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
  // Map UI is intentionally disabled for now so the game stays text-first.
}
