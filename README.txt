BLUEPRINT:

Real-Time Network Latency Visualizer

How it should work:
1. Engine (Go)
- Uses High-concurrency Goroutines to simultaneously ping a curated list of 
  global infrastructure nodes. Includes DNS servers, university hubs and data centers

2. Stream (Websockets)
- Real time latency data is broadcasted from the Go backend to the frontend.

3. Visualizer (Three.js)
- Data would then be mapped to geographical coordinates on a 3D globe
- Latency is repped by pulse frequency and color shifts

Features:
- Can handle simultaneous pings every few seconds without blocking the main thread
- Converts IP-based latency into visual arcs and pulses on a spherical coordinate system
- Meant to minimize lag when sending data to the browser