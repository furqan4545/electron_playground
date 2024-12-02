
// import React, { useEffect, useState } from 'react';
// import { Player } from '@remotion/player';
// import { OffthreadVideo } from 'remotion';  
// import { ArrowLeft } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import type { RecordingData } from '../types/recording';

// const RemotionVideo = ({ videoSrc }: { videoSrc: string }) => {
//   return (
//     <div style={{
//       flex: 1,
//       backgroundColor: 'black',
//       width: '100%',
//       height: '100%',
//       position: 'relative'
//     }}>
//       <OffthreadVideo 
//         src={videoSrc}
//         style={{
//           width: '100%',
//           height: '100%',
//           objectFit: 'contain'
//         }}
//         startFrom={0}
//         playbackRate={1}
//       />
//     </div>
//   );
// };

// const VideoPlayer = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [videoUrl, setVideoUrl] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Get duration in frames from the JSON data
//   const getDurationInFrames = () => {
//     const recordingData = location.state?.recordingData as RecordingData;
//     if (!recordingData) return 900; // fallback to default 30 seconds

//     // Convert milliseconds to frames
//     const durationInSeconds = recordingData.recording_info.duration / 1000;
//     const frameRate = recordingData.recording_info.frame_rate || 30;
//     const frames = Math.ceil(durationInSeconds * frameRate);

//     console.log('Duration from JSON:', {
//       durationMs: recordingData.recording_info.duration,
//       durationSec: durationInSeconds,
//       frameRate,
//       frames
//     });

//     return frames;
//   };


//   useEffect(() => {
//     const loadVideo = async () => {
//       if (!location.state?.videoUrl) return;

//       try {
//         setIsLoading(true);
//         const filePath = location.state.videoUrl;
//         console.log('Loading video from:', filePath);

//         const videoStream = await (window as any).electron.getVideoStream(filePath);
//         const blob = new Blob([videoStream.buffer], { 
//           type: 'video/webm;codecs=vp8,opus' 
//         });
//         const blobUrl = URL.createObjectURL(blob);
//         setVideoUrl(blobUrl);
//         setIsLoading(false);
//       } catch (err) {
//         console.error('Error loading video:', err);
//         setIsLoading(false);
//       }
//     };

//     loadVideo();

//     return () => {
//       if (videoUrl) {
//         URL.revokeObjectURL(videoUrl);
//       }
//     };
//   }, [location.state]);

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-4xl mx-auto">
//         <button
//           onClick={() => navigate('/')}
//           className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
//         >
//           <ArrowLeft className="w-4 h-4" /> Back to Recorder
//         </button>
        
//         <div className="bg-white rounded-lg shadow-lg p-6">
//           <h2 className="text-2xl font-bold mb-6">Video Player</h2>
//           {isLoading ? (
//             <div className="aspect-video bg-gray-100 flex items-center justify-center">
//               <div className="text-gray-500">Loading video...</div>
//             </div>
//           ) : videoUrl ? (
//             <div className="aspect-video">
//               <Player
//                 component={() => <RemotionVideo videoSrc={videoUrl} />}
//                 // durationInFrames={900} // 30 seconds * 30fps
//                 durationInFrames={getDurationInFrames()}
//                 compositionWidth={1920}
//                 compositionHeight={1080}
//                 fps={30}
//                 controls
//                 style={{
//                   width: '100%',
//                   height: '100%',
//                 }}
//                 className="rounded-lg overflow-hidden"
//                 showVolumeControls
//                 allowFullscreen
//                 clickToPlay
//               />
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoPlayer;

////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////// Working ////////////////////////////////

// import React, { useEffect, useState } from 'react';
// import { Player } from '@remotion/player';
// import { OffthreadVideo } from 'remotion';  
// import { ArrowLeft } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import type { RecordingData } from '../types/recording';
// import { ZoomAndPanEffect } from './ZoomAndPanEffect';

// // Create a base video component that will be used by ZoomAndPanEffect
// export const VideoComponent = ({ videoSrc }: { videoSrc: string }) => {
//   return (
//     <OffthreadVideo 
//       src={videoSrc}
//       style={{
//         width: '100%',
//         height: '100%',
//         objectFit: 'contain'
//       }}
//     />
//   );
// };

// // Main Composition component that includes ZoomAndPanEffect
// const MainComposition = ({ videoSrc, cursorData }: { videoSrc: string, cursorData: RecordingData }) => {
//   return (
//     <ZoomAndPanEffect cursorData={cursorData}>
//       <VideoComponent videoSrc={videoSrc} />
//     </ZoomAndPanEffect>
//   );
// };

// const VideoPlayer = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [videoUrl, setVideoUrl] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const getDurationInFrames = () => {
//     const recordingData = location.state?.recordingData as RecordingData;
//     if (!recordingData) return 900;

//     const durationInSeconds = recordingData.recording_info.duration / 1000;
//     const frameRate = recordingData.recording_info.frame_rate || 30;
//     const frames = Math.ceil(durationInSeconds * frameRate);

//     console.log('Duration from JSON:', {
//       durationMs: recordingData.recording_info.duration,
//       durationSec: durationInSeconds,
//       frameRate,
//       frames
//     });

//     return frames;
//   };

//   useEffect(() => {
//     const loadVideo = async () => {
//       if (!location.state?.videoUrl) return;

//       try {
//         setIsLoading(true);
//         const filePath = location.state.videoUrl;
//         console.log('Loading video from:', filePath);

//         const videoStream = await (window as any).electron.getVideoStream(filePath);
//         const blob = new Blob([videoStream.buffer], { 
//           type: 'video/webm;codecs=vp8,opus' 
//         });
//         const blobUrl = URL.createObjectURL(blob);
//         setVideoUrl(blobUrl);
//         setIsLoading(false);
//       } catch (err) {
//         console.error('Error loading video:', err);
//         setIsLoading(false);
//       }
//     };

//     loadVideo();

//     return () => {
//       if (videoUrl) {
//         URL.revokeObjectURL(videoUrl);
//       }
//     };
//   }, [location.state]);

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-4xl mx-auto">
//         <button
//           onClick={() => navigate('/')}
//           className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
//         >
//           <ArrowLeft className="w-4 h-4" /> Back to Recorder
//         </button>
        
//         <div className="bg-white rounded-lg shadow-lg p-6">
//           <h2 className="text-2xl font-bold mb-6">Video Player</h2>
//           {isLoading ? (
//             <div className="aspect-video bg-gray-100 flex items-center justify-center">
//               <div className="text-gray-500">Loading video...</div>
//             </div>
//           ) : videoUrl ? (
//             <div className="aspect-video">
//               <Player
//                 component={() => (
//                   <MainComposition 
//                     videoSrc={videoUrl} 
//                     cursorData={location.state.recordingData}
//                   />
//                 )}
//                 durationInFrames={getDurationInFrames()}
//                 // compositionWidth={1920}
//                 // compositionHeight={1080}
//                 compositionWidth={location.state.recordingData.recording_info.global_window_dimension.width}
//                 compositionHeight={location.state.recordingData.recording_info.global_window_dimension.height}
//                 fps={30}
//                 controls
//                 style={{
//                   width: '100%',
//                   height: '100%',
//                 }}
//                 className="rounded-lg overflow-hidden"
//                 showVolumeControls
//                 allowFullscreen
//                 clickToPlay
//               />
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoPlayer;

////////////////////////////////////////////////////////////
///// Test ///////////////////////////////////////////////////


// import React, { useEffect, useState } from 'react';
// import { Player } from '@remotion/player';
// import { OffthreadVideo } from 'remotion';  
// import { ArrowLeft } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import type { RecordingData } from '../types/recording';
// import { ZoomAndPanEffect } from './ZoomAndPanEffect';

// // Create a base video component that will be used by ZoomAndPanEffect
// export const VideoComponent = ({ videoSrc }: { videoSrc: string }) => {
//   return (
//     <OffthreadVideo 
//       src={videoSrc}
//       style={{
//         width: '100%',
//         height: '100%',
//         objectFit: 'contain'
//       }}
//     />
//   );
// };

// // Main Composition component that includes ZoomAndPanEffect
// const MainComposition = ({ videoSrc, cursorData }: { videoSrc: string, cursorData: RecordingData }) => {
//   return (
//     <ZoomAndPanEffect cursorData={cursorData}>
//       <VideoComponent videoSrc={videoSrc} />
//     </ZoomAndPanEffect>
//   );
// };

// const VideoPlayer = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [videoUrl, setVideoUrl] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRendering, setIsRendering] = useState(false);

//   const getDurationInFrames = () => {
//     const recordingData = location.state?.recordingData as RecordingData;
//     if (!recordingData) return 900;

//     const durationInSeconds = recordingData.recording_info.duration / 1000;
//     const frameRate = recordingData.recording_info.frame_rate || 30;
//     const frames = Math.ceil(durationInSeconds * frameRate);

//     console.log('Duration from JSON:', {
//       durationMs: recordingData.recording_info.duration,
//       durationSec: durationInSeconds,
//       frameRate,
//       frames
//     });

//     return frames;
//   };

//   const handleRender = async () => {
//     if (!videoUrl || !location.state?.recordingData) return;
    
//     try {
//       setIsRendering(true);
//       const outputPath = await (window as any).electron.renderVideo({
//         videoUrl,
//         cursorData: location.state.recordingData
//       });
      
//       console.log('Video rendered successfully:', outputPath);
//       alert(`Video rendered successfully!\nSaved to: ${outputPath}`);
//     } catch (error) {
//       console.error('Failed to render video:', error);
//       alert('Failed to render video. Check console for details.');
//     } finally {
//       setIsRendering(false);
//     }
//   };


//   useEffect(() => {
//     const loadVideo = async () => {
//       if (!location.state?.videoUrl) return;

//       try {
//         setIsLoading(true);
//         const filePath = location.state.videoUrl;
//         console.log('Loading video from:', filePath);

//         const videoStream = await (window as any).electron.getVideoStream(filePath);
//         const blob = new Blob([videoStream.buffer], { 
//           type: 'video/webm;codecs=vp8,opus' 
//         });
//         const blobUrl = URL.createObjectURL(blob);
//         setVideoUrl(blobUrl);
//         setIsLoading(false);
//       } catch (err) {
//         console.error('Error loading video:', err);
//         setIsLoading(false);
//       }
//     };

//     loadVideo();

//     return () => {
//       if (videoUrl) {
//         URL.revokeObjectURL(videoUrl);
//       }
//     };
//   }, [location.state]);

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-4xl mx-auto">
//         <button
//           onClick={() => navigate('/')}
//           className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
//         >
//           <ArrowLeft className="w-4 h-4" /> Back to Recorder
//         </button>
        
//         <div className="bg-white rounded-lg shadow-lg p-6">
//           <h2 className="text-2xl font-bold mb-6">Video Player</h2>
//           {isLoading ? (
//             <div className="aspect-video bg-gray-100 flex items-center justify-center">
//               <div className="text-gray-500">Loading video...</div>
//             </div>
//           ) : videoUrl ? (
//             <div className="aspect-video">
//               <Player
//                 component={() => (
//                   <MainComposition 
//                     videoSrc={videoUrl} 
//                     cursorData={location.state.recordingData}
//                   />
//                 )}
//                 durationInFrames={getDurationInFrames()}
//                 // compositionWidth={1920}
//                 // compositionHeight={1080}
//                 compositionWidth={location.state.recordingData.recording_info.global_window_dimension.width}
//                 compositionHeight={location.state.recordingData.recording_info.global_window_dimension.height}
//                 fps={30}
//                 controls
//                 style={{
//                   width: '100%',
//                   height: '100%',
//                 }}
//                 className="rounded-lg overflow-hidden"
//                 showVolumeControls
//                 allowFullscreen
//                 clickToPlay
//               />
//             </div>
//           ) : null}
//         </div>
//         {videoUrl && (
//           <div className="mt-4">
//             <button
//               onClick={handleRender}
//               disabled={isRendering}
//               className={`w-full py-3 px-4 rounded-md flex items-center justify-center gap-2 text-white font-medium ${
//                 isRendering 
//                   ? 'bg-gray-500 cursor-not-allowed' 
//                   : 'bg-green-600 hover:bg-green-700'
//               } transition-colors`}
//             >
//               {isRendering ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Rendering...
//                 </>
//               ) : (
//                 <>
//                   <span>Render Video</span>
//                 </>
//               )}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VideoPlayer;

//////////////////////////////////////
//////////////////////////////////////


import React, { useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { OffthreadVideo } from 'remotion';  
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RecordingData } from '../types/recording';
import { ZoomAndPanEffect } from './ZoomAndPanEffect';

// Create a base video component that will be used by ZoomAndPanEffect
export const VideoComponent = ({ videoSrc }: { videoSrc: string }) => {
  return (
    <OffthreadVideo 
      src={videoSrc}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain'
      }}
    />
  );
};

// Main Composition component that includes ZoomAndPanEffect
const MainComposition = ({ videoSrc, cursorData }: { videoSrc: string, cursorData: RecordingData }) => {
  return (
    <ZoomAndPanEffect cursorData={cursorData}>
      <VideoComponent videoSrc={videoSrc} />
    </ZoomAndPanEffect>
  );
};

const VideoPlayer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRendering, setIsRendering] = useState(false);

  const getDurationInFrames = () => {
    const recordingData = location.state?.recordingData as RecordingData;
    if (!recordingData) return 900;

    const durationInSeconds = recordingData.recording_info.duration / 1000;
    const frameRate = recordingData.recording_info.frame_rate || 30;
    const frames = Math.ceil(durationInSeconds * frameRate);

    console.log('Duration from JSON:', {
      durationMs: recordingData.recording_info.duration,
      durationSec: durationInSeconds,
      frameRate,
      frames
    });

    return frames;
  };

  const handleRender = async () => {
    if (!location.state?.videoUrl || !location.state?.recordingData) return;
  
    
    try {
      setIsRendering(true);
      const outputPath = await (window as any).electron.renderVideo({
        videoPath: location.state.videoUrl,
        cursorData: location.state.recordingData,
        outputFileName: `rendered-video-${Date.now()}.mp4`
      });
      
      console.log('Video rendered successfully:', outputPath);
      alert(`Video rendered successfully!\nSaved to: ${outputPath}`);
    } catch (error) {
      console.error('Failed to render video:', error);
      alert('Failed to render video. Check console for details.');
    } finally {
      setIsRendering(false);
    }
  };


  useEffect(() => {
    const loadVideo = async () => {
      if (!location.state?.videoUrl) return;

      try {
        setIsLoading(true);
        const filePath = location.state.videoUrl;
        console.log('Loading video from:', filePath);

        const videoStream = await (window as any).electron.getVideoStream(filePath);
        const blob = new Blob([videoStream.buffer], { 
          type: 'video/webm;codecs=vp8,opus' 
        });
        const blobUrl = URL.createObjectURL(blob);
        setVideoUrl(blobUrl);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading video:', err);
        setIsLoading(false);
      }
    };

    loadVideo();

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recorder
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Video Player</h2>
          {isLoading ? (
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-gray-500">Loading video...</div>
            </div>
          ) : videoUrl ? (
            <div className="aspect-video">
              <Player
                component={() => (
                  <MainComposition 
                    videoSrc={videoUrl} 
                    cursorData={location.state.recordingData}
                  />
                )}
                durationInFrames={getDurationInFrames()}
                // compositionWidth={1920}
                // compositionHeight={1080}
                compositionWidth={location.state.recordingData.recording_info.global_window_dimension.width}
                compositionHeight={location.state.recordingData.recording_info.global_window_dimension.height}
                fps={30}
                controls
                style={{
                  width: '100%',
                  height: '100%',
                }}
                className="rounded-lg overflow-hidden"
                showVolumeControls
                allowFullscreen
                clickToPlay
              />
            </div>
          ) : null}
        </div>
        {videoUrl && (
          <div className="mt-4">
            <button
              onClick={handleRender}
              disabled={isRendering}
              className={`w-full py-3 px-4 rounded-md flex items-center justify-center gap-2 text-white font-medium ${
                isRendering 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } transition-colors`}
            >
              {isRendering ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Rendering...
                </>
              ) : (
                <>
                  <span>Render Video</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;