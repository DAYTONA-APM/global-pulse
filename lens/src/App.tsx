import { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';

// Define the shape of the data coming from Go
interface PingData {
  name: string;
  latency: number;
  lat: number;
  lng: number;
}

// Set your "Home" coordinates (e.g., South Africa)
const HOME_COORDS = { lat: -25.7479, lng: 28.2293 };

function App() {
  const [points, setPoints] = useState<any[]>([]);
  const [arcs, setArcs] = useState<any[]>([]);
  const globeEl = useRef<any>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080/ws');

    socket.onmessage = (event) => {
    const data: PingData = JSON.parse(event.data);
    
    // 1. Determine Status Colors
    let statusColor = '#444444'; // Default Gray (Offline)
    if (data.latency !== -1) {
      statusColor = data.latency < 150 ? '#00f2ff' : '#ff3300';
    }

    // 2. Update Points (Always show them)
    setPoints(prev => {
      const filtered = prev.filter(p => p.name !== data.name);
      return [...filtered, {
        ...data,
        size: data.latency === -1 ? 0.1 : Math.max(0.2, data.latency / 400),
        color: statusColor,
        label: data.latency === -1 ? `${data.name}: BLOCKED/OFFLINE` : `${data.name}: ${data.latency}ms`
      }];
    });

    // 3. Update Arcs (Only show arcs for active connections to keep the globe clean)
    setArcs(prev => {
      const filtered = prev.filter(a => a.target !== data.name);
      if (data.latency === -1) return filtered; // No line if it's down
      
      return [...filtered, {
        target: data.name,
        startLat: HOME_COORDS.lat,
        startLng: HOME_COORDS.lng,
        endLat: data.lat,
        endLng: data.lng,
        color: statusColor
      }];
    });
  };

    return () => socket.close();
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', margin: 0, overflow: 'hidden' }}>
      {/* HEADER SECTION */}
      <div style={{ 
        position: 'absolute', zIndex: 10, top: 20, left: 20, 
        color: '#00f2ff', fontFamily: 'monospace', pointerEvents: 'none' 
      }}>
        <h1 style={{ margin: 0, letterSpacing: '2px' }}>GLOBAL PULSE LIVE</h1>
        <p style={{ color: '#fff', opacity: 0.7 }}>Real-time Network Latency Visualizer</p>
      </div>

      {/* STEP 4: ACTIVE NODES DASHBOARD */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '20px',
        width: '280px',
        maxHeight: '350px',
        overflowY: 'auto',
        backgroundColor: 'rgba(0, 10, 20, 0.85)', // Darker, techy transparent blue
        color: '#00f2ff',
        padding: '15px',
        fontFamily: 'monospace',
        fontSize: '11px',
        border: '1px solid #00f2ff',
        borderRadius: '4px',
        zIndex: 100,
        boxShadow: '0 0 15px rgba(0, 242, 255, 0.2)',
        scrollbarWidth: 'thin'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          borderBottom: '1px solid #00f2ff', 
          paddingBottom: '5px', 
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          <span>LOCATION</span>
          <span>LATENCY</span>
        </div>
        
        {/* Sort points so the fastest connections are at the top */}
        {[...points].sort((a, b) => b.latency - a.latency).map((p) => (
          <div key={p.name} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '6px',
            borderLeft: `3px solid ${p.color}`,
            paddingLeft: '5px'
          }}>
            <span style={{ color: p.latency === -1 ? '#666' : '#fff' }}>
                {p.name.toUpperCase()}
            </span>
            <span style={{ color: p.color }}>
              {p.latency === -1 ? 'OFFLINE' : `${p.latency}ms`}
            </span>
          </div>
        ))}

        {points.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.5 }}>WAITING FOR DATA...</div>
        )}
      </div>

      {/* THE GLOBE */}
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        pointsData={points}
        pointColor="color"
        pointRadius="size"
        pointAltitude={0.02}
        pointLabel="label"

        arcsData={arcs}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={2}
        arcDashAnimateTime={1500}
        arcStroke={0.3}
      />
    </div>
  );
}

export default App;