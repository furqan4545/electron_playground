import React, { useState, useEffect } from "react";

const SelectorWindow = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Add ESC key handler
  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        await (window as any).electron.closeSelector();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const moveX = e.screenX - dragStart.x;
    const moveY = e.screenY - dragStart.y;

    // Move the window (this is handled by the OS through -webkit-app-region)
    const currentWindow = window as any;
    if (currentWindow.electron) {
      currentWindow.electron.moveWindow(moveX, moveY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Remove event listeners
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="w-screen h-screen border-2 border-purple-500 bg-transparent"
      style={{ WebkitAppRegion: "drag" }} // This enables OS-level window dragging
    >
      <div className="flex items-center justify-center h-full select-none">
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
          style={{ WebkitAppRegion: "no-drag" }} // Make the button clickable
          onClick={() => {
            console.log("Start Recording clicked");
          }}
        >
          Start Recording
        </button>
      </div>
    </div>
  );
};

export default SelectorWindow;
