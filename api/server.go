package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const BOARD_SIZE = 20

var rooms = NewSafeMap[string, *Room]()

func SetupAPIServer(router *gin.RouterGroup) {
	roomGroup := router.Group("/room")
	roomGroup.GET("/create", createRoomHandler)
	// roomGroup.GET("/:id/info", getRoomInfo)
	roomGroup.GET("/:id/connect", roomGuard(), roomConnectHandler)
}

// middleware applied to /:id/connect in order to check:
// 1) if the room doesnt exist -- StatusNotFound;
// 2) if the room is full -- StatsForbidden;
// otherwise places room inside *gin.Context
func roomGuard() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		roomId := ctx.Param("id")
		room := rooms.Get(roomId)

		if room == nil {
			ctx.String(http.StatusNotFound, "room not found")
			ctx.Abort()
			return
		}

		room.RLock()

		current, max := room.CurrentPlayers, room.MaxPlayers

		room.RUnlock()

		if current+1 > max {
			ctx.String(http.StatusForbidden, "room is full")
			ctx.Abort()
			return
		}

		ctx.Set("room", room)
		ctx.Next()
	}
}
