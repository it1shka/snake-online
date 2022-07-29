package main

import (
	"github.com/gin-gonic/gin"
	"it1shka.com/snake-online/api"
)

func serveFile(router *gin.RouterGroup, route, local string) {
	router.GET(route, func(ctx *gin.Context) {
		ctx.File(local)
	})
}

func setupFrontend(router *gin.RouterGroup) {
	serveFile(router, "/", "./html/index.html")
	serveFile(router, "/online", "./html/online.html")
	serveFile(router, "/offline", "./html/offline.html")
}

func main() {
	router := gin.Default()

	frontendGroup := router.Group("/")
	setupFrontend(frontendGroup)

	router.Static("/assets", "./assets")

	apiGroup := router.Group("/api")
	api.SetupAPIServer(apiGroup)

	router.Run(":3000")
}
