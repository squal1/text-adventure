const express = require("express");
var {
    player,
    rooms,
    world,
    currentRoom,
    discoveredRooms,
} = require("./gameDataManager");

const app = express();
const port = 8000;

app.use(express.static(__dirname + "/client"));
app.use(express.json());

app.get("/init", (req, res) => {
    if (!player || !rooms) {
        res.status(500).send("Game data not found");
        return;
    }
    res.status(200).send({
        player,
        rooms,
        world,
        currentRoom,
        discoveredRooms,
    });
});

app.post("/action", (req, res) => {
    const action = req.body.action;

    // Handle the action object
    switch (action.type) {
        case "move":
            // Move to the destination
            currentRoom = rooms[action.destination];
            // Update discovered rooms
            if (!discoveredRooms.includes(currentRoom.mapCode)) {
                discoveredRooms.push(currentRoom.mapCode);
            }
            res.status(200).send({ currentRoom, discoveredRooms });
            break;
        case "collect":
            // Handle update action -> Send back the player data and item data
            newItem = action.item;
            //If the number of items that the player has obtained from the room doesn't exceed the quantity in the room, increment by 1
            //console.log(world.collectedItems[action.location]);
            //console.log(action.quantity);
            if (world.collectedItems[action.location] < action.quantity) {
                player.items[newItem]++;
                world.collectedItems[action.location]++;
                console.log("item added");
            }
            newPlayerData = player;
            newWorldData = world;
            currentRoom = rooms[action.location];
            itemResultMessage = action.resultText;
            //console.log(newPlayerData);
            res.status(200).send({
                newPlayerData,
                newItem,
                newWorldData,
                currentRoom,
                itemResultMessage,
            });
            break;
        case "fight":
            enemyHp = action.hp;
            enemyAtk = action.attack;
            playerHp = player.stats.hp;
            playerAtk = player.stats.attack;

            numOfRounds = Math.floor(enemyHp / playerAtk);
            playerHp -= enemyAtk * numOfRounds;

            // Update player hp
            player.stats.hp = playerHp;
            // Update world
            world.clearedRooms[action.location] = true;
            console.log(world.clearedRooms);

            newPlayerData = player;
            newWorldData = world;

            if (numOfRounds == 0) {
                battleResultMessage = `The enemy didn't stand any chance in front of you at all. You killed it without taking any damage.`;
            } else {
                battleResultMessage = `You defeated the enemy with ${numOfRounds} hits. You took ${enemyAtk} * ${numOfRounds} = ${
                    enemyAtk * numOfRounds
                } damage from the battle.`;
            }

            res.status(200).send({
                newPlayerData,
                newWorldData,
                currentRoom,
                battleResultMessage,
            });

            // Handle fight action
            break;
        case "use":
            usedItem = action.consume;
            gainedItem = action.gain;
            itemEffect = action.effect;

            // Update player items on server
            if (player.items[usedItem] > 0) {
                player.items[usedItem]--;
                console.log("item used");
            }
            if (gainedItem === "") {
                console.log("No item gained from use");
            } else {
                player.items[gainedItem]++;
            }

            if (itemEffect === "heal") {
                player.stats["hp"] = player.stats["hp"] + 5;
            } else if (itemEffect === "attack") {
                player.stats["attack"] = player.stats["attack"] + 2;
            } else {
                console.log("No stat change from using item");
            }

            console.log(player.items);

            //If the used item used results in a room being solved, add that room to solvedPuzzleRooms
            if (action.solved === true) {
                world.solvedPuzzleRooms[action.location] = true;
                console.log("Room solved!");
            }

            newPlayerData = player;
            newWorldData = world;
            itemResultMessage = action.resultText;

            console.log(newPlayerData);
            console.log(newWorldData);

            res.status(200).send({
                newPlayerData,
                newWorldData,
                currentRoom,
                itemResultMessage,
            });
            //Handle use action
            break;
        default:
            // Handle invalid action
            res.send(400, "Invalid action type");
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

//WHAT TO PUSH TO DATABASE (Save data)
//Player Stats (stats, items)
//Cleared Conditions (puzzles, enemies)
//Discovered Rooms
//Current Room

//IDEAS
//Keep json file, push crucial save data to server
//Update game with json file, but push data when the user saves
//When the user loads,
