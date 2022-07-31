package api

import "time"

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
