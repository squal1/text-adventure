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

	function calculateDamage() {
		return Math.floor((Math.random() * (2 - 0.5) + 0.5) * 100) / 100; // Generates a random number between 0.5 and 2 to 2 decimal places
	}
	
	function calculateHits() {
		return Math.floor(Math.random() * (3 - 1) + 2); // Generates a random number between 1 and 3
	}

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
            player.items[newItem] = true;
            newPlayerData = player;
            // console.log(newPlayerData);
            res.status(200).send({ newPlayerData, newItem });
            break;
        case "fight":
            enemyHp = calculateHits();//action.hp; //old code
            enemyAtk = calculateDamage();//action.attack; //old code
            playerHp = player.stats.hp;
            playerAtk = player.stats.attack;

            numOfRounds = Math.floor(enemyHp / playerAtk);
            playerHp -= enemyAtk * numOfRounds;
			playerAtk += enemyHp;

            // Update player hp
            player.stats.hp = playerHp;
			player.stats.attack = playerAtk;
            // Update world
            world.clearedRooms[action.location] = true;
            console.log(world.clearedRooms);

            newPlayerData = player;
            newWorldData = world;

            battleResultMessage = `You defeated the enemy with ${numOfRounds} hits. You took ${enemyAtk} * ${enemyHp} = ${
                enemyAtk * numOfRounds
            } damage from the battle.`;

            res.status(200).send({
                newPlayerData,
                newWorldData,
                currentRoom,
                battleResultMessage,
            });

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
