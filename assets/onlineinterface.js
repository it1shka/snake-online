import { getRandomName } from "./utils.js";
export function queryElement(query) {
    const element = document.querySelector(query);
    if (element === null) {
        throw new Error(`Tried to query element: "${query}. Not found"`);
    }
    return element;
}
class StartGamePanelInterface {
    constructor(props) {
        this.props = props;
        this.root = queryElement('.start-game-panel-wrapper');
        this.playerNameInput = queryElement('#player-name-input');
        this.connectInput = queryElement('#connect-input');
        this.createInput = queryElement('#create-input');
        this.connectRoomForm = queryElement('#connect-room-form');
        this.createRoomForm = queryElement('#create-room-form');
        this.activatePlayerNameInput();
        this.activateConnectRoomForm();
        this.activateCreateRoomForm();
        queryElement('#quit-online').addEventListener('click', () => {
            this.togglePanelVisibility();
        });
    }
    activatePlayerNameInput() {
        const handler = () => {
            if (!this.playerNameInput.value) {
                this.playerNameInput.value = getRandomName();
            }
        };
        handler();
        this.playerNameInput.addEventListener('focusout', handler);
    }
    activateConnectRoomForm() {
        this.connectRoomForm.addEventListener('submit', event => {
            event.preventDefault();
            const name = this.playerNameInput.value;
            const roomId = this.connectInput.value;
            if (this.props.onconnectroom) {
                this.props.onconnectroom(roomId, name);
            }
        });
    }
    activateCreateRoomForm() {
        this.createRoomForm.addEventListener('submit', event => {
            event.preventDefault();
            const maxPlayers = Number(this.createInput.value);
            if (this.props.oncreateroom) {
                this.props.oncreateroom(maxPlayers);
            }
        });
    }
    setConnectInput(value) {
        this.connectInput.value = value;
    }
    togglePanelVisibility() {
        this.root.classList.toggle('invisible');
    }
}
export default StartGamePanelInterface;
