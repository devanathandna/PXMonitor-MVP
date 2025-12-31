import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

interface ConnectionData {
  ip: string;
  hostname: string;
  country: string;
  status?: string;
  lat: number;
  lng: number;
  processName?: string;
  port?: number;
}

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
  connection: ConnectionData;
}

interface PointData {
  lat: number;
  lng: number;
  size: number;
  color: string;
  label: string;
  connection: ConnectionData | null;
}

interface GlobeProps {
  connections: ConnectionData[];
  deviceIP?: string;
  deviceLat?: number;
  deviceLng?: number;
  height?: number;
}

const GlobeVisualization: React.FC<GlobeProps> = ({ 
  connections, 
  deviceIP,
  deviceLat = 0,
  deviceLng = 0,
  height = 600 
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeEl = useRef<any>();
  const [arcsData, setArcsData] = useState<ArcData[]>([]);
  const [pointsData, setPointsData] = useState<PointData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get color based on process type
  const getConnectionColor = (processName?: string) => {
    if (!processName) return '#3388ff';
    
    const name = processName.toLowerCase();
    if (name.includes('zoom') || name.includes('teams') || name.includes('meet')) return '#2d8cff';
    if (name.includes('chrome') || name.includes('firefox') || name.includes('edge')) return '#ff6b35';
    if (name.includes('discord') || name.includes('slack')) return '#7289da';
    if (name.includes('spotify') || name.includes('music')) return '#1db954';
    if (name.includes('steam') || name.includes('game')) return '#171a21';
    return '#6c757d';
  };

  useEffect(() => {
    console.log('Globe - Connections:', connections.length);
    console.log('Globe - Device Location:', { deviceLat, deviceLng });
    
    // Prepare arcs data (connections from device to remote locations)
    const arcs = connections.map((conn, idx) => ({
      startLat: deviceLat,
      startLng: deviceLng,
      endLat: conn.lat,
      endLng: conn.lng,
      color: getConnectionColor(conn.processName),
      label: `${conn.processName || 'Unknown'} → ${conn.country}`,
      connection: conn,
    }));

    // Prepare points data (destination points)
    const points = connections.map((conn, idx) => ({
      lat: conn.lat,
      lng: conn.lng,
      size: 0.3,
      color: getConnectionColor(conn.processName),
      label: conn.processName || 'Unknown',
      connection: conn,
    }));

    // Add device location point
    if (deviceLat !== 0 || deviceLng !== 0) {
      points.unshift({
        lat: deviceLat,
        lng: deviceLng,
        size: 0.5,
        color: '#ff0000',
        label: 'Your Device',
        connection: null,
      });
    }

    setArcsData(arcs);
    setPointsData(points);

    // Auto-rotate globe
    if (globeEl.current) {
      try {
        globeEl.current.controls().autoRotate = true;
        globeEl.current.controls().autoRotateSpeed = 0.5;
        
        // Point camera at device location
        if (deviceLat !== 0 || deviceLng !== 0) {
          globeEl.current.pointOfView({ lat: deviceLat, lng: deviceLng, altitude: 2 }, 1000);
        }
      } catch (err) {
        console.error("Error setting up globe controls:", err);
        setError("Failed to initialize globe controls");
      }
    }
  }, [connections, deviceLat, deviceLng]);

  if (error) {
    return (
      <div className="w-full border rounded-lg overflow-hidden shadow-lg bg-gray-900 p-8">
        <div className="text-center text-red-400">
          <p className="font-semibold">Failed to load globe visualization</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="w-full border rounded-lg overflow-hidden shadow-lg bg-gray-900 p-8">
        <div className="text-center text-gray-400">
          <p className="font-semibold">No public connections to display</p>
          <p className="text-sm mt-2">All your current connections are to private/local IP addresses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border rounded-lg overflow-hidden shadow-lg bg-gray-900">
      <div style={{ width: '100%', height: `${height}px`, position: 'relative', isolation: 'isolate' }}>
        <Globe
          ref={globeEl}
          width={undefined}
          height={height}
          backgroundColor="rgba(10,10,20,1)"
        
        // Globe appearance
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        // Arcs (connection lines)
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={3000}
        arcStroke={0.5}
        arcAltitude={0.3}
        arcLabel={(d: ArcData) => d.label}
        
        // Points (locations)
        pointsData={pointsData}
        pointColor="color"
        pointAltitude={0.01}
        pointRadius="size"
        pointLabel={(d: PointData) => {
          const conn = d.connection;
          if (!conn) return d.label;
          
          return `
            <div style="
              background: rgba(0, 0, 0, 0.9);
              padding: 12px 16px;
              border-radius: 8px;
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              max-width: 250px;
            ">
              <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #60a5fa;">
                ${conn.processName || 'Unknown Process'}
              </h4>
              <div style="font-size: 12px; line-height: 1.6; color: #d1d5db;">
                <p style="margin: 2px 0;"><strong>IP:</strong> ${conn.ip}</p>
                ${conn.hostname !== 'N/A' ? `<p style="margin: 2px 0;"><strong>Host:</strong> ${conn.hostname}</p>` : ''}
                <p style="margin: 2px 0;"><strong>Country:</strong> ${conn.country}</p>
                ${conn.port ? `<p style="margin: 2px 0;"><strong>Port:</strong> ${conn.port}</p>` : ''}
              </div>
            </div>
          `;
        }}
        
        // Atmosphere
        atmosphereColor="#3a416f"
        atmosphereAltitude={0.15}
        
        // Enable user interaction
        enablePointerInteraction={true}
      />
      </div>
      
      {/* Legend */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 text-xs text-gray-300">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm"></div>
            <span>Your Device</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm"></div>
            <span>Video Conf</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow-sm"></div>
            <span>Browser</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 border border-white shadow-sm"></div>
            <span>Communication</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm"></div>
            <span>Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500 border border-white shadow-sm"></div>
            <span>Other</span>
          </div>
        </div>
        {deviceIP && (
          <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400">
            Your Public IP: <span className="font-mono text-blue-400">{deviceIP}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobeVisualization;
