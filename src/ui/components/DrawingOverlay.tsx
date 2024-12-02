// // Add this at the top of the file, before your imports
// declare global {
//   interface Window {
//     electron: {
//       createOverlayWindow: (bounds: any) => void;
//       closeOverlayWindow: () => void;
//       setClickThrough: (enabled: boolean) => void;
//       on: (channel: string, callback: Function) => void;
//     };
//   }
// }

// import React, { useCallback, useEffect, useRef, useState } from "react";

// import { DrawingTool } from "../types/drawingTool";

// interface DrawingState {
//   tool: DrawingTool;
//   color: string;
//   width: number;
// }

// interface Point {
//   x: number;
//   y: number;
// }

// const DrawingOverlay: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [bounds, setBounds] = useState<{
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//   } | null>(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [enableDrawing, setEnableDrawing] = useState(false);

//   const [isDrawing, setIsDrawing] = useState(false);
//   const [prevPoint, setPrevPoint] = useState<Point | null>(null);

//   const [drawingState, setDrawingState] = useState<DrawingState>({
//     tool: "none",
//     color: "#000000",
//     width: 2,
//   });

//   const cursorStyles = {
//     none: "default",
//     pen: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="4" cy="28" r="3" fill="black"/><line x1="4" y1="28" x2="20" y2="12" stroke="black" stroke-width="2"/></svg>') 4 28, auto`,
//     eraser: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="16" transform="rotate(45, 16, 16)" stroke="black" stroke-width="2" fill="white"/></svg>') 16 16, auto`,
//   };

//   useEffect(() => {
//     // Setup IPC listener
//     const handleSetup = (data: { bounds: any; isRecording: boolean }) => {
//       console.log("Received overlay setup:", data);
//       setBounds(data.bounds);
//       setIsRecording(data.isRecording);
//     };

//     // Add listener
//     (window as any).electron.on("setup-overlay", handleSetup);

//     // Cleanup listener
//     return () => {
//       // Remove listener if needed
//     };
//   }, []); // Empty dependency array

//   // Set canvas size and context
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     canvas.width = bounds?.width || 0;
//     canvas.height = bounds?.height || 0;

//     const ctx = canvas.getContext("2d");
//     if (ctx) {
//       ctx.lineCap = "round";
//       ctx.lineJoin = "round";
//     }
//   }, [bounds]);

//   useEffect(() => {
//     (window as any).electron.on("tool-change", (state: DrawingState) => {
//       setDrawingState(state);
//       console.log("Drawing state updated:", state);
//     });
//   }, []);

//   // Draw on canvas
//   const draw = useCallback(
//     (event: MouseEvent) => {
//       const canvas = canvasRef.current;
//       const ctx = canvas?.getContext("2d");
//       if (!ctx || !canvas || !isDrawing) return;

//       const rect = canvas.getBoundingClientRect();
//       const x = event.clientX - rect.left;
//       const y = event.clientY - rect.top;

//       ctx.beginPath();
//       if (prevPoint) {
//         ctx.globalCompositeOperation =
//           drawingState.tool === "eraser" ? "destination-out" : "source-over";
//         ctx.moveTo(prevPoint.x, prevPoint.y);
//         ctx.lineTo(x, y);
//         ctx.strokeStyle =
//           drawingState.tool === "eraser" ? "rgba(0,0,0,1)" : drawingState.color;
//         ctx.lineWidth =
//           drawingState.tool === "eraser" ? 20 : drawingState.width;
//         ctx.stroke();
//       }
//       setPrevPoint({ x, y });
//     },
//     [isDrawing, prevPoint, drawingState]
//   );

//   // Handle mouse events
//   useEffect(() => {
//     if (!canvasRef.current) return;
//     const canvas = canvasRef.current;

//     const mouseDownHandler = (e: MouseEvent) => {
//       if (drawingState.tool === "none") return;
//       setIsDrawing(true);
//       const rect = canvas.getBoundingClientRect();
//       setPrevPoint({
//         x: e.clientX - rect.left,
//         y: e.clientY - rect.top,
//       });
//     };

//     const mouseUpHandler = () => {
//       setIsDrawing(false);
//       setPrevPoint(null);
//     };

//     const mouseMoveHandler = draw;

//     canvas.addEventListener("mousedown", mouseDownHandler);
//     canvas.addEventListener("mousemove", mouseMoveHandler);
//     canvas.addEventListener("mouseup", mouseUpHandler);
//     canvas.addEventListener("mouseleave", mouseUpHandler);

//     return () => {
//       canvas.removeEventListener("mousedown", mouseDownHandler);
//       canvas.removeEventListener("mousemove", mouseMoveHandler);
//       canvas.removeEventListener("mouseup", mouseUpHandler);
//       canvas.removeEventListener("mouseleave", mouseUpHandler);
//     };
//   }, [draw]);

//   // Don't render until we have bounds
//   if (!bounds) {
//     console.log("No bounds yet, waiting...");
//     return null;
//   }

//   return (
//     <div
//       className="fixed inset-0"
//       style={{
//         position: "fixed",
//         left: bounds.x,
//         top: bounds.y,
//         width: bounds.width,
//         height: bounds.height,
//         backgroundColor: "rgba(255, 0, 0, 0.1)", // Red tint to see bounds
//         pointerEvents: enableDrawing ? "auto" : "none",
//         cursor: cursorStyles[drawingState.tool], // Add cursor style here too
//       }}
//     >
//       <canvas
//         ref={canvasRef}
//         style={{
//           width: bounds.width,
//           height: bounds.height,
//           cursor: cursorStyles[drawingState.tool],
//           pointerEvents: "auto", // Enable pointer events
//         }}
//       />

//       {/* Debug info */}
//       <div
//         style={{
//           position: "absolute",
//           bottom: "16px",
//           left: "16px",
//           color: "red",
//           fontSize: "12px",
//         }}
//       >
//         Window Size: {bounds.width} x {bounds.height}
//       </div>
//     </div>
//   );
// };

// export default DrawingOverlay;

///////////////////////////////////////////////////
///////////////////////////////////////////////////

// Add this at the top of the file, before your imports
declare global {
  interface Window {
    electron: {
      createOverlayWindow: (bounds: any) => void;
      closeOverlayWindow: () => void;
      setClickThrough: (enabled: boolean) => void;
      on: (channel: string, callback: Function) => void;
    };
  }
}

import React, { useCallback, useEffect, useRef, useState } from "react";

import { DrawingTool } from "../types/drawingTool";
import { Rnd } from "react-rnd";

interface DrawingState {
  tool: DrawingTool;
  color: string;
  width: number;
}

interface Point {
  x: number;
  y: number;
}

const DrawingOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bounds, setBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [enableDrawing, setEnableDrawing] = useState(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPoint, setPrevPoint] = useState<Point | null>(null);

  const [drawingState, setDrawingState] = useState<DrawingState>({
    tool: "none",
    color: "#000000",
    width: 2,
  });

  const [texts, setTexts] = useState<
    Array<{
      id: string;
      text: string;
      x: number;
      y: number;
    }>
  >([]);

  const cursorStyles = {
    none: "default",
    pen: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="4" cy="28" r="3" fill="black"/><line x1="4" y1="28" x2="20" y2="12" stroke="black" stroke-width="2"/></svg>') 4 28, auto`,
    eraser: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="16" transform="rotate(45, 16, 16)" stroke="black" stroke-width="2" fill="white"/></svg>') 16 16, auto`,
    text: "text",
    clear: "default",
  };

  useEffect(() => {
    // Setup IPC listener
    const handleSetup = (data: { bounds: any; isRecording: boolean }) => {
      console.log("Received overlay setup:", data);
      setBounds(data.bounds);
      setIsRecording(data.isRecording);
    };

    // Add listener
    (window as any).electron.on("setup-overlay", handleSetup);

    // Cleanup listener
    return () => {
      // Remove listener if needed
    };
  }, []); // Empty dependency array

  // Set canvas size and context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = bounds?.width || 0;
    canvas.height = bounds?.height || 0;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [bounds]);

  //   useEffect(() => {
  //     (window as any).electron.on("tool-change", (state: DrawingState) => {
  //       setDrawingState(state);
  //       console.log("Drawing state updated:", state);
  //     });
  //   }, []);

  const handleCanvasClick = useCallback(
    (e: MouseEvent) => {
      if (drawingState.tool === "text") {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setTexts((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "",
            x,
            y,
          },
        ]);
      }
    },
    [drawingState.tool]
  );

  useEffect(() => {
    (window as any).electron.on("tool-change", (state: DrawingState) => {
      setDrawingState(state);
      if (state.tool === "clear") {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, bounds?.width || 0, bounds?.height || 0);
          setTexts([]); // Clear all text boxes
        }
      }
    });
  }, [bounds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("click", handleCanvasClick);
    return () => canvas.removeEventListener("click", handleCanvasClick);
  }, [handleCanvasClick]);

  // Draw on canvas
  const draw = useCallback(
    (event: MouseEvent) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas || !isDrawing) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      ctx.beginPath();
      if (prevPoint) {
        ctx.globalCompositeOperation =
          drawingState.tool === "eraser" ? "destination-out" : "source-over";
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle =
          drawingState.tool === "eraser" ? "rgba(0,0,0,1)" : drawingState.color;
        ctx.lineWidth =
          drawingState.tool === "eraser" ? 20 : drawingState.width;
        ctx.stroke();
      }
      setPrevPoint({ x, y });
    },
    [isDrawing, prevPoint, drawingState]
  );

  // Handle mouse events
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const mouseDownHandler = (e: MouseEvent) => {
      if (drawingState.tool === "none" || drawingState.tool === "text") return;
      setIsDrawing(true);
      const rect = canvas.getBoundingClientRect();
      setPrevPoint({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const mouseUpHandler = () => {
      setIsDrawing(false);
      setPrevPoint(null);
    };

    const mouseMoveHandler = draw;

    canvas.addEventListener("mousedown", mouseDownHandler);
    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("mouseup", mouseUpHandler);
    canvas.addEventListener("mouseleave", mouseUpHandler);

    return () => {
      canvas.removeEventListener("mousedown", mouseDownHandler);
      canvas.removeEventListener("mousemove", mouseMoveHandler);
      canvas.removeEventListener("mouseup", mouseUpHandler);
      canvas.removeEventListener("mouseleave", mouseUpHandler);
    };
  }, [draw]);

  // Don't render until we have bounds
  if (!bounds) {
    console.log("No bounds yet, waiting...");
    return null;
  }

  return (
    <div
      className="fixed inset-0"
      style={{
        position: "fixed",
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        backgroundColor: "rgba(255, 0, 0, 0.1)", // Red tint to see bounds
        pointerEvents: enableDrawing ? "auto" : "none",
        cursor: cursorStyles[drawingState.tool], // Add cursor style here too
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: bounds.width,
          height: bounds.height,
          cursor: cursorStyles[drawingState.tool],
          pointerEvents: "auto", // Enable pointer events
        }}
      />

      {texts.map((textItem) => (
        <div
          key={textItem.id}
          style={{
            position: "absolute",
            left: textItem.x,
            top: textItem.y,
          }}
        >
          <textarea
            autoFocus
            className="bg-transparent border-none outline-none font-['DynaPuff'] text-2xl appearance-none text-purple-600"
            style={{
              fontFamily: "DynaPuff",
              fontSize: "22px",
              resize: "none", // Prevent manual resizing
              overflow: "hidden",
              width: "auto",
              height: "auto",
              whiteSpace: "pre", // Preserve line breaks only on Enter
            }}
            onChange={(e) => {
              const target = e.target;
              target.style.width = `${target.scrollWidth}px`;
              target.style.height = `${target.scrollHeight}px`;
              setTexts((prev) =>
                prev.map((t) =>
                  t.id === textItem.id ? { ...t, text: e.target.value } : t
                )
              );
            }}
          />
        </div>
      ))}

      {/* Debug info */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          color: "red",
          fontSize: "12px",
        }}
      >
        Window Size: {bounds.width} x {bounds.height}
      </div>
    </div>
  );
};

export default DrawingOverlay;


