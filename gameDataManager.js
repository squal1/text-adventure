const data = require("./gameData.json");

const player = data.player || null;
const rooms = data.rooms || null;
const currentRoom = rooms["entrance"];

module.exports = { player, rooms, currentRoom };
