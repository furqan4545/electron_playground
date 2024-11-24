// import React, { useCallback, useEffect, useState } from "react";
// import { Video, Monitor, X, Maximize, Mic } from "lucide-react";

// interface SourceItem {
//   id: string;
//   name: string;
//   thumbnailURL: string;
//   display_id: string;
//   appIcon: string | null;
// }

// type TabType = "fullscreen" | "screen";

// // Quality configuration
// const QUALITY_PRESETS = {
//   high: {
//     videoBitsPerSecond: 8000000, // 8 Mbps
//     frameRate: 60,
//     width: 3840, // 4K
//     height: 2160,
//   },
//   medium: {
//     videoBitsPerSecond: 2500000, // 2.5 Mbps
//     frameRate: 30,
//     width: 1920, // 1080p
//     height: 1080,
//   },
//   low: {
//     videoBitsPerSecond: 1000000, // 1 Mbps
//     frameRate: 30,
//     width: 1280, // 720p
//     height: 720,
//   },
// };

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

//   const [quality, setQuality] = useState<"high" | "medium" | "low">("high");

//   const [includeMic, setIncludeMic] = useState(true);
//   const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
//   const [selectedMicId, setSelectedMicId] = useState<string>("");

//   // Camera controls
//   const [includeCamera, setIncludeCamera] = useState(false);
//   const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
//   const [selectedCameraId, setSelectedCameraId] = useState<string>("");

//   // Camera recording
//   const [cameraRecorder, setCameraRecorder] = useState<MediaRecorder | null>(
//     null
//   );
//   const [cameraChunks, setCameraChunks] = useState<Blob[]>([]);

//   const [recordedFiles, setRecordedFiles] = useState<{
//     screen?: string;
//     camera?: string;
//     cursorData?: string;
//   }>({});

//   /////////////////////////// experimental code for native module /////////////////////////

//   /////////////////////////// experimental end for native module /////////////////////////

//   const handleCameraRecordingSave = (filePath: string) => {
//     setRecordedFiles((prev) => ({
//       ...prev,
//       camera: filePath,
//     }));
//   };

//   const handleScreenRecordingSave = (filePath: string) => {
//     setRecordedFiles((prev) => ({
//       ...prev,
//       screen: filePath,
//     }));
//   };

//   // Add this effect to clean up states when component unmounts.. for cursor data
//   useEffect(() => {
//     return () => {
//       setIsRecording(false);

//       if (mediaRecorder) {
//         mediaRecorder.stream.getTracks().forEach((track) => track.stop());
//       }
//       if (cameraRecorder) {
//         cameraRecorder.stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   // Add this effect to monitor recordedFiles changes
//   useEffect(() => {
//     if (recordedFiles.screen && recordedFiles.camera) {
//       console.log("All recordings saved:", recordedFiles);
//       // Handle completion here if needed
//       setRecordedFiles({}); // Reset for next recording
//     }
//   }, [recordedFiles]);

//   // Get screens and windows separately
//   const getScreens = () => {
//     return sources.filter((source) => source.id.includes("screen:"));
//   };

//   const getWindows = () => {
//     return sources.filter((source) => source.id.includes("window:"));
//   };

//   // get the devices
//   useEffect(() => {
//     async function getDevices() {
//       try {
//         const devices = await navigator.mediaDevices.enumerateDevices();
//         const mics = devices.filter((device) => device.kind === "audioinput");
//         const cameras = devices.filter(
//           (device) => device.kind === "videoinput"
//         );

//         setMicDevices(mics);
//         setCameraDevices(cameras);

//         if (mics.length > 0) setSelectedMicId(mics[0].deviceId);
//         if (cameras.length > 0) setSelectedCameraId(cameras[0].deviceId);
//       } catch (err) {
//         console.error("Error getting devices:", err);
//       }
//     }

//     getDevices();
//   }, []);

//   // Get platform
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

//       // Start cursor tracking first
//       console.log("Starting cursor tracking...");
//       await (window as any).electron.startCursorTracking();

//       // if (sourceId) {
//       //   await (window as any).electron.selectSource(sourceId);
//       // }
//       if (sourceId) {
//         // First select the source
//         const sourceSelected = await (window as any).electron.selectSource(
//           sourceId
//         );
//         if (!sourceSelected) {
//           console.error("Failed to select source");
//           return;
//         }
//         console.log("Source selected successfully");

//         // Then start cursor tracking
//         const trackingStarted = await (
//           window as any
//         ).electron.startCursorTracking();
//         if (!trackingStarted) {
//           console.error("Failed to start cursor tracking");
//           return;
//         }
//         console.log("Cursor tracking started successfully");
//       }

//       const qualityPreset = QUALITY_PRESETS[quality];

//       const displayStream = await navigator.mediaDevices.getDisplayMedia({
//         audio: platform !== "darwin",
//         video: {
//           frameRate: { ideal: qualityPreset.frameRate },
//           width: { ideal: qualityPreset.width },
//           height: { ideal: qualityPreset.height },
//           // Additional constraints for quality
//           logicalSurface: true, // Capture logical pixels for higher quality
//           cursor: "always", // Always show cursor
//           resizeMode: "crop-and-scale", // Maintain aspect ratio
//         } as MediaTrackConstraints,
//       });

//       console.log("Got media displayStream:", displayStream);

//       // Apply quality settings to the video track
//       const videoTrack = displayStream.getVideoTracks()[0];
//       const capabilities = videoTrack.getCapabilities();
//       console.log("Track capabilities:", capabilities);

//       try {
//         await videoTrack.applyConstraints({
//           width: { ideal: qualityPreset.width },
//           height: { ideal: qualityPreset.height },
//           frameRate: { ideal: qualityPreset.frameRate },
//         });
//       } catch (e) {
//         console.warn("Couldn't apply all constraints:", e);
//       }

//       /////////////////////////////////
//       // If microphone is enabled, get microphone stream
//       let finalStream = displayStream;
//       if (includeMic) {
//         try {
//           const micStream = await navigator.mediaDevices.getUserMedia({
//             audio: {
//               deviceId: selectedMicId ? { exact: selectedMicId } : undefined,
//               echoCancellation: true,
//               noiseSuppression: true,
//               autoGainControl: true,
//             },
//             video: false,
//           });

//           // Combine display and microphone streams
//           finalStream = new MediaStream([
//             ...displayStream.getVideoTracks(),
//             ...displayStream.getAudioTracks(),
//             ...micStream.getAudioTracks(),
//           ]);
//         } catch (micError) {
//           console.error("Failed to get microphone access:", micError);
//           // Continue with just display audio if mic fails
//         }
//       }

//       /////////////////////////////////
//       // Camera recording begin
//       if (includeCamera) {
//         try {
//           const cameraStream = await navigator.mediaDevices.getUserMedia({
//             video: {
//               deviceId: selectedCameraId
//                 ? { exact: selectedCameraId }
//                 : undefined,
//             },
//             audio: false,
//           });

//           const camRecorder = new MediaRecorder(cameraStream, {
//             mimeType: "video/webm;codecs=vp8",
//             videoBitsPerSecond: 1000000,
//           });

//           const camChunks: Blob[] = [];

//           camRecorder.ondataavailable = (e) => {
//             if (e.data.size > 0) {
//               camChunks.push(e.data);
//               setCameraChunks((prev) => [...prev, e.data]);
//             }
//           };

//           camRecorder.onstop = async () => {
//             try {
//               const blob = new Blob(camChunks, { type: "video/webm" });
//               const buffer = await blob.arrayBuffer();
//               const filePath = await (
//                 window as any
//               ).electron.saveCameraRecording(new Uint8Array(buffer));
//               console.log("Camera recording saved to:", filePath);
//               handleCameraRecordingSave(filePath);
//             } catch (error) {
//               console.error("Failed to save camera recording:", error);
//             } finally {
//               cameraStream.getTracks().forEach((track) => track.stop());
//               setCameraChunks([]);
//               setCameraRecorder(null);
//             }
//           };

//           camRecorder.start(1000);
//           setCameraRecorder(camRecorder);
//         } catch (error) {
//           console.error("Failed to start camera recording:", error);
//         }
//       }
//       ///////////////////////////////// camera recording above ///////

//       const recorder = new MediaRecorder(finalStream, {
//         mimeType: "video/webm;codecs=vp8,opus",
//         videoBitsPerSecond: qualityPreset.videoBitsPerSecond,
//         audioBitsPerSecond: 128000, // 128 kbps audio
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
//           handleScreenRecordingSave(filePath); // Add this line
//         } catch (error) {
//           console.error("Failed to save recording:", error);
//         } finally {
//           finalStream.getTracks().forEach((track) => track.stop());
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
//       try {
//         await (window as any).electron.stopCursorTracking();
//       } catch (e) {
//         console.error("Failed to stop cursor tracking after error:", e);
//       }
//       setIsRecording(false);
//       setShowPicker(false);
//     }
//   };

//   const stopRecording = async () => {
//     console.log("Stopping all recordings...");

//     try {
//       // Stop recordings in sequence with proper timing
//       const stopSequence = async () => {
//         // 1. Stop cursor tracking first
//         console.log("Stopping cursor tracking...");
//         const cursorDataPath = await (
//           window as any
//         ).electron.stopCursorTracking();

//         // Update recorded files with cursor data path
//         setRecordedFiles((prev) => ({
//           ...prev,
//           cursorData: cursorDataPath,
//         }));

//         // 2. Stop screen recording
//         if (mediaRecorder && mediaRecorder.state !== "inactive") {
//           console.log("Stopping screen recording...");
//           mediaRecorder.requestData();
//           await new Promise((resolve) => setTimeout(resolve, 1000));
//           mediaRecorder.stop();
//         }

//         // 3. Stop camera recording
//         if (cameraRecorder && cameraRecorder.state !== "inactive") {
//           console.log("Stopping camera recording...");
//           cameraRecorder.requestData();
//           await new Promise((resolve) => setTimeout(resolve, 1000));
//           cameraRecorder.stop();
//         }
//       };

//       await stopSequence();
//       setIsRecording(false);
//     } catch (error) {
//       console.error("Error stopping recordings:", error);
//       // Ensure we still set recording state to false even if there's an error
//       setIsRecording(false);
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

//             {/* Quality Selector */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Recording Quality
//               </label>
//               <select
//                 value={quality}
//                 onChange={(e) =>
//                   setQuality(e.target.value as "high" | "medium" | "low")
//                 }
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
//               >
//                 <option value="high">High Quality (4K @ 60fps)</option>
//                 <option value="medium">Medium Quality (1080p @ 30fps)</option>
//                 <option value="low">Low Quality (720p @ 30fps)</option>
//               </select>
//               <p className="mt-1 text-sm text-gray-500">
//                 {quality === "high" && "Best quality, larger file size"}
//                 {quality === "medium" && "Balanced quality and file size"}
//                 {quality === "low" && "Smaller file size, reduced quality"}
//               </p>
//             </div>

//             {/* Microphone Options */}
//             <div className="mb-6 space-y-4">
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   id="include-mic"
//                   checked={includeMic}
//                   onChange={(e) => setIncludeMic(e.target.checked)}
//                   className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                 />
//                 <label
//                   htmlFor="include-mic"
//                   className="text-sm font-medium text-gray-700 flex items-center gap-2"
//                 >
//                   <Mic className="w-4 h-4" />
//                   Include Microphone Audio
//                 </label>
//               </div>

//               {includeMic && micDevices.length > 0 && (
//                 <div className="pl-6">
//                   <select
//                     value={selectedMicId}
//                     onChange={(e) => setSelectedMicId(e.target.value)}
//                     className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
//                   >
//                     {micDevices.map((device) => (
//                       <option key={device.deviceId} value={device.deviceId}>
//                         {device.label ||
//                           `Microphone ${device.deviceId.slice(0, 5)}...`}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//             </div>
//             {/* End Microphone Options */}

//             {/* Camera Options */}
//             <div className="mb-6 space-y-4">
//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   id="include-camera"
//                   checked={includeCamera}
//                   onChange={(e) => {
//                     setIncludeCamera(e.target.checked);
//                     (window as any).electron.toggleCamera(e.target.checked);
//                   }}
//                   className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                 />
//                 <label
//                   htmlFor="include-camera"
//                   className="text-sm font-medium text-gray-700 flex items-center gap-2"
//                 >
//                   <Video className="w-4 h-4" />
//                   Include Camera Video
//                 </label>
//               </div>

//               {includeCamera && cameraDevices.length > 0 && (
//                 <div className="pl-6">
//                   <select
//                     value={selectedCameraId}
//                     onChange={(e) => setSelectedCameraId(e.target.value)}
//                     className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
//                   >
//                     {cameraDevices.map((device) => (
//                       <option key={device.deviceId} value={device.deviceId}>
//                         {device.label ||
//                           `Camera ${device.deviceId.slice(0, 5)}...`}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//             </div>
//             {/* End Camera Options */}

//             {/* Start/Stop Recording Button */}
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

import React, { useCallback, useEffect, useState } from "react";
import { Video, Monitor, X, Maximize, Mic } from "lucide-react";

interface SourceItem {
  id: string;
  name: string;
  thumbnailURL: string;
  display_id: string;
  appIcon: string | null;
}

type TabType = "fullscreen" | "screen";

// Quality configuration
const QUALITY_PRESETS = {
  high: {
    videoBitsPerSecond: 8000000, // 8 Mbps
    frameRate: 60,
    width: 3840, // 4K
    height: 2160,
  },
  medium: {
    videoBitsPerSecond: 2500000, // 2.5 Mbps
    frameRate: 30,
    width: 1920, // 1080p
    height: 1080,
  },
  low: {
    videoBitsPerSecond: 1000000, // 1 Mbps
    frameRate: 30,
    width: 1280, // 720p
    height: 720,
  },
};

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

  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");

  const [includeMic, setIncludeMic] = useState(true);
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("");

  // Camera controls
  const [includeCamera, setIncludeCamera] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");

  // Camera recording
  const [cameraRecorder, setCameraRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [cameraChunks, setCameraChunks] = useState<Blob[]>([]);

  const [recordedFiles, setRecordedFiles] = useState<{
    screen?: string;
    camera?: string;
    cursorData?: string;
  }>({});

  const handleCameraRecordingSave = (filePath: string) => {
    setRecordedFiles((prev) => ({
      ...prev,
      camera: filePath,
    }));
  };

  const handleScreenRecordingSave = (filePath: string) => {
    setRecordedFiles((prev) => ({
      ...prev,
      screen: filePath,
    }));
  };

  // Add this effect to clean up states when component unmounts.. for cursor data
  useEffect(() => {
    return () => {
      setIsRecording(false);

      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
      if (cameraRecorder) {
        cameraRecorder.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Add this effect to monitor recordedFiles changes
  useEffect(() => {
    if (recordedFiles.screen && recordedFiles.camera) {
      console.log("All recordings saved:", recordedFiles);
      // Handle completion here if needed
      setRecordedFiles({}); // Reset for next recording
    }
  }, [recordedFiles]);

  // Get screens and windows separately
  const getScreens = () => {
    return sources.filter((source) => source.id.includes("screen:"));
  };

  const getWindows = () => {
    return sources.filter((source) => source.id.includes("window:"));
  };

  // get the devices
  useEffect(() => {
    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter((device) => device.kind === "audioinput");
        const cameras = devices.filter(
          (device) => device.kind === "videoinput"
        );

        setMicDevices(mics);
        setCameraDevices(cameras);

        if (mics.length > 0) setSelectedMicId(mics[0].deviceId);
        if (cameras.length > 0) setSelectedCameraId(cameras[0].deviceId);
      } catch (err) {
        console.error("Error getting devices:", err);
      }
    }

    getDevices();
  }, []);

  // Get platform
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

      // Start cursor tracking first
      console.log("Starting cursor tracking...");
      await (window as any).electron.startCursorTracking();

      // if (sourceId) {
      //   await (window as any).electron.selectSource(sourceId);
      // }
      if (sourceId) {
        // First select the source
        const sourceSelected = await (window as any).electron.selectSource(
          sourceId
        );
        if (!sourceSelected) {
          console.error("Failed to select source");
          return;
        }
        console.log("Source selected successfully");

        // Then start cursor tracking
        const trackingStarted = await (
          window as any
        ).electron.startCursorTracking();
        if (!trackingStarted) {
          console.error("Failed to start cursor tracking");
          return;
        }
        console.log("Cursor tracking started successfully");
      }

      const qualityPreset = QUALITY_PRESETS[quality];

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        audio: platform !== "darwin",
        video: {
          frameRate: { ideal: qualityPreset.frameRate },
          width: { ideal: qualityPreset.width },
          height: { ideal: qualityPreset.height },
          // Additional constraints for quality
          logicalSurface: true, // Capture logical pixels for higher quality
          cursor: "always", // Always show cursor
          resizeMode: "crop-and-scale", // Maintain aspect ratio
        } as MediaTrackConstraints,
      });

      console.log("Got media displayStream:", displayStream);

      // Apply quality settings to the video track
      const videoTrack = displayStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      console.log("Track capabilities:", capabilities);

      try {
        await videoTrack.applyConstraints({
          width: { ideal: qualityPreset.width },
          height: { ideal: qualityPreset.height },
          frameRate: { ideal: qualityPreset.frameRate },
        });
      } catch (e) {
        console.warn("Couldn't apply all constraints:", e);
      }

      /////////////////////////////////
      // If microphone is enabled, get microphone stream
      let finalStream = displayStream;
      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: selectedMicId ? { exact: selectedMicId } : undefined,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: false,
          });

          // Combine display and microphone streams
          finalStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...displayStream.getAudioTracks(),
            ...micStream.getAudioTracks(),
          ]);
        } catch (micError) {
          console.error("Failed to get microphone access:", micError);
          // Continue with just display audio if mic fails
        }
      }

      /////////////////////////////////
      // Camera recording begin
      if (includeCamera) {
        try {
          const cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: selectedCameraId
                ? { exact: selectedCameraId }
                : undefined,
            },
            audio: false,
          });

          const camRecorder = new MediaRecorder(cameraStream, {
            mimeType: "video/webm;codecs=vp8",
            videoBitsPerSecond: 1000000,
          });

          const camChunks: Blob[] = [];

          camRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              camChunks.push(e.data);
              setCameraChunks((prev) => [...prev, e.data]);
            }
          };

          camRecorder.onstop = async () => {
            try {
              const blob = new Blob(camChunks, { type: "video/webm" });
              const buffer = await blob.arrayBuffer();
              const filePath = await (
                window as any
              ).electron.saveCameraRecording(new Uint8Array(buffer));
              console.log("Camera recording saved to:", filePath);
              handleCameraRecordingSave(filePath);
            } catch (error) {
              console.error("Failed to save camera recording:", error);
            } finally {
              cameraStream.getTracks().forEach((track) => track.stop());
              setCameraChunks([]);
              setCameraRecorder(null);
            }
          };

          camRecorder.start(1000);
          setCameraRecorder(camRecorder);
        } catch (error) {
          console.error("Failed to start camera recording:", error);
        }
      }
      ///////////////////////////////// camera recording above ///////

      const recorder = new MediaRecorder(finalStream, {
        mimeType: "video/webm;codecs=vp8,opus",
        videoBitsPerSecond: qualityPreset.videoBitsPerSecond,
        audioBitsPerSecond: 128000, // 128 kbps audio
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
          handleScreenRecordingSave(filePath); // Add this line
        } catch (error) {
          console.error("Failed to save recording:", error);
        } finally {
          finalStream.getTracks().forEach((track) => track.stop());
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
      try {
        await (window as any).electron.stopCursorTracking();
      } catch (e) {
        console.error("Failed to stop cursor tracking after error:", e);
      }
      setIsRecording(false);
      setShowPicker(false);
    }
  };

  const stopRecording = async () => {
    console.log("Stopping all recordings...");

    try {
      // Stop recordings in sequence with proper timing
      const stopSequence = async () => {
        // 1. Stop cursor tracking first
        console.log("Stopping cursor tracking...");
        const cursorDataPath = await (
          window as any
        ).electron.stopCursorTracking();

        // Update recorded files with cursor data path
        setRecordedFiles((prev) => ({
          ...prev,
          cursorData: cursorDataPath,
        }));

        // 2. Stop screen recording
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          console.log("Stopping screen recording...");
          mediaRecorder.requestData();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          mediaRecorder.stop();
        }

        // 3. Stop camera recording
        if (cameraRecorder && cameraRecorder.state !== "inactive") {
          console.log("Stopping camera recording...");
          cameraRecorder.requestData();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          cameraRecorder.stop();
        }
      };

      await stopSequence();
      setIsRecording(false);
    } catch (error) {
      console.error("Error stopping recordings:", error);
      // Ensure we still set recording state to false even if there's an error
      setIsRecording(false);
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

            {/* Quality Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recording Quality
              </label>
              <select
                value={quality}
                onChange={(e) =>
                  setQuality(e.target.value as "high" | "medium" | "low")
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
              >
                <option value="high">High Quality (4K @ 60fps)</option>
                <option value="medium">Medium Quality (1080p @ 30fps)</option>
                <option value="low">Low Quality (720p @ 30fps)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {quality === "high" && "Best quality, larger file size"}
                {quality === "medium" && "Balanced quality and file size"}
                {quality === "low" && "Smaller file size, reduced quality"}
              </p>
            </div>

            {/* Microphone Options */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="include-mic"
                  checked={includeMic}
                  onChange={(e) => setIncludeMic(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="include-mic"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  Include Microphone Audio
                </label>
              </div>

              {includeMic && micDevices.length > 0 && (
                <div className="pl-6">
                  <select
                    value={selectedMicId}
                    onChange={(e) => setSelectedMicId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
                  >
                    {micDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label ||
                          `Microphone ${device.deviceId.slice(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {/* End Microphone Options */}

            {/* Camera Options */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="include-camera"
                  checked={includeCamera}
                  onChange={(e) => {
                    setIncludeCamera(e.target.checked);
                    (window as any).electron.toggleCamera(e.target.checked);
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor="include-camera"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Include Camera Video
                </label>
              </div>

              {includeCamera && cameraDevices.length > 0 && (
                <div className="pl-6">
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
                  >
                    {cameraDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label ||
                          `Camera ${device.deviceId.slice(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {/* End Camera Options */}

            {/* Start/Stop Recording Button */}
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
