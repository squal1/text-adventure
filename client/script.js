var rooms;
var currentRoom;
var player;
var actions;

axios.defaults.baseURL = "http://localhost:8000";

// This function provides a typing animation effect for displaying the given text in the specified class name element.
const typeWriter = (text, className, i = 0) => {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(`.${className}`);
        if (!element) {
            console.log(text, className);
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
            }, 16);
        } else {
            // Resolve the Promise when the typing animation is complete.
            resolve();
        }
    });
};

// This function displays the current room name, description, and list of available actions using the typeWriter function.
const displayCurrentRoom = async (roomName, description, actions) => {
    // Not allowing input during the function
    const inputField = document.querySelector("#inputField");
    inputField.disabled = true;

    await typeWriter(roomName, "current-room");
    await typeWriter(description, "description");
    // Loop through each action in array and display it using the typeWriter function
    let i = 0;
    while (i < actions.length) {
        const action = actions[i];
        // Check if the action is a "collect" action and if the item has already been collected, remove it from the array.
        if (action.type == "collect" && action.item in player.items) {
            actions.splice(i, 1);
            continue;
        }
        let div = document.createElement("div");
        div.classList.add(`action${i}`);
        parent = document.querySelector(`.actions`);
        parent.append(div);
        await typeWriter(`${i + 1}. ${action.description}`, `action${i}`);
        i++;
    }
    inputField.disabled = false;
};

// Update item list on display
const updateItems = async (newItem) => {
    let div = document.createElement("p");

    const parent = document.querySelector(`.items`);

    const childElements = Array.from(parent.children);
    const numChildElements = childElements.length;

    div.classList.add(`item${numChildElements + 1}`);
    parent.append(div);
    await typeWriter(
        `${numChildElements + 1}. ${newItem}`,
        `item${numChildElements + 1}`
    );
};

// Fetch all the game data when the website is initialized
window.addEventListener("load", () => {
    axios
        .get("/init")
        .then((response) => {
            player = response.data.player;
            rooms = response.data.rooms;
            currentRoom = response.data.currentRoom;
            actions = currentRoom.actions;

            // Write text to browser
            displayCurrentRoom(
                currentRoom.name,
                currentRoom.description,
                actions
            );
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

    const action = actions[inputValue - 1];

    // Clear old text
    document.querySelector(".current-room").innerHTML = "";
    document.querySelector(".description").innerHTML = "";
    document.querySelector(".actions").innerHTML = "";

    // Call the API with the input value
    axios
        .post("/action", { action: action })
        .then((response) => {
            switch (action.type) {
                case "move":
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
                case "collect":
                    newItem = response.data;
                    // Add item into player items
                    player.items[newItem] = true;
                    // console.log(player.items);

                    updateItems(newItem);
                    displayCurrentRoom(
                        currentRoom.name,
                        currentRoom.description,
                        actions
                    );
                    break;
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
