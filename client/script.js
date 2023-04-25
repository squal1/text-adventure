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
        // Check if the action is a "collect" action and if all items in the room have been collected, remove it from the array.
        if (action.type == "collect" && world.collectedItems[action.location] >= action.quantity) {
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
            console.log(currentRoom.name);
            console.log(world.clearedRooms);
            console.log(action);
            actions.splice(i, 1);
            continue;
        }
        // Check if the move action has showIfSolved attribute, hide if room is not in world.solvedPuzzleRooms
        if (
            action.hasOwnProperty("showIfSolved") &&
            !(currentRoom.name in world.solvedPuzzleRooms)
        ) {
            actions.splice(i, 1);
            continue;
        }
        //Check if the use action has the consume attribute, hide if the item is not in the player's inventory
        if (
            action.hasOwnProperty("needItem") && player.items[action.consume] == 0) {
            console.log(action.consume)
            console.log(player.items[action.consume])
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
const updateItems = async (newItem, quantity) => {
    let p = document.createElement("p");

    const parent = document.querySelector(`.items .list`);

    const childElements = Array.from(parent.children);
    const numChildElements = childElements.length;

    p.classList.add(`item${numChildElements}`);
    parent.append(p);
    await typeWriter(
        /*`${numChildElements}. */`${newItem + " (" + quantity + ")"}`,
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
            discoveredRooms = response.data.discoveredRooms;
            actions = currentRoom.actions;

            updatePlayer(player);

            // Write text to browser
            displayCurrentRoom(
                currentRoom.name,
                currentRoom.description,
                actions
            );

            //Clear item box, and update with items the player posesses
            $(".items .list").empty();

            for (item in player.items) {
                if (player.items[item] > 0) {
                    updateItems(item, player.items[item]);
                }
            }

            //Map
            //console.log(world.dungeonRooms);
            createMap(world.dungeonRooms);
            updateMap(discoveredRooms, currentRoom.mapCode);
        })
        .catch((error) => {
            console.error(error);
        });
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
                    // Server sending back a room object and the new list of discovered rooms
                    currentRoom = response.data.currentRoom;
                    discoveredRooms = response.data.discoveredRooms;

                    actions = currentRoom.actions;
                    mapCode = currentRoom.mapCode;

                    //Update map to show current room
                    updateMap(discoveredRooms, mapCode);
                    // Write new text to browser
                    displayCurrentRoom(
                        currentRoom.name,
                        currentRoom.description,
                        actions,
                    );
                    break;
                }
                case "collect": {
                    let { newPlayerData, newItem, newWorldData, currentRoom } = response.data;
                    // Update player data
                    player = newPlayerData;
                    world = newWorldData;

                    //Clear item box, and update with items the player posesses
                    $(".items .list").empty();

                    for (item in player.items) {
                        if (player.items[item] > 0) {
                            updateItems(item, player.items[item])
                        }
                    }

                    //Refresh action list
                    actions = currentRoom.actions
                    
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

                    // Refresh action list
                    actions = currentRoom.actions;

                    updatePlayer(player);

                    console.log(newWorldData);
                    displayCurrentRoom(
                        currentRoom.name,
                        currentRoom.description,
                        actions
                    );

                    printText(battleResultMessage);
                    break;
                }
                case "use": {
                    let {
                        newPlayerData,
                        newWorldData,
                        currentRoom,
                        itemResultMessage,
                    } = response.data
                    // Update player and world data
                    player = newPlayerData;
                    world = newWorldData;

                    //Clear item box, and update with items the player posesses
                    $(".items .list").empty();

                    for (item in player.items) {
                        if (player.items[item] > 0) {
                            updateItems(item, player.items[item])
                        }
                    }                    

                    //Refresh action list
                    actions = currentRoom.actions;

                    displayCurrentRoom(
                        currentRoom.name,
                        currentRoom.description,
                        actions
                    );
                    printText(itemResultMessage);
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

//MAP FUNCTIONS
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
    //Test
    // for (span in spans) {
    //    span.classList.add("hidden");
    //}
    [].forEach.call(spans, (el) => {
        // except for the element clicked, remove active class
        el.classList.add("hidden");
    });
    //Make all discovered rooms visible
    for (var i = 0; i < discoveredRooms.length; i++) {
        room = document.querySelector("." + discoveredRooms[i]);
        room.classList.remove("hidden");
        room.classList.add("active");
        room.classList.remove("current");
    }

    //Mark current room on map
    curRoom = document.querySelector("." + currentRoom);
    curRoom.classList.add("current");
    // console.log("currentRoom:");
    // console.log(currentRoom);
};

//Updates the background of the current room
//roomImageUrl: "bgimageurl"
//enemyList: [["enemyimageurl", number of enemy], ["enemyimageurl", number of enemy]]
// const updateRoomImage = (roomImageUrl, enemyList) => {
//     //Update the background
//     selector = document.querySelector(".roomDisplay");
//     console.log(selector);
//     selector.style.backgroundImage = "url('" + roomImageUrl + "')";

//     //Update the enemies
//     if (enemyList.length > 0) {
//         //Loop through enemy list
//         for (i = 0; i < enemyList.length; i++) {
//             //Pull an enemy entry from array
//             var enemy = enemyList[i];
//             //Place the provided number of that enemy on the screen
//             for (n = 0; n < enemy[1]; n++) {
//                 let img = document.createElement("img");
//                 img.src = enemy[0];
//                 selector.append(img);
//             }
//         }
//     } else {
//         console.log("no enemies in room");
//     }
// };

//var enemyArr = [];
// var enemyArr = [
//     ["slime.png", 10],
//     ["dragon.png", 1],
// ];
// updateRoomImage("paper.jpg", enemyArr);

//BUG LIST:
//On page reload, map highlights the entrance
