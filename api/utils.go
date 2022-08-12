package api

import (
	"math/rand"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// SafeMap provides thread safety over multiple cores
type SafeMap[K comparable, V any] struct {
	sync.RWMutex
	Map map[K]V
}

func NewSafeMap[K comparable, V any]() *SafeMap[K, V] {
	return &SafeMap[K, V]{
		Map: make(map[K]V),
	}
}

func (sm *SafeMap[K, V]) Get(key K) V {
	sm.RLock()
	defer sm.RUnlock()
	return sm.Map[key]
}

func (sm *SafeMap[K, V]) Set(key K, value V) {
	sm.Lock()
	defer sm.Unlock()
	sm.Map[key] = value
}

func (sm *SafeMap[K, V]) Delete(key K) {
	sm.Lock()
	defer sm.Unlock()
	delete(sm.Map, key)
}

// copy of JavaScript API named setInterval
func setInterval(duration time.Duration, fn func(quit chan struct{})) {
	ticker := time.NewTicker(duration)
	quit := make(chan struct{})

	go func() {
		for {
			select {
			case <-ticker.C:
				fn(quit)
			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()

}

// Functional programming primitive map.
// input []A => MapFn(input, func(A)B) => output []B
func MapFn[A, B any](array []A, fn func(A) B) []B {
	output := make([]B, len(array))
	for idx, each := range array {
		output[idx] = fn(each)
	}
	return output
}

// Functional programming primitive filter.
// input []A => Filter(input, func(A)bool) => output []A
func FilterFn[A any](array []A, fn func(A) bool) []A {
	output := []A{}
	for _, value := range array {
		if fn(value) {
			output = append(output, value)
		}
	}
	return output
}

// Prepares player struct to be sent to client.
func PreparePlayerContainer(player *Player, self *websocket.Conn) PlayerContainer {
	player.RLock()
	container := PlayerContainer{
		Name:      player.Name,
		Self:      player.Conn == self,
		Direction: player.Direction,
		Body:      player.Body,
		Invisible: player.Invisible,
	}
	player.RUnlock()
	return container
}

func MapValues[K comparable, V any](mapp map[K]V) []V {
	values := make([]V, len(mapp))
	index := 0
	for _, value := range mapp {
		values[index] = value
		index++
	}
	return values
}

func GenerateFood() Position {
	row := rand.Intn(BOARD_SIZE)
	col := rand.Intn(BOARD_SIZE)
	return Position{row, col}
}

func posValid(pos Position) bool {
	row, col := pos[0], pos[1]
	return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

func last[T any](array []T) T {
	return array[len(array)-1]
}

func nextPosition(head Position, dir Direction) Position {
	row, col := head[0], head[1]
	switch dir {
	case UP:
		col--
	case RIGHT:
		row++
	case DOWN:
		col++
	case LEFT:
		row--
	}
	return Position{row, col}
}
