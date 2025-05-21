// banker.js - Handles purchases and PeakeCoin transactions

window.playerPeakeCoin = 100; // Example starting balance

window.getBalance = function() {
  return window.playerPeakeCoin;
};

window.purchaseItem = function(itemName, shopType) {
  const shop = window.getShop(shopType);
  if (!shop) return "Shop not found.";
  const item = shop.items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
  if (!item) return "Item not found in this shop.";
  if (window.playerPeakeCoin < item.price) return "Not enough PeakeCoin.";
  window.playerPeakeCoin -= item.price;
  if (!window.player.inventory) window.player.inventory = [];
  window.player.inventory.push(item.name);
  return `You purchased ${item.name} for ${item.price} PeakeCoin.`;
};

// Example usage: window.purchaseItem('Health Potion', 'apothecary');
