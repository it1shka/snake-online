package api

import (
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

	room.Unlock()

	defer func() {
		room.Lock()
		defer room.Unlock()

		room.Players.Delete(conn)
		room.CurrentPlayers--

		if room.CurrentPlayers <= 0 {
			rooms.Delete(room.Id)
		}
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

		// store the direction of a user
		println(message)
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
	ctx.String(http.StatusCreated, roomId)
}

func roomUpdateLoop(roomId string) {
	ticker := time.NewTicker(time.Second / 5)
	quit := make(chan struct{})
	go func() {
		for {
			select {
			case <-ticker.C:
				maybeRoom := rooms.Get(roomId)
				if maybeRoom == nil {
					close(quit)
				}
				updateRoom(maybeRoom)
			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()
}

func updateRoom(room *Room) {
	room.Lock()
	defer room.Unlock()

	// update the room
}
