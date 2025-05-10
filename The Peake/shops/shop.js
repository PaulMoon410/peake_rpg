// Load Hive Keychain directly from the index.html or here if needed
if (typeof hive_keychain === "undefined") {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/hive-keychain/dist/hive-keychain.min.js";
  document.head.appendChild(script);
}

// Define global displayShop function
window.displayShop = function(username) {
  const container = document.getElementById("shop");
  container.innerHTML = "<h3>Welcome to the Shop (Prices in PEK)</h3>";

  for (const item in window.shopItems) {
    const cost = window.shopItems[item];
    const btn = document.createElement("button");
    btn.innerText = `Buy ${item} - ${cost} PEK`;
    btn.onclick = () => buyItemWithKeychain(username, item, cost);
    container.appendChild(btn);
    container.appendChild(document.createElement("br"));
  }
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
    itemCost.toFixed(3),
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
