window.onload = function () {
    let player = {
      x: 5,
      y: 5,
      hp: 100,
      stamina: 50,
      inventory: ["Map"],
    };
  
    let map = window.gameMap;
  
    function getLocationKey(x, y) {
      return `${x},${y}`;
    }
  
    function describeLocation() {
      const key = getLocationKey(player.x, player.y);
      return map[key] || "You see nothing of interest.";
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
  
      if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
        player.x = newX;
        player.y = newY;
        player.stamina = Math.max(0, player.stamina - 1);
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
  