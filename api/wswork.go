package api

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/rs/xid"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func roomConnectHandler(ctx *gin.Context) {
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		ctx.String(http.StatusBadRequest, "failed to connect")
		return
	}

	room := ctx.MustGet("room").(*Room)

	// locking room to connect a player
	room.Lock()

	playerName := ctx.DefaultQuery("name", "unknown")
	player := NewPlayer(conn, playerName)
	room.Players.Set(conn, player)
	room.CurrentPlayers++

	room.Unlock()

	defer func() {
		// locking room to cleanup a player
		room.Lock()

		room.Players.Delete(conn)
		room.CurrentPlayers--

		room.Unlock()

		conn.Close()
	}()

	// loop until exit in order to get player messages
	handlePlayer(player)
}

func handlePlayer(player *Player) {
	for {
		mt, message, err := player.Conn.ReadMessage()
		if err != nil || mt == websocket.CloseMessage {
			break
		}

		// RESPONCE TO A MESSAGE GOES HERE
		fmt.Printf("Got message from player %s: %s\n", player.Name, message)
	}
}

func createRoomHandler(ctx *gin.Context) {
	roomId := xid.New().String()
	maxPlayersQuery := ctx.Query("maxplayers")
	maxPlayers, err := strconv.Atoi(maxPlayersQuery)
	if err != nil {
		maxPlayers = 10
	}
	room := NewRoom(roomId, maxPlayers)
	rooms.Set(roomId, room)
	roomCleanupLoop(roomId)
	roomUpdateLoop(roomId)
	ctx.String(http.StatusCreated, roomId)
}

func roomCleanupLoop(roomId string) {
	setInterval(time.Minute*5, func(quit chan struct{}) {
		room := rooms.Get(roomId)
		room.RLock()
		defer room.RUnlock()

		if room.CurrentPlayers == 0 {
			rooms.Delete(roomId)
			close(quit)
			// fmt.Printf("Room %s disposed\n", roomId)
		}
	})
}

func roomUpdateLoop(roomId string) {
	setInterval(time.Second/5, func(quit chan struct{}) {
		maybeRoom := rooms.Get(roomId)
		if maybeRoom == nil {
			close(quit)
			return
		}
		updateRoom(maybeRoom)
	})
}

func updateRoom(room *Room) {
	room.Lock()
	defer room.Unlock()

	// UPDATE THE ROOM -- MAIN LOGIC GOES HERE
	fmt.Printf("Room %s is updated!\n", room.Id)
}
