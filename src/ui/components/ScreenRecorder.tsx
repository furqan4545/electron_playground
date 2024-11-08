import React from "react";
import { Video } from "lucide-react";

declare module "react" {
  interface CSSProperties {
    WebkitAppRegion?: "drag" | "no-drag";
  }
}

const ScreenRecorder = () => {
  const handleStartRecording = async () => {
    try {
      // Open selector window and minimize main window
      await (window as any).electron.openSelector();
    } catch (err) {
      console.error("Failed to open selector window:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 mb-6">
            <Video className="w-6 h-6" />
            Screen Recorder
          </h2>

          <button
            onClick={handleStartRecording}
            className="w-full py-3 px-4 rounded-md flex items-center justify-center gap-2 text-white font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Video className="w-5 h-5" />
            Start Recording
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenRecorder;
