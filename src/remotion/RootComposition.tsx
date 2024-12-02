/// WORKING PERFECT with TIMING

// import React from 'react';
// import { CalculateMetadataFunction, Composition } from 'remotion';
// import { Video, staticFile } from 'remotion';
// import { ZoomAndPanEffect } from '../ui/components/ZoomAndPanEffect';
// import type { RecordingData } from '../ui/types/recording';

// type RemotionVideoProps = Record<string, unknown> & {
//   videoUrl: string;
//   cursorData: RecordingData;
// };

// const RemotionVideo: React.FC<RemotionVideoProps> = ({videoUrl, cursorData}) => {
//   return (
//     <ZoomAndPanEffect cursorData={cursorData}>
//       <Video 
//         src={staticFile(videoUrl)} 
//         style={{
//           width: '100%',
//           height: '100%',
//           objectFit: 'contain'
//         }}
//       />
//     </ZoomAndPanEffect>
//   );
// };

// const calculateMetadata: CalculateMetadataFunction<RemotionVideoProps> = ({props}) => {
//   if (!props.cursorData) {
//     return {
//       durationInFrames: 900,
//       fps: 30,
//       width: 1920,
//       height: 1080,
//       props
//     };
//   }

//   return {
//     durationInFrames: Math.floor((props.cursorData.recording_info.duration * props.cursorData.recording_info.frame_rate) / 1000),
//     fps: props.cursorData.recording_info.frame_rate,
//     width: props.cursorData.recording_info.global_window_dimension.width,
//     height: props.cursorData.recording_info.global_window_dimension.height,
//     props
//   };
// };

// const RootComposition: React.FC = () => {
//   return (
//     <Composition
//       id="ZoomVideo"
//       component={RemotionVideo}
//       durationInFrames={900}
//       fps={30}
//       width={1920}
//       height={1080}
//       defaultProps={{
//         videoUrl: '',
//         cursorData: {} as RecordingData
//       }}
//       calculateMetadata={calculateMetadata}
//     />
//   );
// };

// export default RootComposition;

////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////// TESTING ///

import React from 'react';
import { CalculateMetadataFunction, Composition } from 'remotion';
import { Video, staticFile } from 'remotion';
import { ZoomAndPanEffect } from '../ui/components/ZoomAndPanEffect';
import type { RecordingData } from '../ui/types/recording';

type RemotionVideoProps = Record<string, unknown> & {
  videoUrl: string;
  cursorData: RecordingData;
};

const RemotionVideo: React.FC<RemotionVideoProps> = ({videoUrl, cursorData}) => {
  return (
    <ZoomAndPanEffect cursorData={cursorData}>
      <Video 
        src={staticFile(videoUrl)} 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </ZoomAndPanEffect>
  );
};

const calculateMetadata: CalculateMetadataFunction<RemotionVideoProps> = ({props}) => {
  if (!props.cursorData) {
    return {
      durationInFrames: 900,
      fps: 30,
      width: 1920,
      height: 1080,
      props
    };
  }

  return {
    durationInFrames: Math.floor((props.cursorData.recording_info.duration * props.cursorData.recording_info.frame_rate) / 1000),
    fps: props.cursorData.recording_info.frame_rate,
    width: props.cursorData.recording_info.global_window_dimension.width,
    height: props.cursorData.recording_info.global_window_dimension.height,
    props
  };
};

const RootComposition: React.FC = () => {
  return (
    <Composition
      id="ZoomVideo"
      component={RemotionVideo}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        videoUrl: '',
        cursorData: {} as RecordingData
      }}
      calculateMetadata={calculateMetadata}
    />
  );
};

export default RootComposition;