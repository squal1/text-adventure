const fs = require('fs');
const data = require("./gameData.json");
//const save = require("./saveData.json");
const jsonStr = fs.readFileSync("./saveData.json");
console.log("json string:");
console.log(jsonStr);
const save = JSON.parse(jsonStr);

var saved = save.gameSaved;

const gameSaved = data.gameSaved || null;
const player = data.player || null;
const rooms = data.rooms || null;
const world = data.world || null;
const currentRoom = rooms["Entrance"] || null;
const discoveredRooms = world.discoveredRooms || null;

//console.log("Default data:");
//console.log(data);

console.log("Save Data");
console.log(save);

const saveGameSaved = save.gameSaved || null;
const savePlayer = save.player || null;
const saveRooms = save.rooms || null;
const saveWorld = save.world || null;
const saveCurrentRoom = saveRooms["Entrance"] || null;
const saveDiscoveredRooms = saveWorld.discoveredRooms || null;

console.log("savePlayer:");
console.log(savePlayer.stats);

if (saved === false) {
    module.exports = { gameSaved, player, rooms, world, currentRoom, discoveredRooms };
    console.log("No save data found");
} else {
    module.exports = { saveGameSaved, savePlayer, saveRooms, saveWorld, saveCurrentRoom, saveDiscoveredRooms };
    console.log("Save data found");
}
