import { getRandomName } from "./utils.js";
import API from "./api.js";
function findById(id) {
    const element = document.getElementById(id);
    return element;
}
function activatePlayerNameInput() {
    const nameInput = findById('player-name-input');
    function assignNameIfEmpty() {
        if (!nameInput.value) {
            nameInput.value = getRandomName();
        }
    }
    assignNameIfEmpty();
    nameInput.addEventListener('focusout', () => {
        nameInput.value = nameInput.value.trim();
        if (nameInput.value.length > 18) {
            nameInput.value = nameInput.value.slice(0, 18);
        }
        assignNameIfEmpty();
    });
}
function activateConnectRoomForm() {
    const connectRoomForm = findById('connect-room-form');
    function connectRoomHandler(event) {
        event.preventDefault();
        // DO SOMETHING HERE !!!
    }
    connectRoomForm.addEventListener('submit', connectRoomHandler);
}
function activateCreateRoomForm() {
    const createRoomForm = findById('create-room-form');
    function createRoomHandler(event) {
        event.preventDefault();
        const maxPlayers = Number(this.querySelector('input').value);
        API.createRoom(maxPlayers).then(roomId => {
            alert(roomId);
        });
    }
    createRoomForm.addEventListener('submit', createRoomHandler);
}
