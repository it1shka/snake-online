package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

var rooms = NewSafeMap[string, *Room]()

func SetupAPIServer(router *gin.RouterGroup) {
	roomGroup := router.Group("/room")
	roomGroup.GET("/create", createRoomHandler)
	// roomGroup.GET("/:id/info", getRoomInfo)
	roomGroup.GET("/:id/connect", roomGuard(), roomConnectHandler)
}

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

		if room.CurrentPlayers+1 > room.MaxPlayers {
			ctx.String(http.StatusForbidden, "room is full")
			ctx.Abort()
			return
		}

		room.RUnlock()

		ctx.Set("room", room)
		ctx.Next()
	}
}
