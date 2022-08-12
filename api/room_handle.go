package api

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
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

	if room.ShouldUpdateFood {
		room.Food = GenerateFood()
		room.ShouldUpdateFood = false
	}

	playersSM := room.Players

	playersSM.RLock()
	defer playersSM.RUnlock()

	broadcastRoomToPlayers(playersSM.Map, room)
	updatePlayers(playersSM.Map, room)
}

// sending room state to all players in room
func broadcastRoomToPlayers(Map map[*websocket.Conn]*Player, room *Room) {
	for conn := range Map {
		players := MapValues(Map)
		active := FilterFn(players, func(p *Player) bool {
			return p.Alive
		})
		containers := MapFn(active, func(p *Player) PlayerContainer {
			return PreparePlayerContainer(p, conn)
		})
		json := RoomContainer{
			Food:   room.Food,
			Snakes: containers,
		}
		conn.WriteJSON(json)
	}
}

// updating players
func updatePlayers(Map map[*websocket.Conn]*Player, room *Room) {

	// moving
	var collisions [BOARD_SIZE][BOARD_SIZE]int
	for _, player := range Map {
		if !player.Alive {
			continue
		}
		player.Lock()

		head := last(player.Body)
		next := nextPosition(head, player.Direction)
		if next == room.Food {
			player.Body = append(player.Body, next)
			room.ShouldUpdateFood = true
		} else {
			player.Body = append(player.Body[1:], next)
		}

		for _, pos := range player.Body {
			if !posValid(pos) {
				continue
			}
			row, col := pos[0], pos[1]
			collisions[row][col]++
		}

		player.Unlock()
	}

	// checking for collisions
	for _, player := range Map {
		if !player.Alive {
			continue
		}

		player.Lock()
		head := player.Body[len(player.Body)-1]
		if !posValid(head) {
			player.Alive = false
		} else if !player.Invisible && collisions[head[0]][head[1]] > 1 {
			player.Alive = false
		}
		player.Unlock()
	}

}
