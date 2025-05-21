// Overworld Map for Peake RPG
// This file defines the outside world (wilderness, fields, etc.)
// Towns, shops, and other structures you can enter are defined separately in rooms/rooms.js

const MAP_WIDTH = 10;
const MAP_HEIGHT = 10;

const descriptions = [
  "A crumbling watchtower looms here, its top barely standing.",
  "This field is strewn with old gear and bones — a battle long forgotten.",
  "You find an overgrown garden, the vegetables wild and bitter.",
  "Dusty books rot in a collapsed library wing.",
  "A bubbling spring gurgles beside shattered stone statues.",
  "Charred trees stand in silence, blackened by lightning.",
  "A worn path cuts through tall golden grass.",
  "A makeshift shelter of rags and wood sits abandoned.",
  "You pass a strange symbol etched into the dirt.",
  "The smell of sulfur hangs thick in the air here.",
  "An altar of bones rises in a clearing, candles long burned out.",
  "The wind whistles through a jagged canyon wall.",
  "This place echoes — though nothing seems to be here.",
  "A tangle of vines blocks a broken iron gate.",
  "A ruined windmill creaks with each breeze.",
  "You hear whispers. They stop when you focus.",
  "Someone recently camped here. Still warm ashes remain.",
  "A cracked mirror leans against a tree, reflecting a stranger.",
  "You find a mural half-buried in dust — a city skyline.",
  "An icy breeze cuts through, though no snow is in sight.",
  "A narrow stream bubbles with glowing fish.",
  "A collapsed well stands dry in the center of the square.",
  "A ritual circle, carved with care, lies unlit.",
  "Here lies a rusty swing set — odd in the wild.",
  "A heavy stone door stands open, leading nowhere.",
  "Tall, black mushrooms grow in clusters here.",
  "The soil is scorched, yet no fire has touched it.",
  "A rusting automaton lies frozen mid-step.",
  "Bright blue feathers dot the ground.",
  "An overturned wagon reveals nothing inside but sand.",
  "A jagged cliff overlooks mist-covered ruins.",
  "A large skeletal ribcage arches over a dark cave.",
  "Wind chimes made of bone sway eerily.",
  "A tree grows upside down from the ground.",
  "This clearing is perfectly circular and silent.",
  "A shattered compass spins on the ground.",
  "Moss-covered statues line the trail.",
  "A deep hole pulses faint purple light.",
  "A cracked screen blinks: 'SYSTEM ERROR.'",
  "An old diary rests on a rock, pages fluttering.",
  "You find claw marks in the stone wall.",
  "A child's toy sits beside a long-faded blanket.",
  "The ground is soft, like it’s breathing.",
  "You see a burning candle but no flame source.",
  "A maze of fences blocks simple paths.",
  "Odd footprints lead in circles before vanishing.",
  "A bell tower collapsed into itself here.",
  "You hear a soft hum from beneath the soil.",
  "A narrow bridge crosses a dry trench.",
  "Scorch marks form a spiral into the ground.",
  "A rusted sign reads: 'EXIT — 0.3 Miles'.",
  "There’s a subtle vibration in the air.",
  "You find a book titled 'How This Ends.'",
  "A floating orb hovers silently above the path.",
  "Melted glass covers the ground like ice.",
  "An obsidian obelisk hums with dormant power.",
  "You walk through an invisible curtain of warmth.",
  "The smell of roasted meat lingers, but no fire.",
  "A feather floats against gravity, refusing to land.",
  "Old carvings depict humans with metal limbs.",
  "A doorway stands alone, freestanding in air.",
  "The grass here grows in concentric circles.",
  "Broken gears litter the ground like petals.",
  "A single red rose blooms in a blackened bush.",
  "There’s a humming tune, but no source found.",
  "A flickering lantern hangs from a vine-wrapped tree.",
  "You pass through a shimmer like heat on pavement.",
  "A cracked tablet displays a flashing red dot.",
  "Beneath your feet, the dirt is hollow.",
  "Three stones are arranged like a triangle.",
  "A long rope disappears into the sky.",
  "You hear a child’s laugh… then nothing.",
  "A metallic scent chokes the air.",
  "An old road sign reads: 'Welcome to Haven.'",
  "Broken wings lie scattered on the ground.",
  "A rusted vending machine buzzes softly.",
  "A twisted metal tower looms above, broken.",
  "You step over glowing green mushrooms.",
  "The ground hums with magnetic force.",
  "A shattered crystal pulses weak light.",
  "You smell fresh rain — but the sky is clear.",
  "You find boots with no footprints around them.",
  "The shadows here move ever so slightly.",
  "A child’s drawing is pinned to a stake.",
  "The wind carries a song you almost remember.",
  "A tree split by lightning still stands tall.",
  "You spot a bird made entirely of wire.",
  "You’re being watched. You feel it.",
  "A collapsed building groans with shifting metal.",
  "A puddle reflects a sky that’s not yours.",
  "Crows circle silently overhead.",
  "A sign says 'DO NOT ENTER' — in reverse.",
  "The air tastes metallic and sharp.",
  "A gate leads to nowhere. Still locked.",
  "Someone has drawn arrows pointing all directions.",
  "A warning siren sounds far off… then cuts.",
  "The earth has been tilled recently, no crops grow.",
  "You find a broken hourglass — sand suspended.",
  "A low hum causes your bones to itch.",
  "You stumble onto a message etched in gold: 'RUN.'",
  "You arrive at a terminal blinking: 'Awaiting input...'",
  "The wind whispers your name.",
  "A dark circle is burned into the grass.",
  "Your footsteps make no sound here.",
  "You are here. The map confirms it. But how?",
  "There’s a chair. Just a chair.",
  "This place feels... too still.",
];

// Build the overworld map as an object keyed by 'x,y'
const gameMap = {};
let index = 0;
for (let y = 0; y < MAP_HEIGHT; y++) {
  for (let x = 0; x < MAP_WIDTH; x++) {
    const key = `${x},${y}`;
    // Use descriptions in order, repeat last if we run out
    gameMap[key] = descriptions[index] || descriptions[descriptions.length - 1];
    index++;
  }
}

// Expose gameMap globally for use in game logic
window.gameMap = gameMap;

// Utility: check if a location is in the overworld
window.isOverworldLocation = function(loc) {
  // Overworld locations are in the form 'x,y' where x and y are numbers
  return /^\d+,\d+$/.test(loc);
};
