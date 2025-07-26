import React, { useState, useEffect, useRef } from 'react';

// StylizedMap Component
function StylizedMap({ currentPositionIndex, animationProgress, animationPath, setCurrentPositionIndex, setAnimationProgress }) {
  // Define SVG viewbox dimensions for consistent scaling
  const viewBoxWidth = 1000;
  const viewBoxHeight = 1000;
  const originalBaseWidth = 400; // Reference for original internal scaling
  const scaleFactor = viewBoxWidth / originalBaseWidth; // Calculate scaling factor

  // Define rotation parameters
  const rotationAngle = 30; // degrees
  const centerX = viewBoxWidth / 2;
  const centerY = viewBoxHeight / 2;

  // Helper function to rotate a point around a given center
  const rotatePoint = (x, y, angle, cx, cy) => {
    const radians = (Math.PI / 180) * angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = cx + (x - cx) * cos - (y - cy) * sin;
    const ny = cy + (x - cx) * sin + (y - cy) * cos;
    return [nx, ny];
  };

  // Define grid lines (adjust coordinates as needed for your desired layout)
  const gridLines = [];
  const cellSize = 50 * scaleFactor;

  // Generate horizontal lines - extending much further beyond viewBox
  for (let y = -viewBoxHeight * 3; y <= viewBoxHeight * 4; y += cellSize) {
    gridLines.push({ x1: -viewBoxWidth * 3, y1: y, x2: viewBoxWidth * 4, y2: y });
  }
  // Generate vertical lines - extending much further beyond viewBox
  for (let x = -viewBoxWidth * 3; x <= viewBoxWidth * 4; x += cellSize) {
    gridLines.push({ x1: x, y1: -viewBoxHeight * 3, x2: x, y2: viewBoxHeight * 4 });
  }


  // Define base building components (unrotated, unscaled)
  const baseBuildingParts = [
    { x: 180, y: 100, width: 120, height: 150, fill: '#4a4a5a' }, // Main base
    { x: 160, y: 120, width: 40, height: 80, fill: '#5a5a6a' },   // Left extension
    { x: 280, y: 120, width: 40, height: 80, fill: '#5a5a6a' },   // Right extension
    { x: 200, y: 80, width: 80, height: 40, fill: '#5a5a6a' },    // Top extension
    { x: 200, y: 230, width: 80, height: 40, fill: '#5a5a6a' },   // Bottom extension (this is our "door" area)
  ];


  // Apply scaling and offset to building parts
  const buildingOffsetX = -20; // Original unscaled offset
  const buildingOffsetY = 20 + (originalBaseWidth * 0.05); // Original unscaled offset + 5% down


  // Position for the pin icon (adjust as needed) - scaled
  // Adjust pin position to be at the "door" of the building (center of bottom extension)
  const basePinX = 200 + (80 / 2); // Center of the bottom extension (door)
  const basePinY = 230 + (40 / 2); // Center of the bottom extension (door)

  // Calculate the final, rotated pin coordinates
  const [rotatedPinX, rotatedPinY] = rotatePoint(
    (basePinX + buildingOffsetX) * scaleFactor, // Apply building's offset and scale
    (basePinY + buildingOffsetY) * scaleFactor, // Apply building's offset and scale
    rotationAngle,
    centerX,
    centerY
  );
  const pinX = rotatedPinX;
  const pinY = rotatedPinY;


  const animationFrameId = useRef(null);
  const lastTime = useRef(0);

  useEffect(() => {
    const animate = (time) => {
      if (!lastTime.current) {
        lastTime.current = time;
      }
      const deltaTime = time - lastTime.current;
      lastTime.current = time;

      setAnimationProgress(prevProgress => {
        // Get the duration for the current segment
        const currentSegmentDuration = animationPath[currentPositionIndex]?.duration || 1000; // Default if not found

        let newProgress = prevProgress + (deltaTime / currentSegmentDuration);

        if (newProgress >= 1) {
          // Move to the next segment
          const nextIndex = (currentPositionIndex + 1) % animationPath.length;
          setCurrentPositionIndex(nextIndex);
          newProgress = 0; // Reset progress for the new segment
          // If we just looped back to the start, reset lastTime to avoid a jump
          if (nextIndex === 0) {
            lastTime.current = time;
          }
        }
        return newProgress;
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [currentPositionIndex, animationPath, setCurrentPositionIndex, setAnimationProgress]); // Dependencies for useEffect

  // Calculate current truck position based on animation progress
  const startPoint = animationPath[currentPositionIndex].point;
  const endPoint = animationPath[(currentPositionIndex + 1) % animationPath.length].point;

  const truckX = startPoint[0] + (endPoint[0] - startPoint[0]) * animationProgress;
  const truckY = startPoint[1] + (endPoint[1] - startPoint[1]) * animationProgress;


  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} fill="#1a1a2e" />

      {/* Grid Lines - now rotated directly */}
      <g opacity="0.8" transform={`rotate(${rotationAngle} ${centerX} ${centerY})`}>
        {gridLines.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#e0e0e0"
            strokeWidth="1"
          />
        ))}
      </g>

      {/* Building Outline - now composed of multiple rotated rectangles */}
      <g transform={`rotate(${rotationAngle} ${centerX} ${centerY})`}>
        {baseBuildingParts.map((part, index) => {
          // Apply individual part's position, then building's overall offset, then scale
          const [rotatedPartX, rotatedPartY] = rotatePoint(
            (part.x + buildingOffsetX) * scaleFactor,
            (part.y + buildingOffsetY) * scaleFactor,
            0, // No additional rotation for individual parts, handled by parent g
            centerX,
            centerY
          );
          return (
            <rect
              key={index}
              x={rotatedPartX}
              y={rotatedPartY}
              width={part.width * scaleFactor}
              height={part.height * scaleFactor}
              fill={part.fill}
              stroke="#6b7280"
              strokeWidth="1.5"
              filter="url(#shadow)"
            />
          );
        })}
      </g>

      {/* Define SVG filter for shadow effect */}
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Delivery Truck Icon - rendered with pre-calculated rotated coordinates */}
      <circle cx={truckX} cy={truckY} r={10} fill="#4f46e5" />
      <text x={truckX} y={truckY + 3} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">&#x2022;</text>


      {/* Pin Icon - rendered with pre-calculated rotated coordinates */}
      <circle cx={pinX} cy={pinY - 8 * scaleFactor} r={6 * scaleFactor} fill="#ef4444" />
      <path d={`M${pinX},${pinY - 2 * scaleFactor} L${pinX},${pinY + 10 * scaleFactor}`} stroke="#ef4444" strokeWidth={2 * scaleFactor} />
      <circle cx={pinX} cy={pinY} r={2 * scaleFactor} fill="white" />

    </svg>
  );
}

// DriverDashboard Component
const DriverDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Animation states, now managed by DriverDashboard
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Mock Real-time Metrics States
  const [currentStopETA, setCurrentStopETA] = useState(15); // minutes
  const [initialETA, setInitialETA] = useState(20); // minutes for percentage diff
  const [deliveryWindowRemaining, setDeliveryWindowRemaining] = useState(1200); // seconds (20 mins)
  const [instructionsFeed, setInstructionsFeed] = useState([
    "Approaching 123 Main St.",
    "Turn right at Elm St.",
    "Look for blue door on right.",
    "Freight elevator access via East entrance."
  ]);
  const [driverStatus, setDriverStatus] = useState("Driving"); // "Loading", "Unloading", "Driving", "Delivering", "Returning to Depot"
  const [deliveryCost, setDeliveryCost] = useState(0.00); // Running total in dollars

  // Define the base path for the truck to follow (unrotated, unscaled, aligned with grid)
  // Path adjusted to follow grid lines and go around the building
  // All points are multiples of 50 to ensure they are on the grid
  const baseAnimationPath = [
    { point: [50, 50], duration: 2000 },     // 0: Start (top-left grid intersection)
    { point: [350, 50], duration: 2000 },    // 1: Drive right along top grid line
    { point: [350, 200], duration: 1000 },   // 2: Drive down to grid line aligned with building's right side
    { point: [350, 200], duration: 750 },    // 3: Wait at this corner
    { point: [350, 300], duration: 500 },    // 4: Drive down further, past building
    { point: [150, 300], duration: 1000 },   // 5: Drive left along bottom grid line, to parking spot
    { point: [150, 300], duration: 750 },    // 6: Wait at parking spot
    { point: [200 + (80 / 2), 230 + (40 / 2)], duration: 450 }, // 7: "On foot" to pin (using building's door coords)
    { point: [200 + (80 / 2), 230 + (40 / 2)], duration: 1500 }, // 8: Wait at pin (delivery)
    { point: [150, 300], duration: 450 },    // 9: "On foot" back to truck
    { point: [50, 300], duration: 1500 },    // 10: Drive left along bottom grid line
    { point: [50, 50], duration: 1500 },     // 11: Drive up along left grid line
    { point: [50, 50], duration: 1500 }      // 12: Loop back to start (repeat point to ensure full loop)
  ];

  // Apply scaling and rotation to the animation path points for passing to StylizedMap
  // Note: StylizedMap expects rotated points, so we do the rotation here.
  const animationPathForMap = baseAnimationPath.map(segment => {
    const originalBaseWidth = 400; // Reference from StylizedMap
    const scaleFactor = 1000 / originalBaseWidth; // viewBoxWidth / originalBaseWidth
    const centerX = 1000 / 2; // viewBoxWidth / 2
    const centerY = 1000 / 2; // viewBoxHeight / 2
    const rotationAngle = 30;

    // Building offsets are applied here for the pin-related points
    const buildingOffsetX = -20;
    const buildingOffsetY = 20 + (originalBaseWidth * 0.05);

    let x = segment.point[0];
    let y = segment.point[1];

    // Apply building offsets only for the "on foot" segments (indices 7, 8, 9 based on baseAnimationPath)
    if (segment === baseAnimationPath[7] || segment === baseAnimationPath[8] || segment === baseAnimationPath[9]) {
      x += buildingOffsetX;
      y += buildingOffsetY;
    }


    const rotatedPoint = ((px, py, angle, cx, cy) => {
      const radians = (Math.PI / 180) * angle;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const nx = cx + (px - cx) * cos - (py - cy) * sin;
      const ny = cy + (px - cx) * sin + (py - cy) * cos;
      return [nx, ny];
    })(x * scaleFactor, y * scaleFactor, rotationAngle, centerX, centerY);

    return { point: rotatedPoint, duration: segment.duration };
  });


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate real-time metric updates and status changes based on animation index
  useEffect(() => {
    const metricsInterval = setInterval(() => {
      // Simulate ETA decreasing
      setCurrentStopETA(prev => Math.max(0, prev - 0.2));

      // Simulate delivery window decreasing
      setDeliveryWindowRemaining(prev => Math.max(0, prev - 2));

      // Simulate delivery cost increasing
      setDeliveryCost(prev => parseFloat(prev) + 0.01);

      // Update driver status based on currentPositionIndex
      let newStatus = "Driving"; // Default or initial state

      // Segment 0-2: Initial drive
      if (currentPositionIndex >= 0 && currentPositionIndex <= 2) {
        newStatus = "Driving";
      }
      // Segment 3: Waiting at initial stop
      else if (currentPositionIndex === 3) {
        newStatus = "Waiting (Initial Stop)";
      }
      // Segment 4-5: Driving towards parking spot
      else if (currentPositionIndex >= 4 && currentPositionIndex <= 5) {
        newStatus = "Driving";
      }
      // Segment 6: Parked near building
      else if (currentPositionIndex === 6) {
        newStatus = "Delivering (Parked)";
      }
      // Segment 7: On foot to pin
      else if (currentPositionIndex === 7) {
        newStatus = "Delivering (On Foot)";
      }
      // Segment 8: At pin, waiting/unloading
      else if (currentPositionIndex === 8) {
        newStatus = "Unloading";
      }
      // Segment 9: On foot back to truck
      else if (currentPositionIndex === 9) {
        newStatus = "Delivering (Returning to Truck)";
      }
      // Segment 10-11: Driving back to depot
      else if (currentPositionIndex >= 10 && currentPositionIndex <= 11) {
        newStatus = "Returning to Depot";
      }
      // Segment 12: Loop back to start
      else if (currentPositionIndex === 12) {
        newStatus = "Trip Complete"; // More descriptive status for end of trip
      }
      setDriverStatus(newStatus);

      // Reset for next simulated trip after a full loop
      // This logic should trigger when the last segment (12) completes and currentPositionIndex resets to 0.
      // We can check if the currentPositionIndex is 0 and the previous status was "Trip Complete..."
      // Or, more simply, when the animation loops back to the very first segment.
      if (currentPositionIndex === 0 && newStatus === "Driving (New Trip)") { // Assuming "Driving (New Trip)" is set right before reset
          setCurrentStopETA(15);
          setInitialETA(20);
          setDeliveryWindowRemaining(1200);
          setInstructionsFeed(["Approaching 123 Main St.", "Turn right at Elm St.", "Look for blue door on right.", "Freight elevator access via East entrance."]);
          setDeliveryCost(0.00);
      }


      // Update instructions based on currentSegmentIndex
      // Add new instructions only if they are not already the most recent one
      if (currentPositionIndex === 0 && instructionsFeed[0] !== "Approaching 123 Main St.") {
        setInstructionsFeed(["Approaching 123 Main St.", "Turn right at Elm St.", "Look for blue door on right.", "Freight elevator access via East entrance."]);
      } else if (currentPositionIndex === 3 && instructionsFeed[0] !== "Waiting at initial stop.") {
        setInstructionsFeed(prev => ["Waiting at initial stop.", ...prev]);
      } else if (currentPositionIndex === 6 && instructionsFeed[0] !== "Parked near building. Prepare for delivery.") {
        setInstructionsFeed(prev => ["Parked near building. Prepare for delivery.", ...prev]);
      } else if (currentPositionIndex === 7 && instructionsFeed[0] !== "Locate freight elevator. Proceed to 19th floor.") {
        setInstructionsFeed(prev => ["Locate freight elevator.", "Proceed to 19th floor.", ...prev]);
      } else if (currentPositionIndex === 8 && instructionsFeed[0] !== "Leave package by blue door. Confirm delivery.") {
        setInstructionsFeed(prev => ["Leave package by blue door.", "Confirm delivery.", ...prev]);
      } else if (currentPositionIndex === 9 && instructionsFeed[0] !== "Returning to vehicle.") {
        setInstructionsFeed(prev => ["Returning to vehicle.", ...prev]);
      } else if (currentPositionIndex === 10 && instructionsFeed[0] !== "Trip completed. Returning to depot.") {
        setInstructionsFeed(prev => ["Trip completed. Returning to depot.", ...prev]);
      }


    }, 500); // Update every 0.5 seconds for better real-time feel

    return () => clearInterval(metricsInterval);
  }, [currentStopETA, deliveryWindowRemaining, currentPositionIndex, deliveryCost, instructionsFeed]); // Added instructionsFeed to dependencies

  // Effect to handle window resizing for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate ETA percentage difference
  const etaDifference = initialETA > 0 ? ((initialETA - currentStopETA) / initialETA * 100).toFixed(0) : 0;
  const etaDiffColor = etaDifference >= 0 ? '#10b981' : '#ef4444'; // Green for positive difference (saving time), red for negative

  // Calculate Time Remaining in Delivery Window color
  const minutesRemaining = Math.floor(deliveryWindowRemaining / 60);
  let windowColor = '#10b981'; // Green
  if (minutesRemaining < 10) {
    windowColor = '#f59e0b'; // Yellow
  }
  if (minutesRemaining < 5) {
    windowColor = '#ef4444'; // Red
  }

  // Conditional styles based on isMobile
  const sidebarWidth = isMobile ? '100%' : '280px';
  const mainContentPadding = isMobile ? '16px' : '24px';
  const topBarMarginBottom = isMobile ? '24px' : '32px';
  const mainFlexDirection = isMobile ? 'column' : 'row';
  const mainGap = isMobile ? '16px' : '24px';
  const rightPanelWidth = isMobile ? '100%' : '300px';
  // Fixed height for map on mobile, percentage for desktop
  const mapSectionHeight = isMobile ? '300px' : '75%';
  const statsRowMarginTop = isMobile ? '16px' : '20px';
  // Auto height for stats on mobile, percentage for desktop
  const statsRowHeight = isMobile ? 'auto' : '150px';

  return (
    <div style={{
      backgroundColor: '#0f0f23',
      minHeight: '100vh',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      // Stack sidebar and main content on mobile
      flexDirection: isMobile ? 'column' : 'row'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarWidth,
        backgroundColor: '#1a1a2e',
        padding: mainContentPadding,
        // Remove border radius on mobile for full width
        borderRadius: isMobile ? '0' : '0 16px 16px 0'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#4f46e5',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>🚛</div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Delivery drivers</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#9ca3af',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Last-mile optimization
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { icon: '🏠', label: 'Dashboard', active: true },
                { icon: '�', label: 'Deliveries' },
                { icon: '📍', label: 'Deliveries' },
                { icon: '👥', label: 'Customers' },
                { icon: '📈', label: 'Rankings' },
                { icon: '📊', label: 'LeaderMetric' },
                { icon: '📋', label: 'History' },
                { icon: '⚙️', label: 'Settings' }
              ].map((item, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <a href="#" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: item.active ? '#ffffff' : '#9ca3af',
                    backgroundColor: item.active ? '#4f46e5' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}>
                    <span style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: mainContentPadding }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: topBarMarginBottom
        }}>
          <div style={{
            backgroundColor: '#1a1a2e',
            padding: '12px 20px',
            borderRadius: '25px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '14px', color: '#9ca3af' }}>Rose Dillan</span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              RD
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: mainGap,
          flexDirection: mainFlexDirection, // Stack on mobile, row on desktop
          height: isMobile ? 'auto' : 'calc(100vh - 120px)' // Auto height for mobile, calc for desktop
        }}>
          {/* Map Section */}
          <div style={{ flex: 1 }}>
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '16px',
              padding: '24px',
              height: mapSectionHeight, // Dynamic height
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* The StylizedMap component goes here */}
              <StylizedMap
                currentPositionIndex={currentPositionIndex}
                animationProgress={animationProgress}
                animationPath={animationPathForMap}
                setCurrentPositionIndex={setCurrentPositionIndex}
                setAnimationProgress={setAnimationProgress}
              />

              {/* Map Controls (if needed, you can re-add them here and style them to overlay the map) */}
              {/* For now, removing the old map controls as they were specific to the previous implementation */}
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: statsRowMarginTop, // Dynamic margin
              height: statsRowHeight, // Dynamic height
              flexDirection: isMobile ? 'column' : 'row' // Stack stats on mobile
            }}>
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '10px 20px', // Adjusted padding here
                flex: 1
              }}>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 8px 0' }}>Optimized Routes</h3>
                <p style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>$12300</p>
                <p style={{ fontSize: '12px', color: '#10b981', margin: 0 }}>+12% increase from previous time frame</p>
              </div>

              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '10px 20px', // Adjusted padding here
                flex: 1
              }}>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 16px 0' }}>Revenue/KM</h3>
                <div style={{ height: '80px', position: 'relative' }}>
                  {/* Simple Chart Bars */}
                  <div style={{ display: 'flex', alignItems: 'end', height: '100%', gap: '4px' }}>
                    {[0.6, 0.8, 0.4, 0.9, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7].map((height, i) => (
                      <div key={i} style={{
                        flex: 1,
                        height: `${height * 100}%`,
                        backgroundColor: i === 4 ? '#4f46e5' : '#374151',
                        borderRadius: '2px'
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Updated with new real-time metrics */}
          <div style={{ width: rightPanelWidth, display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Current Stop ETA */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 8px 0' }}>Current Stop ETA</h3>
              <p style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>
                {currentStopETA.toFixed(0)} min
                <span style={{ fontSize: '12px', color: etaDiffColor, marginLeft: '8px' }}>
                  {etaDifference >= 0 ? `+${etaDifference}%` : `${etaDifference}%`}
                </span>
              </p>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>from initial estimate</div>
            </div>

            {/* Time Remaining in Delivery Window */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 8px 0' }}>Delivery Window Remaining</h3>
              <p style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0', color: windowColor }}>
                {minutesRemaining} min
              </p>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>until window closes</div>
            </div>

            {/* Status */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 8px 0' }}>Driver Status</h3>
              <p style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0', color: '#4f46e5' }}>
                {driverStatus}
              </p>
            </div>

            {/* Instructions Feed */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px',
              flex: 1, // Allow it to take available space
              minHeight: '150px', // Ensure it has some height
              maxHeight: isMobile ? '200px' : '300px', // Max height for scrolling
              overflowY: 'auto' // Enable scrolling for long feeds
            }}>
              <h3 style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 12px 0' }}>Instructions Feed</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {instructionsFeed.map((instruction, index) => (
                  <li key={index} style={{
                    fontSize: '13px',
                    color: '#e0e0e0',
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    • {instruction}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cost of the Delivery running total */}
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 8px 0' }}>Delivery Cost (Running)</h3>
              <p style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>
                ${deliveryCost.toFixed(2)}
              </p>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>factoring gas, labor, etc.</div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default DriverDashboard;