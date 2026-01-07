package main

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Upgrader turns an HTTP connection into a WebSocket connection
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var (
	clients = make(map[*websocket.Conn]bool)
	mu      sync.Mutex
)

// HandleConnections manages new incoming WebSocket requests
func HandleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Upgrade error:", err)
		return
	}
	
	mu.Lock()
	clients[conn] = true
	mu.Unlock()
	fmt.Println("New Browser Connected 🌐")
}

// Broadcast sends the ping result to every open browser tab
func Broadcast(data []byte) {
	mu.Lock()
	defer mu.Unlock()
	for client := range clients {
		err := client.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			fmt.Println("Client disconnected")
			client.Close()
			delete(clients, client)
		}
	}
}