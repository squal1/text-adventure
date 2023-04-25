const data = require("./gameData.json");

const player = data.player || null;
const rooms = data.rooms || null;
const world = data.world || null;
const currentRoom = rooms["Entrance"] || null;
const discoveredRooms = world.discoveredRooms || null;

module.exports = { player, rooms, world, currentRoom, discoveredRooms };
