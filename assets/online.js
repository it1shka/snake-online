import API from "./api.js";
import StartGamePanelInterface from "./onlineinterface.js";
import playOnline from "./onlinesnake.js";
const CONNECTION_FAILED_MESSAGE = `Failed to connect:
  room is either full
  or does not exist.`;
const startInterface = new StartGamePanelInterface({
    onconnectroom: (roomId, name) => {
        API.connectToRoom(roomId, name)
            .then(socket => {
            console.log('Successfully connected!');
            startInterface.togglePanelVisibility();
            playOnline(socket);
        })
            .catch(() => {
            alert(CONNECTION_FAILED_MESSAGE);
        });
    },
    oncreateroom: (maxPlayers) => {
        API.createRoom(maxPlayers).then(id => {
            startInterface.setConnectInput(id);
        });
    }
});
