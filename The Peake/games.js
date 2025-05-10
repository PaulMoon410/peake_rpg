window.onload = function () {
  let player = window.createPlayer();
  let inRoom = null;

  const map = window.gameMap;
  const rooms = window.roomDetails || {};

  function getLocationKey(x, y) {
    return `${x},${y}`;
  }

  function getRoomDetails(x, y) {
    return rooms[getLocationKey(x, y)];
  }

  function describeLocation() {
    if (inRoom) {
      const room = rooms[inRoom];
      let desc = `${room.name}\n\n${room.description}`;
      if (room.npcs) desc += `\n\nNPCs here: ${room.npcs.join(", ")}`;
      if (room.objects) desc += `\nObjects: ${room.objects.join(", ")}`;
      if (room.exits) desc += `\nExits: ${Object.keys(room.exits).join(", ")}`;
      return desc;
    } else {
      const key = getLocationKey(player.x, player.y);
      const mapDesc = map[key] || "You see nothing of interest.";
      const room = rooms[key];
      let desc = room ? `${room.name}\n\n${room.description}` : mapDesc;
      if (room?.npcs) desc += `\n\nNPCs here: ${room.npcs.join(", ")}`;
      if (room?.objects) desc += `\nObjects: ${room.objects.join(", ")}`;
      return desc;
    }
  }

  function render() {
    document.getElementById("output").innerText = describeLocation();
    document.getElementById("stats").innerText = `HP: ${player.hp}\nStamina: ${player.stamina}`;

    const inventoryList = document.getElementById("inventory");
    inventoryList.innerHTML = "";
    player.inventory.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      inventoryList.appendChild(li);
    });

    if (!inRoom && getLocationKey(player.x, player.y) === "5,5") {
      displayShop("your_hive_username");
    } else {
      document.getElementById("shop").innerHTML = "";
    }
  }

  window.move = function (direction) {
    if (inRoom) return alert("You must exit the room first.");
    let newX = player.x;
    let newY = player.y;

    switch (direction) {
      case "n": newY--; break;
      case "s": newY++; break;
      case "e": newX++; break;
      case "w": newX--; break;
    }

    const key = getLocationKey(newX, newY);
    if (map.hasOwnProperty(key)) {
      player.x = newX;
      player.y = newY;
      player.stamina = Math.max(0, player.stamina - 1);
    } else {
      alert("You can't go that way.");
    }

    render();
  };

  window.saveGame = function () {
    const data = btoa(JSON.stringify(player));
    navigator.clipboard.writeText(data);
    alert("Save code copied!");
  };

  window.downloadSave = function () {
    const data = btoa(JSON.stringify(player));
    const a = document.createElement("a");
    a.href = `data:text/plain;charset=utf-8,${data}`;
    a.download = "savegame.txt";
    a.click();
  };

  window.loadGame = function () {
    try {
      const data = document.getElementById("loadInput").value;
      const parsed = JSON.parse(atob(data));
      Object.assign(player, parsed);
      render();
    } catch (e) {
      alert("Failed to load game.");
    }
  };

  window.handleCommand = function () {
    const input = document.getElementById("commandInput").value.trim().toLowerCase();
    const [command, ...rest] = input.split(" ");
    const target = rest.join(" ");
    const key = getLocationKey(player.x, player.y);
    const room = inRoom ? rooms[inRoom] : rooms[key];

    switch (command) {
      case "look":
        alert(describeLocation());
        break;

      case "help":
        alert("Commands:\nlook\nenter\nexit\ntake/get [item]\ntalk [npc]\nuse/read/eat/drink/climb [item]\nhelp");
        break;

      case "enter":
        const possibleRoom = `shop_${key}`;
        if (rooms[possibleRoom]) {
          inRoom = possibleRoom;
          render();
        } else {
          alert("There is nothing to enter here.");
        }
        break;

      case "exit":
      case "out":
        if (!inRoom) return alert("You're not in a room.");
        const exit = rooms[inRoom]?.exits?.out;
        if (exit && exit.startsWith("mainMap:")) {
          const [x, y] = exit.split(":")[1].split(",").map(Number);
          player.x = x;
          player.y = y;
          inRoom = null;
          render();
        } else {
          alert("There's no exit here.");
        }
        break;

      case "take":
      case "get":
        if (room?.objects?.includes(target)) {
          player.inventory.push(target);
          room.objects = room.objects.filter(obj => obj !== target);
          alert(`You picked up the ${target}.`);
          render();
        } else {
          alert("That item isn't here.");
        }
        break;

      case "talk":
        if (room?.npcs?.includes(target)) {
          alert(`${target} nods at you...`);
        } else {
          alert("That person isn't here.");
        }
        break;

      case "use":
      case "read":
      case "eat":
      case "drink":
      case "climb":
        if (player.inventory.includes(target)) {
          alert(`You ${command} the ${target}. Nothing happens... yet.`);
        } else {
          alert(`You don't have a ${target} to ${command}.`);
        }
        break;

      default:
        alert("Unknown command. Type 'help' to see options.");
        break;
    }

    document.getElementById("commandInput").value = "";
  };

  render();
};
