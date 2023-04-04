const express = require("express");
const { player, rooms, currentRoom } = require("./gameDataManager");

const app = express();
const port = 8000;

app.use(express.static(__dirname + "/client"));
app.use(express.json());

app.get("/init", (req, res) => {
    if (!player || !rooms) {
        res.status(500).send("Game data not found");
        return;
    }
    res.status(200).send({ player, rooms, currentRoom });
});

app.post("/action", (req, res) => {
    const action = req.body.action;

    // Handle the action object
    switch (action.type) {
        case "move":
            res.status(200).send(rooms[action.destination]);
            break;
        case "collect":
            // Handle update action
            break;
        default:
            // Handle invalid action
            res.send(400, "Invalid action type");
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
