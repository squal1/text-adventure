var rooms;
var currentRoom;
var player;
var world;
var actions;

var dungeonRooms;

axios.defaults.baseURL = "http://localhost:8000";

// This function provides a typing animation effect for displaying the given text in the specified class name element.
const typeWriter = (text, className, i = 0) => {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(`.${className}`);
        if (!element) {
            reject(
                new Error(`Element with class name '${className}' not found.`)
            );
            return;
        }

        // Type out the text character by character using a recursive setTimeout function with 16ms delay per character.
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(() => {
                typeWriter(text, className, i).then(resolve).catch(reject);
            }, 1);
        } else {
            // Resolve the Promise when the typing animation is complete.
            resolve();
        }
    });
};

const printText = async (text) => {
    let li = document.createElement("li");

    const parent = document.querySelector(`.text`);

    const childElements = Array.from(parent.children);
    const numChildElements = childElements.length;

    li.classList.add(`description${numChildElements}`);
    parent.append(li);
    await typeWriter(text, `description${numChildElements}`);
};

// This function displays the current room name, description, and list of available actions using the typeWriter function.
const displayCurrentRoom = async (roomName, description, actions) => {
    // Not allowing input during the function
    const inputField = document.querySelector("#inputField");
    inputField.disabled = true;

    await typeWriter(roomName, "current-room");
    printText(description);

    // Loop through each action in array and display it using the typeWriter function
    let i = 0;
    while (i < actions.length) {
        const action = actions[i];
        // Check if the action is a "collect" action and if the item has already been collected, remove it from the array.
        if (action.type == "collect" && action.item in player.items) {
            actions.splice(i, 1);
            continue;
        }
        // Check if the action is a "fight" action and if the room has already been cleared, remove it from the array.
        if (action.type == "fight" && currentRoom.name in world.clearedRooms) {
            actions.splice(i, 1);
            continue;
        }
        // Check if the action has showIfCleared attribute, hide if room is not in world.clearedRooms
        if (
            action.hasOwnProperty("showIfCleared") &&
            !(currentRoom.name in world.clearedRooms)
        ) {
            actions.splice(i, 1);
            continue;
        }
        // Write action into action list
        let li = document.createElement("li");

        const parent = document.querySelector(`.text`);
        const childElements = Array.from(parent.children);
        const numChildElements = childElements.length;

        li.classList.add(`action${numChildElements}`);
        parent.append(li);
        li.scrollIntoView();
        await typeWriter(
            `${i + 1}. ${action.description}`,
            `action${numChildElements}`
        );
        i++;
    }

    inputField.disabled = false;
    inputField.focus();
};

// Update item list on display
const updateItems = async (newItem) => {
    let p = document.createElement("p");

    const parent = document.querySelector(`.items`);

    const childElements = Array.from(parent.children);
    const numChildElements = childElements.length;

    p.classList.add(`item${numChildElements}`);
    parent.append(p);
    await typeWriter(
        `${numChildElements}. ${newItem}`,
        `item${numChildElements}`
    );
};

const updatePlayer = async (player) => {
    // Clear old text
    document.querySelector(".hp").innerHTML = "";
    document.querySelector(".attack").innerHTML = "";

    stats = player.stats;
    await typeWriter(`${stats["hp"]}`, `hp`);
    await typeWriter(`${stats["attack"]}`, `attack`);
};

// Fetch all the game data when the website is initialized
window.addEventListener("load", () => {
    axios
        .get("/init")
        .then((response) => {
            player = response.data.player;
            rooms = response.data.rooms;
            world = response.data.world;
            currentRoom = response.data.currentRoom;
            actions = currentRoom.actions;

            updatePlayer(player);

            // Write text to browser
            displayCurrentRoom(
                currentRoom.name,
                currentRoom.description,
                actions
            );

            for (item in player.items) {
                updateItems(item);
            }

            //Map
            //console.log(world.dungeonRooms);
            createMap(world.dungeonRooms);
            console.log(world.discoveredRooms);
            console.log(world.currentRoom);
            updateMap(world.discoveredRooms, world.currentRoom);
        })
        .catch((error) => {
            console.error(error);
        });

    //console.log("world: " + world);
    //console.log("dungeonRooms: " + dungeonRooms);
    //console.log("currentRoom: " + currentRoom);
    //createMap(dungeonRooms);
    //updateMap(discoveredRooms, currentRoom);
});

// Call the API when input is submitted
document.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();

    // Get the value of the input field
    const inputValue = document.querySelector("#inputField").value;

    // Validate input
    if (
        !Number.isInteger(parseInt(inputValue)) ||
        parseInt(inputValue) > actions.length
    ) {
        alert("Invalid input. Please enter a integer representing the action.");
        return;
    }

    printText(inputValue);
    printText("-------------------------------------------------");
    const action = actions[inputValue - 1];

    // Clear old text
    document.querySelector(".current-room").innerHTML = "";

    // Call the API with the input value
    axios
        .post("/action", { action: action })
        .then((response) => {
            switch (action.type) {
                case "move": {
                    // Server sending back a room object representing the new room
                    currentRoom = response.data;
                    actions = currentRoom.actions;

                    // Write new text to browser
                    displayCurrentRoom(
                        currentRoom.name,
                        currentRoom.description,
                        actions
                    );
                    break;
                }
                case "collect": {
                    let { newPlayerData, newItem } = response.data;
                    // Update player data
                    player = newPlayerData;

                    updateItems(newItem);
                    displayCurrentRoom(
                        currentRoom.name,
                        currentRoom.description,
                        actions
                    );
                    break;
                }
                case "fight": {
                    let {
                        newPlayerData,
                        newWorldData,
                        currentRoom,
                        battleResultMessage,
                    } = response.data;
                    // Update player and world data
                    player = newPlayerData;
                    world = newWorldData;

                    // Refresh action lsit
                    actions = currentRoom.actions;

                    updatePlayer(player);

                    displayCurrentRoom(
                        currentRoom.name,
                        currentRoom.description,
                        actions
                    );

                    printText(battleResultMessage);
                    break;
                }
                default:
                    // Handle invalid action
                    res.send(400, "Invalid action type");
            }
        })
        .catch((error) => {
            // Handle any errors that occur during the API request
            console.error(error);
        });
    // Clear the input field
    inputField.value = "";
});

const createMap = (dungeonRooms) => {
    //Create base grid layout

    const map = document.querySelector(`.map`);
    //Y coordinate (row number)
    for (var y = 0; y < 9; y++) {
        let div = document.createElement("div");
        div.classList.add(`row`);

        //X coordinate (column number)
        for (var x = 0; x < 9; x++) {
            let span = document.createElement("span");
            span.classList.add(`r${x}${y}`);
            // span.innerHTML = "1";
            div.append(span);
        }

        map.append(div);
    }

    //Add names to rooms
    for (var i = 0; i < dungeonRooms.length; i++) {
        var arr = dungeonRooms[i];
        const room = document.querySelector(`.${arr[0]}`);
        let p = document.createElement("p");

        p.innerHTML = arr[1];
        room.append(p);
    }
};

//Updates the map to reveal discovered rooms
const updateMap = (discoveredRooms, currentRoom) => {
    //Make all rooms invisible
    var spans = document.querySelectorAll(".map .row span");
    console.log(spans);
    // for (span in spans) {
    //     span.classList.add("hidden");
    // }
    [].forEach.call(spans, (el) => {
        // except for the element clicked, remove active class
        el.classList.add("hidden");
    });
    //Make all discovered rooms visible
    for (var i = 0; i < discoveredRooms.length; i++) {
        room = document.querySelector("." + discoveredRooms[i]);
        room.classList.remove("hidden");
        room.classList.add("active");
    }

    //Mark current room on map
    curRoom = document.querySelector("." + currentRoom);
    curRoom.classList.add("current");
    console.log("currentRoom:");
    console.log(currentRoom);
};

/*
//The map is a 9x9 grid. This variable stores the rooms that the player has
//already entered in coordinate form rxy, where x and y are numbers ranging
//from 0-8, spanning left to right and top to bottom. r40 is the starting room.
var discoveredRooms = [
    "r40",
    "r41",
    "r42",
    "r51",
    "r61",
    "r43",
    "r44",
    "r34",
    "r24",
    "r45",
    "r55",
    "r65",
    "r46",
    "r47",
];
*/
//The room the player currently resides in
//var currentRoom = "r40";

//Array of room name to coordinates pairs (format: [[rxy,roomName],[rxy,roomName],...] where xy is the coordinates and roomName is the name of the room)
/*var dungeonRooms = [
    ["r40", "Entrance"],
    ["r41", "Cave"],
    ["r42", "Dark Room"],
    ["r51", "Cave-In Room"],
    ["r61", "Cave Clearing"],
    ["r43", "Door Room"],
    ["r24", "Tomb"],
    ["r34", "Catacombs"],
    ["r44", "Well"],
    ["r45", "Leaky Passage"],
    ["r55", "Puzzle Door Room"],
    ["r65", "Treasure Stash"],
    ["r46", "Boss Room"],
    ["r47", "Exit"],
];
*/
// updateMap(discoveredRooms, currentRoom);
