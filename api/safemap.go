package api

import "sync"

type SafeMap[K comparable, V any] struct {
	sync.RWMutex
	m map[K]V
}

func NewSafeMap[K comparable, V any]() *SafeMap[K, V] {
	return &SafeMap[K, V]{
		m: make(map[K]V),
	}
}

func (sm *SafeMap[K, V]) Get(key K) V {
	sm.RLock()
	defer sm.RUnlock()
	return sm.m[key]
}

func (sm *SafeMap[K, V]) Set(key K, value V) {
	sm.Lock()
	defer sm.Unlock()
	sm.m[key] = value
}

func (sm *SafeMap[K, V]) Delete(key K) {
	sm.Lock()
	defer sm.Unlock()
	delete(sm.m, key)
}
