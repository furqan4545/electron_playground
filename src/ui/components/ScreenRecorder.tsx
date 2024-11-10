// import React, { useEffect, useState } from "react";
// import { Video, Monitor, X, Maximize } from "lucide-react";

// interface SourceItem {
//   id: string;
//   name: string;
//   thumbnailURL: string;
//   display_id: string;
//   appIcon: string | null;
// }

// type TabType = "fullscreen" | "screen";

// const ScreenRecorder = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
//     null
//   );
//   const [showPicker, setShowPicker] = useState(false);
//   const [sources, setSources] = useState<SourceItem[]>([]);
//   const [activeTab, setActiveTab] = useState<TabType>("fullscreen");
//   const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
//   const [platform, setPlatform] = useState<string>("");

//   // Get screens and windows separately
//   const getScreens = () => {
//     return sources.filter((source) => source.id.includes("screen:"));
//   };

//   const getWindows = () => {
//     return sources.filter((source) => source.id.includes("window:"));
//   };

//   useEffect(() => {
//     // Get platform on component mount
//     (window as any).electron.getPlatform().then(setPlatform);
//   }, []);

//   const handleStartRecording = async () => {
//     try {
//       const availableSources = await (window as any).electron.getSources();
//       console.log("Available sources:", availableSources);
//       setSources(availableSources);
//       setShowPicker(true);
//     } catch (err) {
//       console.error("Failed to get sources:", err);
//     }
//   };

//   const startRecordingSource = async (sourceId?: string) => {
//     try {
//       console.log("Starting recording for source:", sourceId);

//       if (sourceId) {
//         await (window as any).electron.selectSource(sourceId);
//       }

//       const stream = await navigator.mediaDevices.getDisplayMedia({
//         audio: platform !== "darwin",
//         video: {
//           frameRate: 30,
//           width: { ideal: 1920 },
//           height: { ideal: 1080 },
//         },
//       });

//       console.log("Got media stream:", stream);

//       const recorder = new MediaRecorder(stream, {
//         mimeType: "video/webm;codecs=vp8,opus",
//       });

//       const chunks: Blob[] = [];

//       recorder.ondataavailable = (e) => {
//         console.log("Data available:", e.data.size);
//         if (e.data.size > 0) {
//           chunks.push(e.data);
//           setRecordedChunks((prev) => [...prev, e.data]);
//         }
//       };

//       recorder.onstop = async () => {
//         try {
//           const blob = new Blob(chunks, { type: "video/webm" });
//           console.log("Created blob:", blob.size);

//           const buffer = await blob.arrayBuffer();
//           const uint8Array = new Uint8Array(buffer);

//           const filePath = await (window as any).electron.saveRecording(
//             uint8Array
//           );
//           console.log("Recording saved to:", filePath);
//         } catch (error) {
//           console.error("Failed to save recording:", error);
//         } finally {
//           stream.getTracks().forEach((track) => track.stop());
//           setRecordedChunks([]);
//           setMediaRecorder(null);
//           setIsRecording(false);
//         }
//       };

//       recorder.start(1000);
//       setMediaRecorder(recorder);
//       setIsRecording(true);
//       setShowPicker(false);
//     } catch (error) {
//       console.error("Failed to start recording:", error);
//       setIsRecording(false);
//       setShowPicker(false);
//     }
//   };

//   const stopRecording = async () => {
//     if (mediaRecorder && mediaRecorder.state !== "inactive") {
//       mediaRecorder.requestData();
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       mediaRecorder.stop();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-4xl mx-auto">
//         {!showPicker && (
//           <div className="bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 mb-6">
//               <Video className="w-6 h-6" />
//               Screen Recorder
//             </h2>

//             <button
//               onClick={isRecording ? stopRecording : handleStartRecording}
//               className={`w-full py-3 px-4 rounded-md flex items-center justify-center gap-2 text-white font-medium ${
//                 isRecording
//                   ? "bg-red-600 hover:bg-red-700"
//                   : "bg-blue-600 hover:bg-blue-700"
//               } transition-colors`}
//             >
//               {isRecording ? (
//                 <>
//                   <Video className="w-5 h-5" />
//                   Stop Recording
//                 </>
//               ) : (
//                 <>
//                   <Video className="w-5 h-5" />
//                   Start Recording
//                 </>
//               )}
//             </button>
//           </div>
//         )}

//         {showPicker && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
//               <div className="p-4 border-b flex justify-between items-center">
//                 <h3 className="text-lg font-semibold">Choose what to share</h3>
//                 <button
//                   onClick={() => setShowPicker(false)}
//                   className="p-2 hover:bg-gray-100 rounded-full"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* Tabs */}
//               <div className="flex border-b">
//                 <button
//                   className={`px-6 py-3 font-medium text-sm ${
//                     activeTab === "fullscreen"
//                       ? "border-b-2 border-blue-500 text-blue-600"
//                       : "text-gray-500 hover:text-gray-700"
//                   }`}
//                   onClick={() => setActiveTab("fullscreen")}
//                 >
//                   Entire Screen
//                 </button>
//                 <button
//                   className={`px-6 py-3 font-medium text-sm ${
//                     activeTab === "screen"
//                       ? "border-b-2 border-blue-500 text-blue-600"
//                       : "text-gray-500 hover:text-gray-700"
//                   }`}
//                   onClick={() => setActiveTab("screen")}
//                 >
//                   Application Window
//                 </button>
//               </div>

//               {/* Content */}
//               <div className="p-6 overflow-y-auto flex-1">
//                 <div className="grid grid-cols-2 gap-4">
//                   {activeTab === "fullscreen" && (
//                     <>
//                       {getScreens().map((screen) => (
//                         <button
//                           key={screen.id}
//                           onClick={() => startRecordingSource(screen.id)}
//                           className="group bg-white border rounded-lg p-4 hover:border-blue-500 transition-colors"
//                         >
//                           <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
//                             <img
//                               src={screen.thumbnailURL}
//                               alt={screen.name}
//                               className="w-full h-full object-contain"
//                             />
//                           </div>
//                           <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                             <Monitor className="w-4 h-4" />
//                             <span className="truncate">{screen.name}</span>
//                           </div>
//                         </button>
//                       ))}
//                     </>
//                   )}

//                   {activeTab === "screen" && (
//                     <>
//                       {getWindows().map((source) => (
//                         <button
//                           key={source.id}
//                           onClick={() => startRecordingSource(source.id)}
//                           className="group bg-white border rounded-lg p-4 hover:border-blue-500 transition-colors"
//                         >
//                           <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
//                             <img
//                               src={source.thumbnailURL}
//                               alt={source.name}
//                               className="w-full h-full object-contain"
//                             />
//                           </div>
//                           <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                             {source.appIcon && (
//                               <img
//                                 src={source.appIcon}
//                                 alt=""
//                                 className="w-4 h-4"
//                               />
//                             )}
//                             <span className="truncate">{source.name}</span>
//                           </div>
//                         </button>
//                       ))}
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ScreenRecorder;

////////////////////////////
///////////////////////////

import React, { useEffect, useState } from "react";
import { Video, Monitor, X, Maximize } from "lucide-react";

interface SourceItem {
  id: string;
  name: string;
  thumbnailURL: string;
  display_id: string;
  appIcon: string | null;
}

type TabType = "fullscreen" | "screen";

const ScreenRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [showPicker, setShowPicker] = useState(false);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("fullscreen");
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [platform, setPlatform] = useState<string>("");

  // Get screens and windows separately
  const getScreens = () => {
    return sources.filter((source) => source.id.includes("screen:"));
  };

  const getWindows = () => {
    return sources.filter((source) => source.id.includes("window:"));
  };

  useEffect(() => {
    // Get platform on component mount
    (window as any).electron.getPlatform().then(setPlatform);
  }, []);

  const handleStartRecording = async () => {
    try {
      const availableSources = await (window as any).electron.getSources();
      console.log("Available sources:", availableSources);
      setSources(availableSources);
      setShowPicker(true);
    } catch (err) {
      console.error("Failed to get sources:", err);
    }
  };

  const startRecordingSource = async (sourceId?: string) => {
    try {
      console.log("Starting recording for source:", sourceId);

      if (sourceId) {
        await (window as any).electron.selectSource(sourceId);
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: platform !== "darwin",
        video: {
          frameRate: 30,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      console.log("Got media stream:", stream);

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8,opus",
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        console.log("Data available:", e.data.size);
        if (e.data.size > 0) {
          chunks.push(e.data);
          setRecordedChunks((prev) => [...prev, e.data]);
        }
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: "video/webm" });
          console.log("Created blob:", blob.size);

          const buffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(buffer);

          const filePath = await (window as any).electron.saveRecording(
            uint8Array
          );
          console.log("Recording saved to:", filePath);
        } catch (error) {
          console.error("Failed to save recording:", error);
        } finally {
          stream.getTracks().forEach((track) => track.stop());
          setRecordedChunks([]);
          setMediaRecorder(null);
          setIsRecording(false);
        }
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setShowPicker(false);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
      setShowPicker(false);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.requestData();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      mediaRecorder.stop();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {!showPicker && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 mb-6">
              <Video className="w-6 h-6" />
              Screen Recorder
            </h2>

            <button
              onClick={isRecording ? stopRecording : handleStartRecording}
              className={`w-full py-3 px-4 rounded-md flex items-center justify-center gap-2 text-white font-medium ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } transition-colors`}
            >
              {isRecording ? (
                <>
                  <Video className="w-5 h-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Start Recording
                </>
              )}
            </button>
          </div>
        )}

        {showPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Choose what to share</h3>
                <button
                  onClick={() => setShowPicker(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b">
                <button
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === "fullscreen"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("fullscreen")}
                >
                  Entire Screen
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === "screen"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("screen")}
                >
                  Application Window
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {activeTab === "fullscreen" && (
                    <>
                      {getScreens().map((screen) => (
                        <button
                          key={screen.id}
                          onClick={() => startRecordingSource(screen.id)}
                          className="group bg-white border rounded-lg p-4 hover:border-blue-500 transition-colors"
                        >
                          <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                            <img
                              src={screen.thumbnailURL}
                              alt={screen.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Monitor className="w-4 h-4" />
                            <span className="truncate">{screen.name}</span>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {activeTab === "screen" && (
                    <>
                      {getWindows().map((source) => (
                        <button
                          key={source.id}
                          onClick={() => startRecordingSource(source.id)}
                          className="group bg-white border rounded-lg p-4 hover:border-blue-500 transition-colors"
                        >
                          <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                            <img
                              src={source.thumbnailURL}
                              alt={source.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            {source.appIcon && (
                              <img
                                src={source.appIcon}
                                alt=""
                                className="w-4 h-4"
                              />
                            )}
                            <span className="truncate">{source.name}</span>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenRecorder;
