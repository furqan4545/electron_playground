////////////// Perfectly working code V1 ///////////
// ZoomAndPanEffect.tsx

// import React, { useMemo } from 'react';
// import {
//   useCurrentFrame,
//   useVideoConfig,
// } from 'remotion';
// import type { RecordingData } from '../types/recording';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';

// interface ZoomAndPanEffectProps {
//   children: React.ReactNode;
//   cursorData: RecordingData;
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({ 
//   children,
//   cursorData 
// }) => {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames, width, height } = useVideoConfig();

//   // Function to get cursor position using the passed cursorData
//   const getCursorPositionAtTime = (timestamp: number) => {
//     const position = cursorData.tracking_data.find(
//       (data) =>
//         Math.abs(data.recorded_display_data.timestamp - timestamp) < 50
//     );
//     return (
//       position?.recorded_display_data ||
//       cursorData.tracking_data[0].recorded_display_data
//     );
//   };

//   // Original screen dimensions
//   const ORIGINAL_WIDTH = width;
//   const ORIGINAL_HEIGHT = height;
//   const BOX_SIZE = 100;

//   // Zoom timeline: array of { zoomDuration, zoomLevel, transitionDuration }
//   const zoomTimeline = [
//     { zoomDuration: 0, zoomLevel: 1.0, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//     { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//     { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 0 },
//   ];

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 3;

//     for (const event of zoomTimeline) {
//       const zoomEvent = {
//         ...event,
//         startTime: cumulativeTime,
//         endTime: cumulativeTime + event.zoomDuration,
//         transitionStartTime: cumulativeTime + event.zoomDuration,
//         transitionEndTime: cumulativeTime + event.zoomDuration + event.transitionDuration,
//       };
//       events.push(zoomEvent);
//       cumulativeTime += event.zoomDuration + event.transitionDuration;
//     }

//     return events;
//   }, []);

//   const totalCycleDuration = useMemo(() => 
//     zoomEvents.reduce((sum, event) => sum + event.zoomDuration + event.transitionDuration, 0), 
//     [zoomEvents]
//   );

//   // Helper functions for zoom calculations
//   const interpolateZoom = (startZoom: number, endZoom: number, progress: number) => {
//     const easedProgress = easeInOutCubic(progress);
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   const easeInOutCubic = (t: number) => {
//     return t < 0.5
//       ? 4 * t * t * t
//       : 1 - Math.pow(-2 * t + 2, 3) / 2;
//   };

//   const getZoomLevel = (frame: number) => {
//     const timeInSeconds = (frame / fps) % totalCycleDuration;
//     let zoomLevel = 1.0;

//     for (let i = 0; i < zoomEvents.length; i++) {
//       const zoomEvent = zoomEvents[i];
//       const nextZoomEvent = zoomEvents[(i + 1) % zoomEvents.length];

//       const {
//         startTime,
//         endTime,
//         transitionStartTime,
//         transitionEndTime,
//         zoomLevel: currentZoomLevel,
//         transitionDuration,
//       } = zoomEvent;

//       if (timeInSeconds >= startTime && timeInSeconds < endTime) {
//         return currentZoomLevel;
//       } else if (
//         transitionDuration > 0 && 
//         timeInSeconds >= transitionStartTime && 
//         timeInSeconds < transitionEndTime
//       ) {
//         const transitionProgress = (timeInSeconds - transitionStartTime) / transitionDuration;
//         return interpolateZoom(currentZoomLevel, nextZoomEvent.zoomLevel, transitionProgress);
//       }
//     }

//     return 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Calculate pan positions
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     for (let f = 0; f < durationInFrames; f++) {
//       const timestamp = (f / fps) * 1000;
//       const cursorPos = getCursorPositionAtTime(timestamp);

//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const maxPanX = (ORIGINAL_WIDTH * (maxZoomLevel - 1)) / 2;
//       const maxPanY = (ORIGINAL_HEIGHT * (maxZoomLevel - 1)) / 2;

//       let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
//       let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });
//     }

//     const smoothedPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;
//     const windowSize = 90;

//     for (let f = 0; f < durationInFrames; f++) {
//       const startFrame = Math.max(0, f - windowSize + 1);
//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;
//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // let alpha = 0.0001;
//       // if (movementMagnitude >= 500) alpha = 0.1;
//       // else if (movementMagnitude >= 400) alpha = 0.1;
//       // else if (movementMagnitude >= 300) alpha = 0.003;
//       // else if (movementMagnitude >= 200) alpha = 0.002;
//       // else if (movementMagnitude >= 100) alpha = 0.001;

//       let alpha = 0.0001;
//       if (movementMagnitude >= 500) alpha = 0.3;
//       else if (movementMagnitude >= 400) alpha = 0.1;
//       else if (movementMagnitude >= 300) alpha = 0.003;
//       else if (movementMagnitude >= 200) alpha = 0.002;
//       else if (movementMagnitude >= 100) alpha = 0.001;

//       const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//       const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;

//       smoothedPositions.push({ panX, panY });
//       previousPanX = panX;
//       previousPanY = panY;
//     }

//     return smoothedPositions;
//   }, [durationInFrames, fps, ORIGINAL_WIDTH, ORIGINAL_HEIGHT, cursorData]);

//   // Get current pan values
//   const { panX, panY } = smoothedPanPositions[frame] || { panX: 0, panY: 0 };
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const panScaleFactor = (currentZoom - 1) / (maxZoomLevel - 1);
//   const adjustedPanX = panX * panScaleFactor;
//   const adjustedPanY = panY * panScaleFactor;

//   // Styles
//   const containerStyle: React.CSSProperties = {
//     position: 'relative',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     overflow: 'hidden',
//     backgroundColor: 'black',
//   };

//   const transformedContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: 'center center',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   const originalBoundaryStyle: React.CSSProperties = {
//     position: 'absolute',
//     border: '2px solid yellow',
//     left: 0,
//     top: 0,
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     pointerEvents: 'none',
//     zIndex: 999,
//   };

//   const timestamp = (frame / fps) * 1000;
//   const cursorPos = getCursorPositionAtTime(timestamp);

//   const cursorBoxStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: BOX_SIZE,
//     height: BOX_SIZE,
//     border: '2px solid red',
//     left: cursorPos.x - BOX_SIZE / 2,
//     top: cursorPos.y - BOX_SIZE / 2,
//     pointerEvents: 'none',
//     zIndex: 1000,
//   };

//   return (
//     <div style={containerStyle}>
//       <div style={transformedContainerStyle}>
//         {children}
//         <div style={cursorBoxStyle} />
//       </div>
//       <div style={originalBoundaryStyle} />
//     </div>
//   );
// };

///////////////////////////// Test 6  //////////////////////
///////////////////////////////////////////////////////////

// ZoomAndPanEffect.tsx

import React, { useMemo } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type { RecordingData } from '../types/recording';
import { makeTransform, scale, translate } from '@remotion/animation-utils';

interface ZoomAndPanEffectProps {
  children: React.ReactNode;
  cursorData: RecordingData;
}

export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({ 
  children,
  cursorData 
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Function to get cursor position using the passed cursorData
  const getCursorPositionAtTime = (timestamp: number) => {
    const position = cursorData.tracking_data.find(
      (data) =>
        Math.abs(data.recorded_display_data.timestamp - timestamp) < 50
    );
    return (
      position?.recorded_display_data ||
      cursorData.tracking_data[0].recorded_display_data
    );
  };

  // Original screen dimensions
  const ORIGINAL_WIDTH = width;
  const ORIGINAL_HEIGHT = height;
  const BOX_SIZE = 100;

  // Zoom timeline: array of { zoomDuration, zoomLevel, transitionDuration }
  const zoomTimeline = [
    { zoomDuration: 0, zoomLevel: 1.0, transitionDuration: 1 },
    { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
    { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
    { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
    { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
    { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 0 },
  ];

  // Build zoom events with cumulative start and end times
  const zoomEvents = useMemo(() => {
    const events = [] as any[];
    let cumulativeTime = 3;

    for (const event of zoomTimeline) {
      const zoomEvent = {
        ...event,
        startTime: cumulativeTime,
        endTime: cumulativeTime + event.zoomDuration,
        transitionStartTime: cumulativeTime + event.zoomDuration,
        transitionEndTime: cumulativeTime + event.zoomDuration + event.transitionDuration,
      };
      events.push(zoomEvent);
      cumulativeTime += event.zoomDuration + event.transitionDuration;
    }

    return events;
  }, []);

  const totalCycleDuration = useMemo(() => 
    zoomEvents.reduce((sum, event) => sum + event.zoomDuration + event.transitionDuration, 0), 
    [zoomEvents]
  );

  // Helper functions for zoom calculations
  const interpolateZoom = (startZoom: number, endZoom: number, progress: number) => {
    const easedProgress = easeInOutCubic(progress);
    return startZoom + (endZoom - startZoom) * easedProgress;
  };

  const easeInOutCubic = (t: number) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const getZoomLevel = (frame: number) => {
    const timeInSeconds = (frame / fps) % totalCycleDuration;
    let zoomLevel = 1.0;

    for (let i = 0; i < zoomEvents.length; i++) {
      const zoomEvent = zoomEvents[i];
      const nextZoomEvent = zoomEvents[(i + 1) % zoomEvents.length];

      const {
        startTime,
        endTime,
        transitionStartTime,
        transitionEndTime,
        zoomLevel: currentZoomLevel,
        transitionDuration,
      } = zoomEvent;

      if (timeInSeconds >= startTime && timeInSeconds < endTime) {
        return currentZoomLevel;
      } else if (
        transitionDuration > 0 && 
        timeInSeconds >= transitionStartTime && 
        timeInSeconds < transitionEndTime
      ) {
        const transitionProgress = (timeInSeconds - transitionStartTime) / transitionDuration;
        return interpolateZoom(currentZoomLevel, nextZoomEvent.zoomLevel, transitionProgress);
      }
    }

    return 1.0;
  };

  const currentZoom = getZoomLevel(frame);

  // Calculate pan positions
  const smoothedPanPositions = useMemo(() => {
    const panPositions: { panX: number; panY: number }[] = [];
    const cursorPositions: { x: number; y: number }[] = [];

    for (let f = 0; f < durationInFrames; f++) {
      const timestamp = (f / fps) * 1000;
      const cursorPos = getCursorPositionAtTime(timestamp);

      const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
      const maxPanX = (ORIGINAL_WIDTH * (maxZoomLevel - 1)) / 2;
      const maxPanY = (ORIGINAL_HEIGHT * (maxZoomLevel - 1)) / 2;

      let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
      let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

      targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
      targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

      panPositions.push({ panX: targetPanX, panY: targetPanY });
      cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });
    }

    const smoothedPositions: { panX: number; panY: number }[] = [];
    let previousPanX = panPositions[0].panX;
    let previousPanY = panPositions[0].panY;
    const windowSize = 90;

    for (let f = 0; f < durationInFrames; f++) {
      const startFrame = Math.max(0, f - windowSize + 1);
      const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
      const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;
      const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

      // let alpha = 0.0001;
      // if (movementMagnitude >= 500) alpha = 0.1;
      // else if (movementMagnitude >= 400) alpha = 0.1;
      // else if (movementMagnitude >= 300) alpha = 0.003;
      // else if (movementMagnitude >= 200) alpha = 0.002;
      // else if (movementMagnitude >= 100) alpha = 0.001;

      let alpha = 0.0001;
      if (movementMagnitude >= 500) alpha = 0.3;
      else if (movementMagnitude >= 400) alpha = 0.1;
      else if (movementMagnitude >= 300) alpha = 0.003;
      else if (movementMagnitude >= 200) alpha = 0.002;
      else if (movementMagnitude >= 100) alpha = 0.001;

      const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
      const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;

      smoothedPositions.push({ panX, panY });
      previousPanX = panX;
      previousPanY = panY;
    }

    return smoothedPositions;
  }, [durationInFrames, fps, ORIGINAL_WIDTH, ORIGINAL_HEIGHT, cursorData]);

  // Get current pan values
  const { panX, panY } = smoothedPanPositions[frame] || { panX: 0, panY: 0 };
  const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
  const panScaleFactor = (currentZoom - 1) / (maxZoomLevel - 1);
  const adjustedPanX = panX * panScaleFactor;
  const adjustedPanY = panY * panScaleFactor;

  // Styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: ORIGINAL_WIDTH,
    height: ORIGINAL_HEIGHT,
    overflow: 'hidden',
    backgroundColor: 'black',
  };

  const transformedContainerStyle: React.CSSProperties = {
    position: 'absolute',
    width: ORIGINAL_WIDTH,
    height: ORIGINAL_HEIGHT,
    transformOrigin: 'center center',
    transform: makeTransform([
      translate(-adjustedPanX, -adjustedPanY),
      scale(currentZoom),
    ]),
  };

  const originalBoundaryStyle: React.CSSProperties = {
    position: 'absolute',
    border: '2px solid yellow',
    left: 0,
    top: 0,
    width: ORIGINAL_WIDTH,
    height: ORIGINAL_HEIGHT,
    pointerEvents: 'none',
    zIndex: 999,
  };

  const timestamp = (frame / fps) * 1000;
  const cursorPos = getCursorPositionAtTime(timestamp);

  const cursorBoxStyle: React.CSSProperties = {
    position: 'absolute',
    width: BOX_SIZE,
    height: BOX_SIZE,
    border: '2px solid red',
    left: cursorPos.x - BOX_SIZE / 2,
    top: cursorPos.y - BOX_SIZE / 2,
    pointerEvents: 'none',
    zIndex: 1000,
  };

  return (
    <div style={containerStyle}>
      <div style={transformedContainerStyle}>
        {children}
        <div style={cursorBoxStyle} />
      </div>
      <div style={originalBoundaryStyle} />
    </div>
  );
};
