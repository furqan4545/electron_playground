// import React, { useEffect, useRef, useState } from "react";

// interface CameraWindowProps {
//   isMainRecording?: boolean; // Prop to sync with main recording state
//   selectedCameraId?: string; // Optional camera device selection
// }

// const CameraWindow = ({
//   isMainRecording = false,
//   selectedCameraId,
// }: CameraWindowProps) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const [chunks, setChunks] = useState<Blob[]>([]);
//   const [isRecording, setIsRecording] = useState(false);

//   // Add ref for the container
//   const containerRef = useRef<HTMLDivElement>(null);

//   // Add resize observer to handle centering
//   useEffect(() => {
//     if (!containerRef.current) return;

//     const resizeObserver = new ResizeObserver(() => {
//       if (videoRef.current) {
//         // Update video object-position to keep face centered
//         videoRef.current.style.objectPosition = "center center";
//       }
//     });

//     // const resizeObserver = new ResizeObserver(() => {
//     //   if (videoRef.current) {
//     //     // Focus on horizontal centering with scale adjustment
//     //     videoRef.current.style.transform = "translateX(-50%) scale(1.01)";
//     //     videoRef.current.style.left = "50%";
//     //     videoRef.current.style.position = "relative";
//     //   }
//     // });

//     resizeObserver.observe(containerRef.current);

//     return () => {
//       resizeObserver.disconnect();
//     };
//   }, []);

//   // Start camera
//   useEffect(() => {
//     let stream: MediaStream | null = null;

//     const startCamera = async () => {
//       try {
//         stream = await navigator.mediaDevices.getUserMedia({
//           video: {
//             width: 320,
//             height: 240,
//             deviceId: selectedCameraId
//               ? { exact: selectedCameraId }
//               : undefined,
//           },
//           audio: false,
//         });

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       } catch (error) {
//         console.error("Error accessing camera:", error);
//       }
//     };

//     startCamera();

//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [selectedCameraId]); // Restart camera when device changes

//   // Handle recording based on main recording state
//   useEffect(() => {
//     if (isMainRecording) {
//       startRecording();
//     } else if (isRecording) {
//       stopRecording();
//     }
//   }, [isMainRecording]);

//   const startRecording = () => {
//     if (!videoRef.current?.srcObject) return;

//     const recorder = new MediaRecorder(
//       videoRef.current.srcObject as MediaStream,
//       {
//         mimeType: "video/webm;codecs=vp8",
//         videoBitsPerSecond: 1000000, // 1 Mbps
//       }
//     );

//     const recordedChunks: Blob[] = [];

//     recorder.ondataavailable = (e) => {
//       if (e.data.size > 0) {
//         recordedChunks.push(e.data);
//         setChunks((prev) => [...prev, e.data]);
//       }
//     };

//     recorder.onstop = async () => {
//       try {
//         const blob = new Blob(recordedChunks, { type: "video/webm" });
//         const buffer = await blob.arrayBuffer();
//         await (window as any).electron.saveCameraRecording(
//           new Uint8Array(buffer)
//         );
//         console.log("Camera recording saved");
//       } catch (error) {
//         console.error("Failed to save camera recording:", error);
//       } finally {
//         setChunks([]);
//         setIsRecording(false);
//       }
//     };

//     recorder.start(1000);
//     mediaRecorderRef.current = recorder;
//     setIsRecording(true);
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current?.state !== "inactive") {
//       mediaRecorderRef.current?.requestData(); // Get the last chunk
//       setTimeout(() => {
//         mediaRecorderRef.current?.stop();
//       }, 100);
//     }
//   };

//   // Add draggable functionality
//   const handleMouseDown = (e: React.MouseEvent) => {
//     if (e.button !== 0) return; // Only handle left click

//     // Store initial mouse position
//     const initialX = e.clientX;
//     const initialY = e.clientY;

//     const handleMouseMove = (e: MouseEvent) => {
//       // Calculate the movement delta from the initial position
//       const deltaX = e.clientX - initialX;
//       const deltaY = e.clientY - initialY;

//       (window as any).electron.moveWindow(deltaX, deltaY);
//     };

//     const handleMouseUp = () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseup", handleMouseUp);
//     };

//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", handleMouseUp);

//     // Prevent text selection during drag
//     e.preventDefault();
//   };

//   return (
//     <div
//       ref={containerRef}
//       className="rounded-lg overflow-hidden shadow-2xl bg-transparent cursor-move relative"
//       onMouseDown={handleMouseDown}
//       style={{
//         WebkitUserSelect: "none",
//         userSelect: "none",
//         // @ts-ignore
//         WebkitAppRegion: "drag",
//         // @ts-ignore
//         WebkitDragRegion: "drag",
//         minWidth: "160px", // Minimum width
//         minHeight: "120px", // Minimum height
//       }}
//     >
//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         className="w-full h-full object-cover"
//         style={{
//           pointerEvents: "none",
//           objectFit: "cover",
//           objectPosition: "center center",
//           transform: "translateX(-50%) scale(1.15)", // Initial centering and slight scale
//           left: "50%",
//           position: "relative",
//         }}
//       />
//       {isRecording && (
//         <div className="absolute top-2 right-2">
//           <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default CameraWindow;

//////////////////////////////////////////////////////////////

import React, { useEffect, useRef, useState } from "react";

interface CameraWindowProps {
  isMainRecording?: boolean; // Prop to sync with main recording state
  selectedCameraId?: string; // Optional camera device selection
}

const CameraWindow = ({
  isMainRecording = false,
  selectedCameraId,
}: CameraWindowProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Add ref for the container
  const containerRef = useRef<HTMLDivElement>(null);

  // Add resize observer to handle centering
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (videoRef.current) {
        // Update video object-position to keep face centered
        videoRef.current.style.objectPosition = "center center";
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Start camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1480,
            height: 1480,
            deviceId: selectedCameraId
              ? { exact: selectedCameraId }
              : undefined,
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedCameraId]); // Restart camera when device changes

  // Handle recording based on main recording state
  useEffect(() => {
    if (isMainRecording) {
      startRecording();
    } else if (isRecording) {
      stopRecording();
    }
  }, [isMainRecording]);

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;

    const recorder = new MediaRecorder(
      videoRef.current.srcObject as MediaStream,
      {
        mimeType: "video/webm;codecs=vp8",
        videoBitsPerSecond: 1000000, // 1 Mbps
      }
    );

    const recordedChunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
        setChunks((prev) => [...prev, e.data]);
      }
    };

    recorder.onstop = async () => {
      try {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const buffer = await blob.arrayBuffer();
        await (window as any).electron.saveCameraRecording(
          new Uint8Array(buffer)
        );
        console.log("Camera recording saved");
      } catch (error) {
        console.error("Failed to save camera recording:", error);
      } finally {
        setChunks([]);
        setIsRecording(false);
      }
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.requestData(); // Get the last chunk
      setTimeout(() => {
        mediaRecorderRef.current?.stop();
      }, 100);
    }
  };

  // Add draggable functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click

    // Store initial mouse position
    const initialX = e.clientX;
    const initialY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate the movement delta from the initial position
      const deltaX = e.clientX - initialX;
      const deltaY = e.clientY - initialY;

      (window as any).electron.moveWindow(deltaX, deltaY);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Prevent text selection during drag
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      className="rounded-lg overflow-hidden shadow-2xl bg-transparent cursor-move relative"
      onMouseDown={handleMouseDown}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        // @ts-ignore
        WebkitAppRegion: "drag",
        // @ts-ignore
        WebkitDragRegion: "drag",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        style={{
          pointerEvents: "none",
          objectFit: "cover",
          objectPosition: "center center",
          transform: "translateX(-5%) translateY(-5%) scale(1.4)",
          position: "relative",
          overflow: "hidden",
        }}
      />
      {isRecording && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default CameraWindow;
