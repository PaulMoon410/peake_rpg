window.onload = function () {
    let player = window.createPlayer();
  
    const map = window.gameMap;
    const rooms = window.roomDetails || {};
  
    function getLocationKey(x, y) {
      return `${x},${y}`;
    }
  
    function getRoomDetails(x, y) {
      return rooms[getLocationKey(x, y)];
    }
  
    function describeLocation() {
      const key = getLocationKey(player.x, player.y);
      const mapDesc = map[key] || "You see nothing of interest.";
      const room = getRoomDetails(player.x, player.y);
  
      let desc = room ? `${room.name}\n\n${room.description}` : mapDesc;
  
      if (room?.npcs) {
        desc += `\n\nNPCs here: ${room.npcs.join(", ")}`;
      }
  
      if (room?.objects) {
        desc += `\nObjects: ${room.objects.join(", ")}`;
      }
  
      return desc;
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
  
      // Optional: auto-display shop if standing at shop room
      const key = getLocationKey(player.x, player.y);
      if (key === "5,5") {
        displayShop("your_hive_username"); // Replace with actual username logic
      } else {
        document.getElementById("shop").innerHTML = "";
      }
    }
  
    window.move = function (direction) {
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
  
    render();
  };
  