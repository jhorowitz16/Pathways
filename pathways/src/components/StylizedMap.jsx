import React, { useState, useEffect, useRef } from 'react';

// StylizedMap Component
function StylizedMap() {
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

  const [rotatedPinX, rotatedPinY] = rotatePoint(
    (basePinX + buildingOffsetX) * scaleFactor,
    (basePinY + buildingOffsetY) * scaleFactor,
    rotationAngle,
    centerX,
    centerY
  );
  const pinX = rotatedPinX;
  const pinY = rotatedPinY;


  // Animation state for the truck
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0); // 0 to 1
  const animationFrameId = useRef(null);
  const lastTime = useRef(0);

  // Define the base path for the truck to follow (unrotated, unscaled, aligned with grid)
  // Path adjusted to follow grid lines and go around the building
  const baseAnimationPath = [
    { point: [150, 50], duration: 1500 },   // 0: Start (top-right of grid)
    { point: [350, 50], duration: 1500 },   // 1: Drive right along top grid line
    { point: [350, 100], duration: 1500 },  // 2: Drive down to next grid line
    { point: [350, 100], duration: 750 },   // 3: Wait at top-right corner of grid, outside building (approx number 2)
    { point: [350, 300], duration: 1500 },  // 4: Drive down along right grid line, past building (approx number 3)
    { point: [250, 300], duration: 1000 },  // 5: Drive left along bottom grid line, to parking spot (approx number 4)
    { point: [250, 300], duration: 750 },   // 6: Wait at parking spot
    { point: [basePinX, basePinY], duration: 450 }, // 7: "On foot" to pin (quick move to door)
    { point: [basePinX, basePinY], duration: 1500 }, // 8: Wait at pin (delivery)
    { point: [250, 300], duration: 450 },   // 9: "On foot" back to truck
    { point: [50, 300], duration: 1500 },   // 10: Drive left along bottom grid line (approx number 5, 6)
    { point: [50, 50], duration: 1500 },    // 11: Drive up along left grid line (approx number 7)
    { point: [150, 50], duration: 1500 }    // 12: Drive right to original start point (approx number 8)
  ];


  // Apply scaling, general Y offset, and rotation to the animation path points
  const animationPath = baseAnimationPath.map(segment => {
    const [rotatedX, rotatedY] = rotatePoint(
      (segment.point[0] + buildingOffsetX) * scaleFactor, // Apply building's general offset to path
      (segment.point[1] + buildingOffsetY) * scaleFactor, // Apply building's general offset to path
      rotationAngle,
      centerX,
      centerY
    );
    return { point: [rotatedX, rotatedY], duration: segment.duration };
  });


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
    }
  }, [currentPositionIndex, animationPath]); // Depend on animationPath to pick up new durations


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

export default StylizedMap;
