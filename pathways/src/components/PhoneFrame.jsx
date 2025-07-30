import React, { useRef, useEffect, useState } from 'react';

const MapboxMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-73.9725); // Adjusted initial center to be near the new path
  const [lat, setLat] = useState(40.755);   // Adjusted initial latitude to move map content down
  const [zoom, setZoom] = useState(17);    // Increased zoom for better view of the new path

  // Define the updated delivery path coordinates
  const deliveryPathCoordinates = [
    [-73.972309, 40.756492],  // NEW Point 0 (index 0) - Off map
    [-73.973206, 40.755226],  // Point 1 (index 1)
    [-73.971685, 40.754566],  // Point 2 (index 2)
    [-73.972178, 40.753952],  // Point 3 (index 3)
    [-73.972903, 40.7542702], // Point 4 (index 4)
    [-73.9726985, 40.754577], // Point 5 (index 5) - Shoe
    [-73.9723001, 40.7544531] // Point 6 (index 6) - Shoe
  ];

  // Helper function to calculate bearing between two points (in degrees)
  const calculateBearing = (startLng, startLat, endLng, endLat) => {
    const toRadians = (deg) => deg * Math.PI / 180;
    const toDegrees = (rad) => rad * 180 / Math.PI;

    const lat1 = toRadians(startLat);
    const lon1 = toRadians(startLng);
    const lat2 = toRadians(endLat);
    const lon2 = toRadians(endLng);

    const deltaLon = lon2 - lon1;

    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
    let bearing = toDegrees(Math.atan2(y, x));

    return (bearing + 360) % 360; // Normalize to 0-360
  };


  useEffect(() => {
    if (map.current) return;

    const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

    if (!mapboxToken) {
      console.error('Mapbox access token not found. Please set REACT_APP_MAPBOX_ACCESS_TOKEN in your environment variables.');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      window.mapboxgl.accessToken = mapboxToken;

      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom
      });

      map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');

      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });

      map.current.on('load', () => {
        console.log('Map loaded, adding sources and layers...');

        // 1. GeoJSON for Points (Cars and Shoes)
        const allPointsGeojsonData = {
          'type': 'FeatureCollection',
          'features': deliveryPathCoordinates.map((coord, index) => ({
            'type': 'Feature',
            'properties': {
              // Add a 'type' property to distinguish between car and shoe points
              // Last two points (now indices 5 and 6) are shoes
              'pointType': (index >= deliveryPathCoordinates.length - 2) ? 'shoe' : 'car'
            },
            'geometry': {
              'type': 'Point',
              'coordinates': coord
            }
          }))
        };

        // Add the car emoji image to the map style
        const carEmoji = "🚗";
        const carCanvas = document.createElement('canvas');
        const carContext = carCanvas.getContext('2d');
        carCanvas.width = 32;
        carCanvas.height = 32;
        carContext.font = '24px sans-serif';
        carContext.textAlign = 'center';
        carContext.textBaseline = 'middle';
        carContext.fillText(carEmoji, 16, 20);

        if (!map.current.hasImage('car-icon')) {
            map.current.addImage('car-icon', carContext.getImageData(0, 0, carCanvas.width, carCanvas.height), { pixelRatio: 2 });
        }

        // Add the shoe emoji image to the map style
        const shoeEmoji = "🥾"; // Using a hiking boot emoji for a slightly different look
        const shoeCanvas = document.createElement('canvas');
        const shoeContext = shoeCanvas.getContext('2d');
        shoeCanvas.width = 32;
        shoeCanvas.height = 32;
        shoeContext.font = '24px sans-serif';
        shoeContext.textAlign = 'center';
        shoeContext.textBaseline = 'middle';
        shoeContext.fillText(shoeEmoji, 16, 20);

        if (!map.current.hasImage('shoe-icon')) {
            map.current.addImage('shoe-icon', shoeContext.getImageData(0, 0, shoeCanvas.width, shoeCanvas.height), { pixelRatio: 2 });
        }


        // Add Source for All Points
        if (!map.current.getSource('delivery-points')) {
            map.current.addSource('delivery-points', {
              'type': 'geojson',
              'data': allPointsGeojsonData
            });
            console.log('Delivery points source added.');
        }

        // 2. GeoJSON for Path Lines
        const pathLineGeojsonData = {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': deliveryPathCoordinates
          }
        };

        // Add Source for Path Lines
        if (!map.current.getSource('delivery-path-line')) {
            map.current.addSource('delivery-path-line', {
              'type': 'geojson',
              'data': pathLineGeojsonData
            });
            console.log('Delivery path line source added.');
        }

        // Add Layer for Path Lines (ADDED FIRST)
        if (!map.current.getLayer('delivery-path-line-layer')) {
            map.current.addLayer({
                'id': 'delivery-path-line-layer',
                'type': 'line',
                'source': 'delivery-path-line',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#007cbf', // Blue color for the path
                    'line-width': 4
                }
            });
            console.log('Delivery path line layer added.');
        }

        // 3. GeoJSON for Arrows
        const arrowsGeojsonData = {
            'type': 'FeatureCollection',
            'features': []
        };

        // Create arrow point features for each segment
        for (let i = 0; i < deliveryPathCoordinates.length - 1; i++) {
            const start = deliveryPathCoordinates.slice(i, i + 2);
            if (start.length === 2) {
                const [p1, p2] = start;
                const midLng = (p1?.[0] + p2?.[0]) / 2;
                const midLat = (p1?.[1] + p2?.[1]) / 2;
                const bearing = calculateBearing(p1?.[0], p1?.[1], p2?.[0], p2?.[1]);

                arrowsGeojsonData.features.push({
                    'type': 'Feature',
                    'properties': {
                        'bearing': bearing
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [midLng, midLat]
                    }
                });
            }
        }

        // Add the arrow image to the map style
        const arrowEmoji = "➤"; // Unicode right arrow
        const arrowCanvas = document.createElement('canvas');
        const arrowContext = arrowCanvas.getContext('2d');
        arrowCanvas.width = 32;
        arrowCanvas.height = 32;
        arrowContext.font = '24px sans-serif';
        arrowContext.textAlign = 'center';
        arrowContext.textBaseline = 'middle';
        arrowContext.fillText(arrowEmoji, arrowCanvas.width / 2, arrowCanvas.height / 2 + 2);

        if (!map.current.hasImage('arrow-icon')) {
            map.current.addImage('arrow-icon', arrowCanvas.getContext('2d').getImageData(0, 0, arrowCanvas.width, arrowCanvas.height), { pixelRatio: 2 });
        }

        // Add Source for Arrows
        if (!map.current.getSource('delivery-arrows')) {
            map.current.addSource('delivery-arrows', {
                'type': 'geojson',
                'data': arrowsGeojsonData
            });
            console.log('Delivery arrows source added.');
        }

        // Add Layer for Arrows (ADDED SECOND)
        if (!map.current.getLayer('delivery-arrows-layer')) {
            map.current.addLayer({
                'id': 'delivery-arrows-layer',
                'type': 'symbol',
                'source': 'delivery-arrows',
                'layout': {
                    'icon-image': 'arrow-icon',
                    'icon-size': 0.8,
                    'icon-rotate': ['get', 'bearing'],
                    'icon-rotation-alignment': 'map',
                    'icon-allow-overlap': true
                },
                'paint': {
                    'icon-color': '#000000'
                }
            });
            console.log('Delivery arrows layer added.');
        }

        // Add Layer for All Points (ADDED LAST - to be on top)
        if (!map.current.getLayer('delivery-points-layer')) {
          map.current.addLayer({
            'id': 'delivery-points-layer',
            'type': 'symbol',
            'source': 'delivery-points',
            'layout': {
              // Use a match expression to choose the icon based on 'pointType' property
              'icon-image': ['match', ['get', 'pointType'],
                  'shoe', 'shoe-icon',
                  'car', 'car-icon',
                  'car-icon' // default to car-icon if no match
              ],
              'icon-size': 1.5, // Adjust size as needed for both car and shoe
              'icon-allow-overlap': true
            },
          });
          console.log('Delivery points layer added.');
        }


        // Optional: Fit map to bounds of all points
        const bounds = new window.mapboxgl.LngLatBounds();
        deliveryPathCoordinates.forEach(coord => bounds.extend(coord));
        map.current.fitBounds(bounds, { padding: 50 });
      });
    };

    document.head.appendChild(script);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      // Note: Scripts and links added to head are not removed here,
      // as the user specified sticking to this version's cleanup.
    };
  }, []);

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

    {/* Route Optimization Status at the bottom */}
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
      zIndex: 20,
      borderTop: '1px solid #e5e7eb',
      padding: '12px 16px',
      textAlign: 'center',
      fontSize: '14px',
      color: '#374151'
    }}>
        <strong style={{ fontSize: '16px', color: '#111827', fontWeight: '600' }}>Route Optimization in progress</strong> <br /> based on {' '}
        <span style={{
            color: '#2563eb', // Blue color for hyperlink
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: '600'
        }}
        onClick={() => alert('Viewing historical trips data!')} // Example action on click
        >
            143 historical trips to this location
        </span>
    </div>

    {/* Instructions */}
    {!process.env.REACT_APP_MAPBOX_ACCESS_TOKEN && (
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#dc2626'
          }}>
            Mapbox Token Required
          </h3>
          <p style={{
            color: '#4b5563',
            fontSize: '14px'
          }}>
            Please set your <code style={{
              backgroundColor: '#e5e7eb',
              padding: '2px 4px',
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}>REACT_APP_MAPBOX_ACCESS_TOKEN</code>
            environment variable with your Mapbox access token.
          </p>
        </div>
      </div>
    )}
  </div>
);
};

export default MapboxMap;