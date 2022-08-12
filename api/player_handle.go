package api

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
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

	handlePlayer(player)
}

func handlePlayer(player *Player) {
	for {
		mt, message, err := player.Conn.ReadMessage()
		if err != nil || mt == websocket.CloseMessage {
			break
		}
		handleMessage(player, mt, message)
	}
}

const INVISIBILITY_TIME = time.Second * 3

func handleMessage(player *Player, messageType int, message []byte) {
	player.Lock()
	defer player.Unlock()

	if !player.Alive || player.Body == nil {
		head := Position{BOARD_SIZE / 2, BOARD_SIZE / 2}
		player.Body = []Position{head}
		player.Invisible = true
		player.Alive = true

		time.AfterFunc(INVISIBILITY_TIME, func() {
			player.Lock()
			player.Invisible = false
			player.Unlock()
		})
	}

	direction := Direction(message[0])
	player.Direction = direction
}
