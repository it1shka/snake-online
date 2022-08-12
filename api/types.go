package api

import (
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Direction byte

const (
	UP Direction = iota
	RIGHT
	DOWN
	LEFT
)

type Position [2]int

type Player struct {
	sync.RWMutex
	Conn             *websocket.Conn
	Name             string
	Direction        Direction
	Body             []Position
	Alive, Invisible bool
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

	ShouldUpdateFood bool
	Food             Position
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

// to send in json to client
type PlayerContainer struct {
	Name      string     `json:"name"`
	Self      bool       `json:"self"`
	Direction Direction  `json:"direction"`
	Body      []Position `json:"body"`
	Invisible bool       `json:"invisible"`
}

type RoomContainer struct {
	Food   Position          `json:"food"`
	Snakes []PlayerContainer `json:"snakes"`
}
