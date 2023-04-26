const data = require("./gameData.json");
const save = require("./saveData.json");

var saved = save.gameSaved;

const gameSaved = data.gameSaved || null;
const player = data.player || null;
const rooms = data.rooms || null;
const world = data.world || null;
const currentRoom = rooms["Entrance"] || null;
const discoveredRooms = world.discoveredRooms || null;

console.log("Default data:");
console.log(data);

console.log("Save Data");
console.log(save);

const saveGameSaved = save.gameSaved || null;
const savePlayer = save.player || null;
const saveRooms = save.rooms || null;
const saveWorld = save.world || null;
const savecurrentRoom = rooms["Entrance"] || null;
const savediscoveredRooms = world.discoveredRooms || null;

if (saved === false) {
    module.exports = { player, rooms, world, currentRoom, discoveredRooms };
    console.log("No save data found");
} else {
    module.exports = { savePlayer, saveRooms, saveWorld, savecurrentRoom, savediscoveredRooms };
    console.log("Save data found");
}
