package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/xid"
)

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
	playersSM := room.Players

	// UPDATE THE ROOM -- MAIN LOGIC GOES HERE
	playersSM.RLock()
	defer playersSM.RUnlock()

	// sending current players state
	for conn := range playersSM.Map {
		players := MapValues(playersSM.Map)
		active := FilterFn(players, func(p *Player) bool {
			return p.Alive
		})
		containers := MapFn(active, func(p *Player) PlayerContainer {
			return PreparePlayerContainer(p, conn)
		})
		conn.WriteJSON(containers)
	}

	// updating room

}
