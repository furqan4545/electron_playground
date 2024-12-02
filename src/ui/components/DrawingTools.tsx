// // components/DrawingTools.tsx
// import { Pen, Eraser, MousePointer } from "lucide-react";

// import { DrawingTool, PenColor, PenWidth } from "../types/drawingTool";

// interface DrawingToolsProps {
//   onSelectTool: (tool: DrawingTool) => void;
//   onSelectColor: (color: PenColor) => void;
//   onSelectWidth: (width: PenWidth) => void;
//   selectedTool: DrawingTool;
//   selectedColor: PenColor;
//   selectedWidth: PenWidth;
// }

// const DrawingTools: React.FC<DrawingToolsProps> = ({
//   onSelectTool,
//   onSelectColor,
//   onSelectWidth,
//   selectedTool,
//   selectedColor,
//   selectedWidth,
// }) => {
//   return (
//     <div className="flex items-center gap-6 p-4 mt-4 bg-white rounded-lg shadow">
//       <div className="flex flex-col gap-4">
//         {/* Top row - Cursor and Color Pens */}
//         <div className="flex gap-3">
//           <button
//             onClick={() => onSelectTool("none")}
//             className={`p-2 rounded-lg flex items-center gap-2 ${
//               selectedTool === "none" ? "ring-2 ring-blue-500" : ""
//             }`}
//           >
//             <MousePointer className="w-5 h-5" />
//           </button>

//           {["#FF0000", "#00FF00", "#0000FF", "#000000"].map((color) => (
//             <button
//               key={color}
//               onClick={() => {
//                 onSelectTool("pen");
//                 onSelectColor(color as PenColor);
//                 (window as any).electron.setDrawingTool({
//                   tool: "pen",
//                   color: color,
//                   width: selectedWidth,
//                 });
//               }}
//               className={`p-2 rounded-lg flex items-center gap-2 ${
//                 selectedTool === "pen" && selectedColor === color
//                   ? "ring-2 ring-blue-500"
//                   : ""
//               }`}
//             >
//               <Pen className="w-5 h-5" style={{ color }} />
//             </button>
//           ))}
//         </div>

//         {/* Width buttons - only show when pen selected */}
//         {selectedTool === "pen" && (
//           <div className="flex gap-2">
//             {[2, 4, 6, 8].map((width) => (
//               <button
//                 key={width}
//                 onClick={() => onSelectWidth(width as PenWidth)}
//                 className={`flex items-center justify-center w-8 h-8 border rounded ${
//                   selectedWidth === width ? "bg-blue-100" : ""
//                 }`}
//               >
//                 <div
//                   style={{
//                     width: width,
//                     height: width,
//                     backgroundColor: selectedColor,
//                     borderRadius: "50%",
//                   }}
//                 />
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Eraser */}
//       <button
//         onClick={() =>
//           onSelectTool(selectedTool === "eraser" ? "none" : "eraser")
//         }
//         className={`p-2 rounded-lg ${
//           selectedTool === "eraser" ? "bg-blue-100" : ""
//         }`}
//       >
//         <Eraser className="w-5 h-5" />
//       </button>
//     </div>
//   );
// };

// export default DrawingTools;

//////////////////

// components/DrawingTools.tsx
import { Pen, Eraser, MousePointer, Trash2, Type } from "lucide-react";

import { DrawingTool, PenColor, PenWidth } from "../types/drawingTool";

interface DrawingToolsProps {
  onSelectTool: (tool: DrawingTool) => void;
  onSelectColor: (color: PenColor) => void;
  onSelectWidth: (width: PenWidth) => void;
  selectedTool: DrawingTool;
  selectedColor: PenColor;
  selectedWidth: PenWidth;
  onClear: () => void;
}

const DrawingTools: React.FC<DrawingToolsProps> = ({
  onSelectTool,
  onSelectColor,
  onSelectWidth,
  selectedTool,
  selectedColor,
  selectedWidth,
  onClear,
}) => {
  return (
    <div className="flex items-center gap-6 p-4 mt-4 bg-white rounded-lg shadow">
      <div className="flex flex-col gap-4">
        {/* Top row - Cursor and Color Pens */}
        <div className="flex gap-3">
          <button
            onClick={() => onSelectTool("none")}
            className={`p-2 rounded-lg flex items-center gap-2 ${
              selectedTool === "none" ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <MousePointer className="w-5 h-5" />
          </button>

          {["#FF0000", "#00FF00", "#0000FF", "#000000"].map((color) => (
            <button
              key={color}
              onClick={() => {
                onSelectTool("pen");
                onSelectColor(color as PenColor);
                (window as any).electron.setDrawingTool({
                  tool: "pen",
                  color: color,
                  width: selectedWidth,
                });
              }}
              className={`p-2 rounded-lg flex items-center gap-2 ${
                selectedTool === "pen" && selectedColor === color
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
            >
              <Pen className="w-5 h-5" style={{ color }} />
            </button>
          ))}
        </div>

        {/* Width buttons - only show when pen selected */}
        {selectedTool === "pen" && (
          <div className="flex gap-2">
            {[2, 4, 6, 8].map((width) => (
              <button
                key={width}
                onClick={() => onSelectWidth(width as PenWidth)}
                className={`flex items-center justify-center w-8 h-8 border rounded ${
                  selectedWidth === width ? "bg-blue-100" : ""
                }`}
              >
                <div
                  style={{
                    width: width,
                    height: width,
                    backgroundColor: selectedColor,
                    borderRadius: "50%",
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Eraser */}
      {/* <button
        onClick={() =>
          onSelectTool(selectedTool === "eraser" ? "none" : "eraser")
        }
        className={`p-2 rounded-lg ${
          selectedTool === "eraser" ? "bg-blue-100" : ""
        }`}
      >
        <Eraser className="w-5 h-5" />
      </button> */}

      {/* text and clear */}
      <div className="flex gap-3">
        <button onClick={() => onSelectTool("text")}>
          <Type className="w-5 h-5" />
        </button>
        <button
          onClick={() =>
            onSelectTool(selectedTool === "eraser" ? "none" : "eraser")
          }
        >
          <Eraser className="w-5 h-5" />
        </button>
        <button onClick={onClear} className="text-red-500">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      {/* text and clear done */}
    </div>
  );
};

export default DrawingTools;
