package main

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"time"
)

type Target struct {
	Name string  `json:"name"`
	IP   string  `json:"ip"`
	Lat  float64 `json:"lat"`
	Lng  float64 `json:"lng"`
}

type PingResult struct {
	Name    string `json:"name"`
	Latency int64  `json:"latency"`
	Lat     float64 `json:"lat"`
	Lng     float64 `json:"lng"`
}

func main() {
	// 1. Load targets
	file, _ := os.ReadFile("targets.json")
	var targets []Target
	json.Unmarshal(file, &targets)

	// 2. Set up the route for the frontend to connect to
	http.HandleFunc("/ws", HandleConnections)

	// 3. Start the Background Prober
	go func() {
		for {
			for _, target := range targets {
				go func(t Target) {
					// List of ports to try in order of "likelihood of being open"
					ports := []string{"443", "80", "53", "22"}
					var conn net.Conn
					var err error
					var latency int64 = -1

					start := time.Now()

					for _, port := range ports {
						// We reduce timeout to 800ms to cycle through ports faster
						conn, err = net.DialTimeout("tcp", net.JoinHostPort(t.IP, port), 800*time.Millisecond)
						if err == nil {
							latency = time.Since(start).Milliseconds()
							conn.Close()
							break // We found an open door!
						}
					}

					// Broadcast whatever we found
					result, _ := json.Marshal(PingResult{
						Name: t.Name, Latency: latency, Lat: t.Lat, Lng: t.Lng,
					})
					Broadcast(result)
				}(target)
			}
			time.Sleep(3 * time.Second)
		}
	}()

	fmt.Println("Pulse Engine running on http://localhost:8080")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Fallback for local dev
	}
	fmt.Printf("Pulse Engine running on port %s\n", port)
	http.ListenAndServe(":"+port, nil)
}