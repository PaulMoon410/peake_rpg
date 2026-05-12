// Hive Keychain is expected to be provided by the browser extension.
if (typeof hive_keychain === "undefined") {
  console.warn("Hive Keychain extension not detected. Shop purchases are disabled until it is available.");
}

function normalizeShopItems(rawItems) {
  if (Array.isArray(rawItems)) return rawItems;
  if (!rawItems || typeof rawItems !== "object") return [];

  // Support legacy object map: { "Health Potion": 10 }
  return Object.entries(rawItems).map(([name, price]) => ({
    name,
    price: Number(price),
    shop: "general"
  }));
}

const shopItems = normalizeShopItems(window.shopItems);

// Shop logic for Peake RPG
// Uses shop_items.js for item definitions and prices

window.shopData = {
  general: {
    name: "General Store",
    items: shopItems.filter(item => item.shop === "general")
  },
  blacksmith: {
    name: "Blacksmith",
    items: shopItems.filter(item => item.shop === "blacksmith")
  },
  apothecary: {
    name: "Apothecary",
    items: shopItems.filter(item => item.shop === "apothecary")
  }
};

if (!window.shopData.general.items.length && shopItems.length) {
  // If items have no explicit shop assignment, keep everything in General Store.
  window.shopData.general.items = shopItems;
}

// Get shop by type (e.g., 'general', 'blacksmith', 'apothecary')
window.getShop = function(type) {
  return window.shopData[type] || null;
};

// Show shop inventory and prices
window.showShop = function(type) {
  const shop = window.getShop(type);
  if (!shop) return "Shop not found.";
  let output = `Welcome to the ${shop.name}!\nItems for sale:`;
  shop.items.forEach(item => {
    output += `\n- ${item.name} (${item.price} PeakeCoin)`;
  });
  return output;
};

// Define global displayShop function
window.displayShop = function(username) {
  const container = document.getElementById("shop");
  container.innerHTML = "<h3>Welcome to the Shop (Prices in PEK)</h3>";

  shopItems.forEach(({ name, price }) => {
    const cost = Number(price);
    const btn = document.createElement("button");
    btn.innerText = `Buy ${name} - ${cost} PEK`;
    btn.onclick = () => buyItemWithKeychain(username, name, cost);
    container.appendChild(btn);
    container.appendChild(document.createElement("br"));
  });
};

function buyItemWithKeychain(username, itemName, itemCost) {
  if (typeof hive_keychain === "undefined") {
    alert("Hive Keychain is not loaded.");
    return;
  }

  const SHOP_ACCOUNT = "yourshopacct"; // replace with your Hive shop username
  hive_keychain.requestTransfer(
    username,
    SHOP_ACCOUNT,
    Number(itemCost).toFixed(3),
    `Buy:${itemName}`,
    "PEK",
    (response) => {
      if (response.success) {
        alert(`Transaction broadcasted for ${itemName}!`);
      } else {
        alert("Purchase failed or cancelled.");
      }
    }
  );
}
