import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const CursorVisualizer = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample cursor data
  const sampleData = [
    { x: 577, y: 495, timestamp: 224 },
    { x: 641, y: 560, timestamp: 259 },
    { x: 699, y: 644, timestamp: 294 },
    { x: 705, y: 673, timestamp: 331 },
    { x: 705, y: 673, timestamp: 369 },
    { x: 705, y: 673, timestamp: 408 },
    { x: 757, y: 673, timestamp: 441 },
    { x: 824, y: 673, timestamp: 478 },
    { x: 880, y: 673, timestamp: 524 },
  ];

  // Screen bounds from the data
  const screenBounds = {
    width: 1512,
    height: 982,
  };

  // Scale factor to fit in our visualization
  const scale = 0.4; // 40% of original size

  useEffect(() => {
    let intervalId: number;

    if (isPlaying) {
      intervalId = window.setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= sampleData.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (currentIndex < sampleData.length) {
      setCursorPosition({
        x: sampleData[currentIndex].x,
        y: sampleData[currentIndex].y,
      });
    }
  }, [currentIndex]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">
          Cursor Movement Visualization
        </h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      <div
        className="relative border border-gray-300 rounded"
        style={{
          width: screenBounds.width * scale,
          height: screenBounds.height * scale,
        }}
      >
        {/* Cursor dot */}
        <div
          className="absolute w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
          style={{
            left: cursorPosition.x * scale,
            top: cursorPosition.y * scale,
          }}
        />

        {/* Trail */}
        {sampleData.slice(0, currentIndex + 1).map((pos, index) => (
          <div
            key={index}
            className="absolute w-1 h-1 bg-blue-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: pos.x * scale,
              top: pos.y * scale,
              opacity: index / currentIndex,
            }}
          />
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          Current Position: ({Math.round(cursorPosition.x)},{" "}
          {Math.round(cursorPosition.y)})
        </p>
        <p>
          Timestamp:{" "}
          {currentIndex < sampleData.length
            ? sampleData[currentIndex].timestamp
            : 0}
          ms
        </p>
        <p>
          Screen Size: {screenBounds.width}x{screenBounds.height}
        </p>
      </div>
    </div>
  );
};

export default CursorVisualizer;
