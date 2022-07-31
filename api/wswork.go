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

	room.Lock()

	playerName := ctx.DefaultQuery("name", "unknown")
	player := NewPlayer(conn, playerName)
	room.Players.Set(conn, player)
	room.CurrentPlayers++
	room.LastActivityTime = time.Now()

	room.Unlock()

	defer func() {
		room.Lock()

		room.Players.Delete(conn)
		room.CurrentPlayers--
		room.LastActivityTime = time.Now()
		if room.CurrentPlayers == 0 {
			disposeRoomIfEmpty(room.Id)
		}

		room.Unlock()

		conn.Close()
	}()

	// loop until exit in order to get player messages
	handlePlayer(player)
}

func handlePlayer(player *Player) {
	fmt.Printf("Player %s connected!\n", player.Name)

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
	roomUpdateLoop(roomId)
	disposeRoomIfEmpty(roomId)

	ctx.String(http.StatusCreated, roomId)
}

const DISPOSAL_TIME = time.Minute * 5

func disposeRoomIfEmpty(roomId string) {
	time.AfterFunc(DISPOSAL_TIME, func() {
		room := rooms.Get(roomId)
		room.RLock()
		defer room.RUnlock()

		elapsed := time.Since(room.LastActivityTime)
		if elapsed < DISPOSAL_TIME {
			return
		}

		rooms.Delete(roomId)
		fmt.Printf("Room %s is disposed\n", roomId)
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
