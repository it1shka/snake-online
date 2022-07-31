package api

import (
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Direction int

const (
	UP Direction = iota
	RIGHT
	DOWN
	LEFT
)

type Position [2]int

type Player struct {
	sync.RWMutex
	Conn      *websocket.Conn
	Name      string
	Direction Direction
	Body      []Position
	Alive     bool
}

func NewPlayer(conn *websocket.Conn, name string) *Player {
	player := Player{
		Conn:  conn,
		Name:  name,
		Alive: false,
	}
	return &player
}

type Room struct {
	sync.RWMutex
	Id                         string
	MaxPlayers, CurrentPlayers int
	LastActivityTime           time.Time
	Players                    *SafeMap[*websocket.Conn, *Player]
}

func NewRoom(id string, maxplayers int) *Room {
	room := Room{
		Id:               id,
		MaxPlayers:       maxplayers,
		CurrentPlayers:   0,
		LastActivityTime: time.Now(),
		Players:          NewSafeMap[*websocket.Conn, *Player](),
	}
	return &room
}
