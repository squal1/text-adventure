const express = require("express");
var { player, rooms, world, currentRoom } = require("./gameDataManager");

const app = express();
const port = 8000;

app.use(express.static(__dirname + "/client"));
app.use(express.json());

app.get("/init", (req, res) => {
    if (!player || !rooms) {
        res.status(500).send("Game data not found");
        return;
    }
    res.status(200).send({ player, rooms, world, currentRoom });
});

app.post("/action", (req, res) => {
    const action = req.body.action;

    // Handle the action object
    switch (action.type) {
        case "move":
            // Move to the destination
            currentRoom = rooms[action.destination];
            res.status(200).send(currentRoom);
            break;
        case "collect":
            // Handle update action -> Send back the player data and item data
            newItem = action.item;
            player.items[newItem] = true;
            newPlayerData = player;
            // console.log(newPlayerData);
            res.status(200).send({ newPlayerData, newItem });
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

            newPlayerData = player;
            newWorldData = world;

            res.status(200).send({ newPlayerData, newWorldData, currentRoom });

            // Handle fight action
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