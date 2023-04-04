var rooms;
var currentRoom;
var player;
var actions;

axios.defaults.baseURL = "http://localhost:8000";

const typeWriter = (text, className, i = 0) => {
    return new Promise((resolve) => {
        const element = document.querySelector(`.${className}`);
        if (i == 0) {
            element.innerHTML = "";
        }
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            // Speed = 20ms per word
            setTimeout(() => {
                typeWriter(text, className, i).then(resolve);
            }, 20);
        } else {
            resolve();
        }
    });
};

const runTypewriters = async (roomName, description, actions) => {
    await typeWriter(roomName, "current-room");
    await typeWriter(description, "description");
    for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        let div = document.createElement("div");
        div.classList.add(`action${i}`);
        parent = document.querySelector(`.actions`);
        parent.append(div);
        await typeWriter(`${i + 1}. ${action.description}`, `action${i}`);
    }
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
            runTypewriters(currentRoom.name, currentRoom.description, actions);
        })
        .catch((error) => {
            console.error(error);
        });
});

// Call the API when input is submitted
document.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();

    // Get the value of the input field
    const inputField = document.querySelector("#inputField");
    const inputValue = inputField.value;
    const action = actions[inputValue - 1];

    // Clear old text
    let elCurRoom = document.querySelector(`.current-room`);
    let elDescription = document.querySelector(`.description`);
    let elActions = document.querySelector(`.actions`);

    elCurRoom.innerHTML = "";
    elDescription.innerHTML = "";
    elActions.innerHTML = "";

    // Call the API with the input value
    axios
        .post("/action", { action: action })
        .then((response) => {
            // Server sending back a room object representing the new room
            currentRoom = response.data;
            actions = currentRoom.actions;

            // Write new text to browser
            runTypewriters(currentRoom.name, currentRoom.description, actions);
        })
        .catch((error) => {
            // Handle any errors that occur during the API request
            console.error(error);
        });
    // Clear the input field
    inputField.value = "";
});
