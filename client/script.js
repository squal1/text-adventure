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
            // Speed = 35ms per word
            setTimeout(() => {
                typeWriter(text, className, i).then(resolve);
            }, 35);
        } else {
            resolve();
        }
    });
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

            typeWriter(currentRoom.name, "current-room").then(() => {
                typeWriter(currentRoom.description, "description").then(() => {
                    actions.forEach((action, index) => {
                        let div = document.createElement("div");
                        div.classList.add(`action${index}`);
                        parent = document.querySelector(`.actions`);
                        parent.append(div);
                        typeWriter(
                            `${index + 1}. ${action.description}`,
                            `action${index}`
                        );
                    });
                });
            });
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
    let elCurRoom = document.querySelector(`.current-room`);
    let elDescription = document.querySelector(`.description`);
    let elActions = document.querySelector(`.actions`);

    // Call the API with the input value
    axios
        .post("/action", { action: action })
        .then((response) => {
            elCurRoom.innerHTML = "";
            elDescription.innerHTML = "";
            elActions.innerHTML = "";

            // Server sending back a room object representing the new room
            currentRoom = response.data;
            actions = currentRoom.actions;

            typeWriter(currentRoom.name, "current-room").then(() => {
                typeWriter(currentRoom.description, "description").then(() => {
                    actions.forEach((action, index) => {
                        let div = document.createElement("div");
                        div.classList.add(`action${index}`);
                        parent = document.querySelector(`.actions`);
                        parent.append(div);
                        typeWriter(
                            `${index + 1}. ${action.description}`,
                            `action${index}`
                        );
                    });
                });
            });
        })
        .catch((error) => {
            // Handle any errors that occur during the API request
            console.error(error);
        });
    // Clear the input field
    inputField.value = "";
});
