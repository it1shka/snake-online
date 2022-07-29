package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupAPIServer(router *gin.RouterGroup) {
	router.GET("/", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "Hello from API!")
	})
}
