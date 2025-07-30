import React, { useRef, useEffect, useState } from 'react';

const MapboxMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-74.0060);
  const [lat, setLat] = useState(40.7128);
  const [zoom, setZoom] = useState(16);

  useEffect(() => {
    // Check if map is already initialized
    if (map.current) return;

    // Get the Mapbox access token from environment variables
    const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

    if (!mapboxToken) {
      console.error('Mapbox access token not found. Please set REACT_APP_MAPBOX_ACCESS_TOKEN in your environment variables.');
      return;
    }

    // Load Mapbox GL JS
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Initialize the map
      window.mapboxgl.accessToken = mapboxToken;

      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom
      });

      // Add navigation control (zoom buttons)
      map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');

      // Update state on map move
      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });

      map.current.on('load', () => {
        console.log('hello');

        // ADD THE SOURCE FIRST
        if (!map.current.getSource('car')) {
            map.current.addSource('car', {
              'type': 'geojson',
              'data': {
                'type': 'Point',
                'coordinates': [-74.0060, 40.7128]
              }
            });
        }

        // THEN ADD THE LAYER
        map.current.addLayer({
          'id': 'car',
          'type': 'circle',
          'source': 'car',
          'paint': {
            'circle-radius': 10,
            'circle-color': '#ff0000'
          }
        });

        // ADD THIS ANIMATION CODE - STORE THE INTERVAL
        let step = 0;
        const animationInterval = setInterval(() => {
          if (!map.current || !map.current.getSource('car')) {
            clearInterval(animationInterval);
            return;
          }

          const newLng = -74.0060 + (step * 0.00005);
          const newLat = 40.7128 + (step * 0.00003);

          map.current.getSource('car').setData({
            'type': 'Point',
            'coordinates': [newLng, newLat]
          });

          step++;
          if (step > 100) step = 0; // Reset after 100 steps
        }, 100);
      });
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []); // Empty dependency array - only run once

return (
  <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        zIndex: 20,
        borderBottom: '1px solid #e5e7eb'
      }}>

      {/* Mobile Layout */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px',
        gap: '12px'
      }}>

        {/* Top Row - Logo and Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>LM</span>
            </div>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#111827',
                margin: 0,
                lineHeight: '1.2'
              }}>Last Mile Labs</h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '1px'
              }}>
                <div style={{
                  width: '4px',
                  height: '4px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span>Live Delivery Tracking</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: '#f0fdf4',
            borderRadius: '20px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ color: '#047857', fontWeight: '500', fontSize: '12px' }}>Active</span>
          </div>
        </div>

        {/* Bottom Row - Speed and Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: '#f9fafb',
            borderRadius: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>Speed:</span>
            <span style={{
              fontFamily: 'monospace',
              color: '#111827',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>12 mph</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{
              padding: '8px 12px',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#d1d5db';
            }}>
              Settings
            </button>
            <button style={{
              padding: '8px 12px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}>
              Reports
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
    {/* Map Container */}
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ minHeight: '800px' }}
    />

    {/* Instructions */}
    {!process.env.REACT_APP_MAPBOX_ACCESS_TOKEN && (
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
          <h3 className="text-lg font-semibold mb-2 text-red-600">
            Mapbox Token Required
          </h3>
          <p className="text-gray-700 text-sm">
            Please set your <code className="bg-gray-200 px-1 rounded">REACT_APP_MAPBOX_ACCESS_TOKEN</code>
            environment variable with your Mapbox access token.
          </p>
        </div>
      </div>
    )}
  </div>
);
};

export default MapboxMap;