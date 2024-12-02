/// working perfect

// import { bundle } from '@remotion/bundler';
// import { renderMedia, selectComposition } from '@remotion/renderer';
// import path from 'path';
// import { app } from 'electron';
// import fs from 'fs/promises';

// export async function renderVideo({
//   videoPath,
//   cursorData,
//   outputFileName
// }: {
//   videoPath: string;
//   cursorData: any;
//   outputFileName: string;
// }) {
//   try {
//     // Copy video to public folder
//     const publicFolder = path.join(app.getAppPath(), 'public');
//     const videoFileName = `temp-video-${Date.now()}.webm`;
//     const publicVideoPath = path.join(publicFolder, videoFileName);

//     // Ensure public directory exists
//     await fs.mkdir(publicFolder, { recursive: true });
    
//     // Copy the video file
//     await fs.copyFile(videoPath, publicVideoPath);

//     const bundleLocation = await bundle({
//       entryPoint: path.join(app.getAppPath(), 'src', 'remotion', 'index.tsx'),
//       webpackOverride: (config) => config,
//     });

//     const inputProps = {
//       videoUrl: videoFileName, // Just pass the filename, staticFile will handle the rest
//       cursorData
//     };

//     console.log('Input props being passed to composition:', inputProps);

//     const composition = await selectComposition({
//       serveUrl: bundleLocation,
//       id: 'ZoomVideo',
//       inputProps,
//     });

//     // Add debug log
//     console.log('Selected composition:', composition);

//     const outputLocation = path.join(
//       app.getPath('downloads'),
//       outputFileName
//     );

//     await renderMedia({
//       composition,
//       serveUrl: bundleLocation,
//       codec: 'h264',
//       outputLocation,
//       inputProps,
//       verbose: true,
//     });

//     // Clean up the temporary video file
//     await fs.unlink(publicVideoPath).catch(console.error);

//     return outputLocation;
//   } catch (error) {
//     console.error('Error rendering video:', error);
//     throw error;
//   }
// }


///////////////////////////////////////////////////////////////////
//////////// Test //////////

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { app } from 'electron';
import fs from 'fs/promises';

export async function renderVideo({
  videoPath,
  cursorData,
  outputFileName
}: {
  videoPath: string;
  cursorData: any;
  outputFileName: string;
}) {
  try {
    // Copy video to public folder
    const publicFolder = path.join(app.getAppPath(), 'public');
    const videoFileName = `temp-video-${Date.now()}.webm`;
    const publicVideoPath = path.join(publicFolder, videoFileName);

    // Ensure public directory exists
    await fs.mkdir(publicFolder, { recursive: true });
    
    // Copy the video file
    await fs.copyFile(videoPath, publicVideoPath);

    const bundleLocation = await bundle({
      entryPoint: path.join(app.getAppPath(), 'src', 'remotion', 'index.tsx'),
      webpackOverride: (config) => config,
    });

    const inputProps = {
      videoUrl: videoFileName, // Just pass the filename, staticFile will handle the rest
      cursorData
    };

    console.log('Input props being passed to composition:', inputProps);

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'ZoomVideo',
      inputProps,
    });

    // Add debug log
    console.log('Selected composition:', composition);

    const outputLocation = path.join(
      app.getPath('downloads'),
      outputFileName
    );

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps,
      verbose: true,
    });

    // Clean up the temporary video file
    await fs.unlink(publicVideoPath).catch(console.error);

    return outputLocation;
  } catch (error) {
    console.error('Error rendering video:', error);
    throw error;
  }
}