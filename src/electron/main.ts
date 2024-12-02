// import {
//   app,
//   BrowserWindow,
//   desktopCapturer,
//   ipcMain,
//   session,
//   systemPreferences,
//   screen,
//   dialog,
//   protocol,
//   net
// } from "electron";
// import path from "path";
// import { getPreloadPath } from "./pathResolver.js";
// import { isDev } from "./util.js";
// import fs from "fs";

// // test below
// import { renderVideo } from './renderService.js';

// let mainWindow: BrowserWindow;
// let selectedSourceId: string | null = null;

// let cameraWindow: BrowserWindow | null = null; // Window for camera preview

// // Define interfaces to match exact JSON structure
// interface CursorData {
//   recording_info: {
//     start_time: number;
//     end_time: number;
//     duration: number;
//     frame_rate: number;
//     global_window_dimension: {
//       width: number;
//       height: number;
//     };
//     recorded_display_dimension: {
//       x: number;
//       y: number;
//       width: number;
//       height: number;
//     };
//   };
//   tracking_data: Array<{
//     global_display_data: {
//       x: number;
//       y: number;
//       timestamp: number;
//     };
//     recorded_display_data: {
//       x: number;
//       y: number;
//       timestamp: number;
//       is_inside_bounds: boolean;
//     };
//   }>;
// }

// interface SourceInfo {
//   id: string;
//   bounds: {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//   };
//   isFullScreen: boolean;
// }

// let cursorTrackingInterval: NodeJS.Timeout | null = null;
// let trackingData: CursorData["tracking_data"] = [];
// let startTime: number = 0;
// let selectedSourceInfo: SourceInfo | null = null;

// let selectedSourceBounds: {
//   id: string;
//   bounds: { x: number; y: number; width: number; height: number };
//   isFullScreen: boolean;
// } | null = null;

// ///////////////////////////////////////////////////////
// // test code for native module
// // import { fileURLToPath } from "url";
// // import { createRequire } from "module";

// // const require = createRequire(import.meta.url);
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);
// // let cursorControl: any;
// // try {
// //   const modulePath = path.join(
// //     __dirname,
// //     "../build/Release/cursor_control.node"
// //   );
// //   cursorControl = require(modulePath);
// //   console.log("Native cursor control module loaded successfully");
// // } catch (error) {
// //   console.error("Failed to load native cursor control module:", error);
// // }

// ///////////////////////////////////////////////////////

// const createMainWindow = () => {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: getPreloadPath(),
//       sandbox: false, // Need this for file access
//     },
//   });

//   if (isDev()) {
//     mainWindow.loadURL("http://localhost:5173");
//   } else {
//     mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"), {
//       hash: "/",
//     });
//   }
// };

// // Create camera window
// const createCameraWindow = () => {
//   // Get the primary display dimensions

//   cameraWindow = new BrowserWindow({
//     width: 160,
//     height: 160,
//     frame: false,
//     alwaysOnTop: true,
//     webPreferences: {
//       preload: getPreloadPath(),
//     },
//     transparent: true,
//     resizable: true,
//     x: screen.getPrimaryDisplay().workAreaSize.width - 190, // width + 20px padding
//     y: screen.getPrimaryDisplay().workAreaSize.height - 160, // height + 20px padding
//     focusable: true,
//     skipTaskbar: true,
//   });

//   // test // After window creation, make it circular
//   // cameraWindow.setShape([
//   //   { x: 110, y: 0, width: 1, height: 1 }, // This creates a circular mask
//   // ]);
//   // test

//   // Set window to be excluded from screen capture
//   if (process.platform === "darwin") {
//     // For macOS
//     cameraWindow.setWindowButtonVisibility(false);
//     // @ts-ignore - This method exists but might not be in the types
//     cameraWindow.setVisibleOnAllWorkspaces(true, {
//       visibleOnFullScreen: true,
//       skipTransformProcessType: true,
//     });
//   }

//   // Use the actual API to exclude from capture
//   if (cameraWindow.setContentProtection) {
//     cameraWindow.setContentProtection(true);
//   }

//   if (isDev()) {
//     cameraWindow.loadURL("http://localhost:5173/#/camera");
//   } else {
//     cameraWindow.loadFile(
//       path.join(app.getAppPath(), "dist-react/index.html"),
//       {
//         hash: "camera",
//       }
//     );
//   }

//   // Make window draggable
//   cameraWindow.setVisibleOnAllWorkspaces(true);
//   // Ensure mouse events work
//   cameraWindow.setIgnoreMouseEvents(false);

//   return cameraWindow;
// };

// app.whenReady().then(async () => {
//   // Check screen capture permissions on macOS
//   if (process.platform === "darwin") {
//     const status = systemPreferences.getMediaAccessStatus("screen");
//     console.log("Screen permission status:", status);
//   }

//   createMainWindow();

//   // Get available sources for our UI
//   ipcMain.handle("getSources", async () => {
//     const sources = await desktopCapturer.getSources({
//       types: ["screen", "window"],
//       thumbnailSize: { width: 320, height: 180 },
//       fetchWindowIcons: true,
//     });

//     return sources.map((source) => ({
//       id: source.id,
//       name: source.name,
//       thumbnailURL: source.thumbnail.toDataURL(),
//       display_id: source.display_id,
//       appIcon: source.appIcon?.toDataURL() || null,
//     }));
//   });

//   ////////////////////////////// Register protocol for local video files
//   // Register protocol handler
//   protocol.registerFileProtocol('file', (request, callback) => {
//     const pathname = decodeURIComponent(request.url.replace('file:///', ''));
//     callback(pathname);
//   });

//   ///////////////////////////////////////////////////////

//   // // working code
//   ipcMain.handle("selectSource", async (_, sourceId: string) => {
//     try {
//       selectedSourceId = sourceId; // Set the ID first

//       const sources = await desktopCapturer.getSources({
//         types: ["window", "screen"],
//         thumbnailSize: { width: 1920, height: 1080 }, // Larger thumbnail for accuracy
//       });

//       const source = sources.find((s) => s.id === sourceId);
//       if (!source) return false;

//       const primaryDisplay = screen.getPrimaryDisplay();

//       if (sourceId.startsWith("screen:")) {
//         selectedSourceInfo = {
//           id: sourceId,
//           bounds: primaryDisplay.bounds,
//           isFullScreen: true,
//         };
//       } else {
//         // For window recording, we'll use the window's actual dimensions
//         const nativeWindow = BrowserWindow.getAllWindows().find((win) =>
//           win.getTitle().includes(source.name)
//         );

//         if (nativeWindow) {
//           const bounds = nativeWindow.getBounds();
//           selectedSourceInfo = {
//             id: sourceId,
//             bounds: {
//               x: bounds.x,
//               y: bounds.y,
//               width: bounds.width,
//               height: bounds.height,
//             },
//             isFullScreen: false,
//           };
//         } else {
//           // Fallback if window not found
//           const aspectRatio = source.thumbnail.getAspectRatio();
//           const windowWidth = Math.floor(primaryDisplay.bounds.width * 0.5);
//           selectedSourceInfo = {
//             id: sourceId,
//             bounds: {
//               x: source.thumbnail.getSize().width || 151,
//               y: source.thumbnail.getSize().height || 36,
//               width: windowWidth,
//               height: Math.floor(windowWidth / aspectRatio),
//             },
//             isFullScreen: false,
//           };
//         }
//       }

//       console.log("Selected source info:", selectedSourceInfo);
//       return true;
//     } catch (error) {
//       console.error("Error in selectSource:", error);
//       return false;
//     }
//   });

//   // Set up display media handler for the selected source
//   session.defaultSession.setDisplayMediaRequestHandler(
//     async (request, callback) => {
//       try {
//         const sources = await desktopCapturer.getSources({
//           types: ["screen", "window"],
//           thumbnailSize: { width: 150, height: 150 },
//         });

//         const selectedSource = selectedSourceId
//           ? sources.find((s) => s.id === selectedSourceId)
//           : sources[0];

//         if (!selectedSource) {
//           throw new Error("No source selected or found");
//         }

//         callback({
//           video: selectedSource,
//           audio: process.platform === "darwin" ? undefined : "loopback",
//         });
//       } catch (error) {
//         console.error("Error in display media handler:", error);
//         callback({});
//       }
//     },
//     { useSystemPicker: false }
//   );

//   ipcMain.handle("getPlatform", () => process.platform);

//   // Save recording
//   ipcMain.handle("saveRecording", async (_, buffer: Uint8Array) => {
//     try {
//       const downloadsPath = app.getPath("downloads");
//       const fileName = `screen-recording-${Date.now()}.webm`;
//       const filePath = path.join(downloadsPath, fileName);

//       await fs.promises.writeFile(filePath, buffer);
//       return filePath;
//     } catch (error) {
//       console.error("Failed to save recording:", error);
//       throw error;
//     }
//   });

//   // camera ipc handler
//   ipcMain.handle("toggleCamera", async (_, show: boolean) => {
//     if (show) {
//       if (!cameraWindow) {
//         createCameraWindow();
//       }
//     } else {
//       cameraWindow?.close();
//       cameraWindow = null;
//     }
//   });

//   // Move camera window
//   ipcMain.handle("moveWindow", (_, deltaX: number, deltaY: number) => {
//     if (cameraWindow) {
//       const [startX, startY] = cameraWindow.getPosition();
//       cameraWindow.setBounds({
//         x: startX + Math.round(deltaX),
//         y: startY + Math.round(deltaY),
//         width: 160,
//         height: 160,
//       });
//     }
//   });

//   // Save camera recording
//   ipcMain.handle("saveCameraRecording", async (_, buffer: Uint8Array) => {
//     try {
//       const downloadsPath = app.getPath("downloads");
//       const fileName = `camera-recording-${Date.now()}.webm`;
//       const filePath = path.join(downloadsPath, fileName);

//       await fs.promises.writeFile(filePath, buffer);
//       return filePath;
//     } catch (error) {
//       console.error("Failed to save camera recording:", error);
//       throw error;
//     }
//   });

//   // Start cursor tracking
//   ipcMain.handle("startCursorTracking", async () => {
//     if (!selectedSourceInfo) {
//       console.error("No source selected for tracking");
//       return false;
//     }

//     console.log("Starting cursor tracking...");
//     trackingData = [];
//     startTime = Date.now();

//     cursorTrackingInterval = setInterval(() => {
//       const point = screen.getCursorScreenPoint();
//       const bounds = selectedSourceInfo!.bounds;

//       // Check if cursor is inside recording bounds
//       const isInsideBounds =
//         point.x >= bounds.x &&
//         point.x <= bounds.x + bounds.width &&
//         point.y >= bounds.y &&
//         point.y <= bounds.y + bounds.height;

//       const timestamp = Date.now() - startTime;

//       const cursorPos = {
//         global_display_data: {
//           x: point.x,
//           y: point.y,
//           timestamp,
//         },
//         recorded_display_data: isInsideBounds
//           ? {
//               x: point.x - bounds.x,
//               y: point.y - bounds.y,
//               timestamp,
//               is_inside_bounds: true,
//             }
//           : {
//               x: 0,
//               y: 0,
//               timestamp,
//               is_inside_bounds: false,
//             },
//       };

//       if (trackingData.length % 30 === 0) {
//         // Log every second
//         console.log(
//           "Cursor position:",
//           point,
//           "Inside bounds:",
//           isInsideBounds
//         );
//       }

//       // Create data point exactly matching desired format
//       trackingData.push(cursorPos);
//     }, 1000 / 30); // 30fps

//     return true;
//   });

//   // Stop cursor tracking
//   // Stop tracking and save data
//   ipcMain.handle("stopCursorTracking", async () => {
//     if (cursorTrackingInterval) {
//       clearInterval(cursorTrackingInterval);
//       cursorTrackingInterval = null;
//     }

//     if (!selectedSourceInfo) {
//       throw new Error("No source info available");
//     }

//     const endTime = Date.now();
//     const duration = endTime - startTime;
//     const primaryDisplay = screen.getPrimaryDisplay();

//     // Create final data structure exactly matching desired format
//     const cursorData: CursorData = {
//       recording_info: {
//         start_time: startTime,
//         end_time: endTime,
//         duration: duration,
//         frame_rate: 30,
//         global_window_dimension: {
//           width: primaryDisplay.bounds.width,
//           height: primaryDisplay.bounds.height,
//         },
//         recorded_display_dimension: {
//           x: selectedSourceInfo.bounds.x,
//           y: selectedSourceInfo.bounds.y,
//           width: selectedSourceInfo.bounds.width,
//           height: selectedSourceInfo.bounds.height,
//         },
//       },
//       tracking_data: trackingData,
//     };

//     try {
//       const fileName = `cursor-data-${startTime}.json`;
//       const filePath = path.join(app.getPath("downloads"), fileName);

//       await fs.promises.writeFile(
//         filePath,
//         JSON.stringify(cursorData, null, 2),
//         "utf-8"
//       );

//       // Reset states
//       trackingData = [];
//       selectedSourceInfo = null;
//       selectedSourceId = null; // Reset ID here instead

//       return filePath;
//     } catch (error) {
//       console.error("Failed to save cursor data:", error);
//       throw error;
//     }
//   });

//   ///////////// Add this with your other IPC handlers //////////////////////
//   /////////////////////////////////////////////////////////////////
//   // ipcMain.handle('openFile', async () => {
//   //   const result = await dialog.showOpenDialog({
//   //     properties: ['openFile'],
//   //     filters: [
//   //       { name: 'Videos', extensions: ['webm', 'mp4'] }
//   //     ]
//   //   });

//   //   if (!result.canceled && result.filePaths.length > 0) {
//   //     return result.filePaths[0];
//   //   }
//   //   return null;
//   // });

//   ipcMain.handle('openFile', async (_, options: {
//     title: string;
//     filters: { name: string; extensions: string[] }[];
//   }) => {
//     const result = await dialog.showOpenDialog({
//       properties: ['openFile'],
//       title: options.title,
//       filters: options.filters
//     });

//     if (!result.canceled && result.filePaths.length > 0) {
//       return result.filePaths[0];
//     }
//     return null;
//   });

//   // Add a new handler to read JSON files
//   ipcMain.handle('readJsonFile', async (_, filePath: string) => {
//     try {
//       const data = await fs.promises.readFile(filePath, 'utf-8');
//       return JSON.parse(data);
//     } catch (error) {
//       console.error('Error reading JSON file:', error);
//       throw error;
//     }
//   });

//   //// Handler to stream video data
//   ipcMain.handle('getVideoStream', async (_, filePath) => {
//     try {
//       // For WebM files specifically
//       const stats = await fs.promises.stat(filePath);
//       const buffer = await fs.promises.readFile(filePath);

//       return {
//         buffer: buffer,
//         size: stats.size,
//         type: 'video/webm;codecs=vp8,opus'  // Specific codec for WebM
//       };
//     } catch (error) {
//       console.error('Error reading video file:', error);
//       throw error;
//     }
//   });

//   // Add this with your other IPC handlers //  test below
//   ipcMain.handle('renderVideo', async (_, { videoPath, cursorData }) => {
//     try {
//       console.log('Received video path:', videoPath); // Debug log
//       const outputFileName = `rendered-video-${Date.now()}.mp4`;
//       const outputPath = await renderVideo({
//         videoPath,
//         cursorData,
//         outputFileName
//       });
//       return outputPath;
//     } catch (error) {
//       console.error('Failed to render video:', error);
//       throw error;
//     }
//   });
//   //////////////////////////////////////////////////////////
// });

// // Add cleanup for cursor tracking
// app.on("window-all-closed", () => {
//   if (cursorTrackingInterval) {
//     clearInterval(cursorTrackingInterval);
//     cursorTrackingInterval = null;
//   }

//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });

// app.on("activate", () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createMainWindow();
//   }
// });

// app.on("before-quit", () => {
//   if (cursorTrackingInterval) {
//     clearInterval(cursorTrackingInterval);
//     cursorTrackingInterval = null;
//   }
// });

//////////////////// Test 7 ////////////////////////////
/////////////////////////////////////////////////////////

import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  session,
  systemPreferences,
  screen,
  dialog,
  protocol,
  net,
} from "electron";
import path from "path";
import { getPreloadPath } from "./pathResolver.js";
import { isDev } from "./util.js";
import fs from "fs";

// test below
import { renderVideo } from "./renderService.js";

let mainWindow: BrowserWindow;
let selectedSourceId: string | null = null;

let cameraWindow: BrowserWindow | null = null; // Window for camera preview

// Define interfaces to match exact JSON structure
interface CursorData {
  recording_info: {
    start_time: number;
    end_time: number;
    duration: number;
    frame_rate: number;
    global_window_dimension: {
      width: number;
      height: number;
    };
    recorded_display_dimension: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  tracking_data: Array<{
    global_display_data: {
      x: number;
      y: number;
      timestamp: number;
    };
    recorded_display_data: {
      x: number;
      y: number;
      timestamp: number;
      is_inside_bounds: boolean;
    };
  }>;
}

interface SourceInfo {
  id: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isFullScreen: boolean;
}

// type DrawingTool = "none" | "pen" | "eraser";

import { DrawingTool } from "../ui/types/drawingTool.js";

interface DrawingToolState {
  tool: DrawingTool;
  color: string;
  width: number;
 }
 


let cursorTrackingInterval: NodeJS.Timeout | null = null;
let trackingData: CursorData["tracking_data"] = [];
let startTime: number = 0;
let selectedSourceInfo: SourceInfo | null = null;

// overlay window
let overlayWindow: BrowserWindow | null = null;

///////////////////////////////////////////////////////
// test code for native module
// import { fileURLToPath } from "url";
// import { createRequire } from "module";

// const require = createRequire(import.meta.url);
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// let cursorControl: any;
// try {
//   const modulePath = path.join(
//     __dirname,
//     "../build/Release/cursor_control.node"
//   );
//   cursorControl = require(modulePath);
//   console.log("Native cursor control module loaded successfully");
// } catch (error) {
//   console.error("Failed to load native cursor control module:", error);
// }

///////////////////////////////////////////////////////

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: getPreloadPath(),
      sandbox: false, // Need this for file access
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"), {
      hash: "/",
    });
  }
};

// Create camera window
const createCameraWindow = () => {
  // Get the primary display dimensions

  cameraWindow = new BrowserWindow({
    width: 160,
    height: 160,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: getPreloadPath(),
    },
    transparent: true,
    resizable: true,
    x: screen.getPrimaryDisplay().workAreaSize.width - 190, // width + 20px padding
    y: screen.getPrimaryDisplay().workAreaSize.height - 160, // height + 20px padding
    focusable: true,
    skipTaskbar: true,
  });

  // test // After window creation, make it circular
  // cameraWindow.setShape([
  //   { x: 110, y: 0, width: 1, height: 1 }, // This creates a circular mask
  // ]);
  // test

  // Set window to be excluded from screen capture
  if (process.platform === "darwin") {
    // For macOS
    cameraWindow.setWindowButtonVisibility(false);
    // @ts-ignore - This method exists but might not be in the types
    cameraWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: true,
    });
  }

  // Use the actual API to exclude from capture
  if (cameraWindow.setContentProtection) {
    cameraWindow.setContentProtection(true);
  }

  if (isDev()) {
    cameraWindow.loadURL("http://localhost:5173/#/camera");
  } else {
    cameraWindow.loadFile(
      path.join(app.getAppPath(), "dist-react/index.html"),
      {
        hash: "camera",
      }
    );
  }

  // Make window draggable
  cameraWindow.setVisibleOnAllWorkspaces(true);
  // Ensure mouse events work
  cameraWindow.setIgnoreMouseEvents(false);

  return cameraWindow;
};

const createOverlayWindow = () => {
  console.log("🎨 Creating overlay window with bounds:");

  if (!selectedSourceInfo?.bounds) {
    console.error("No source bounds available for overlay window");
    return;
  }

  // If window already exists, just return
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    console.log("Window already exists, skipping creation");
    return;
  }

  console.log(
    "Creating overlay window with bounds:",
    selectedSourceInfo?.bounds
  );

  overlayWindow = new BrowserWindow({
    ...selectedSourceInfo?.bounds,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000", // Transparent background
    alwaysOnTop: true,
    webPreferences: {
      preload: getPreloadPath(),
    },
    // parent: mainWindow, // Make main window the parent
    modal: false, // Not modal
  });

  // Position windows in correct order
  mainWindow.setAlwaysOnTop(true, "screen-saver");

  // overlayWindow.setAlwaysOnTop(true, 'screen-saver'); // Changed from 'normal' to 'screen-saver'
  overlayWindow.setAlwaysOnTop(true, "floating");
  mainWindow.moveTop();

  // Set click-through by default
  overlayWindow.setIgnoreMouseEvents(true);

  // Send bounds to overlay
  overlayWindow.webContents.on("did-finish-load", () => {
    if (overlayWindow && selectedSourceInfo) {
      overlayWindow.webContents.send("setup-overlay", {
        bounds: selectedSourceInfo.bounds,
        isRecording: true,
      });
    }
  });

  // Show window once it's ready
  overlayWindow.once("ready-to-show", () => {
    if (overlayWindow) {
      overlayWindow.show();
    }
  });

  if (isDev()) {
    overlayWindow.loadURL("http://localhost:5173/#/overlay");
  } else {
    overlayWindow.loadFile(
      path.join(app.getAppPath(), "dist-react/index.html"),
      {
        hash: "overlay",
      }
    );
  }
};

app.whenReady().then(async () => {
  // Check screen capture permissions on macOS
  if (process.platform === "darwin") {
    const status = systemPreferences.getMediaAccessStatus("screen");
    console.log("Screen permission status:", status);
  }

  createMainWindow();

  // Get available sources for our UI
  ipcMain.handle("getSources", async () => {
    const sources = await desktopCapturer.getSources({
      types: ["screen", "window"],
      thumbnailSize: { width: 320, height: 180 },
      fetchWindowIcons: true,
    });

    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      thumbnailURL: source.thumbnail.toDataURL(),
      display_id: source.display_id,
      appIcon: source.appIcon?.toDataURL() || null,
    }));
  });

  ////////////////////////////// Register protocol for local video files
  // Register protocol handler
  protocol.registerFileProtocol("file", (request, callback) => {
    const pathname = decodeURIComponent(request.url.replace("file:///", ""));
    callback(pathname);
  });

  ipcMain.handle("selectSource", async (_, sourceId: string) => {
    try {
      selectedSourceId = sourceId; // Set the ID first

      const sources = await desktopCapturer.getSources({
        types: ["window", "screen"],
        thumbnailSize: { width: 1920, height: 1080 }, // Larger thumbnail for accuracy
      });

      const source = sources.find((s) => s.id === sourceId);
      if (!source) return false;

      const primaryDisplay = screen.getPrimaryDisplay();

      if (sourceId.startsWith("screen:")) {
        selectedSourceInfo = {
          id: sourceId,
          bounds: primaryDisplay.bounds,
          isFullScreen: true,
        };
      } else {
        // For window recording, we'll use the window's actual dimensions
        const nativeWindow = BrowserWindow.getAllWindows().find((win) =>
          win.getTitle().includes(source.name)
        );

        if (nativeWindow) {
          const bounds = nativeWindow.getBounds();
          selectedSourceInfo = {
            id: sourceId,
            bounds: {
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
            },
            isFullScreen: false,
          };
        } else {
          // Fallback if window not found
          const aspectRatio = source.thumbnail.getAspectRatio();
          const windowWidth = Math.floor(primaryDisplay.bounds.width * 0.5);
          selectedSourceInfo = {
            id: sourceId,
            bounds: {
              x: source.thumbnail.getSize().width || 151,
              y: source.thumbnail.getSize().height || 36,
              width: windowWidth,
              height: Math.floor(windowWidth / aspectRatio),
            },
            isFullScreen: false,
          };
        }
      }

      console.log("Selected source info:", selectedSourceInfo);
      return true;
    } catch (error) {
      console.error("Error in selectSource:", error);
      return false;
    }
  });

  // Set up display media handler for the selected source
  session.defaultSession.setDisplayMediaRequestHandler(
    async (request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({
          types: ["screen", "window"],
          thumbnailSize: { width: 150, height: 150 },
        });

        const selectedSource = selectedSourceId
          ? sources.find((s) => s.id === selectedSourceId)
          : sources[0];

        if (!selectedSource) {
          throw new Error("No source selected or found");
        }

        callback({
          video: selectedSource,
          audio: process.platform === "darwin" ? undefined : "loopback",
        });
      } catch (error) {
        console.error("Error in display media handler:", error);
        callback({});
      }
    },
    { useSystemPicker: false }
  );

  ipcMain.handle("getPlatform", () => process.platform);

  // Save recording
  ipcMain.handle("saveRecording", async (_, buffer: Uint8Array) => {
    try {
      const downloadsPath = app.getPath("downloads");
      const fileName = `screen-recording-${Date.now()}.webm`;
      const filePath = path.join(downloadsPath, fileName);

      await fs.promises.writeFile(filePath, buffer);
      return filePath;
    } catch (error) {
      console.error("Failed to save recording:", error);
      throw error;
    }
  });

  // camera ipc handler
  ipcMain.handle("toggleCamera", async (_, show: boolean) => {
    if (show) {
      if (!cameraWindow) {
        createCameraWindow();
      }
    } else {
      cameraWindow?.close();
      cameraWindow = null;
    }
  });

  // Move camera window
  ipcMain.handle("moveWindow", (_, deltaX: number, deltaY: number) => {
    if (cameraWindow) {
      const [startX, startY] = cameraWindow.getPosition();
      cameraWindow.setBounds({
        x: startX + Math.round(deltaX),
        y: startY + Math.round(deltaY),
        width: 160,
        height: 160,
      });
    }
  });

  // Save camera recording
  ipcMain.handle("saveCameraRecording", async (_, buffer: Uint8Array) => {
    try {
      const downloadsPath = app.getPath("downloads");
      const fileName = `camera-recording-${Date.now()}.webm`;
      const filePath = path.join(downloadsPath, fileName);

      await fs.promises.writeFile(filePath, buffer);
      return filePath;
    } catch (error) {
      console.error("Failed to save camera recording:", error);
      throw error;
    }
  });

  // Start cursor tracking
  ipcMain.handle("startCursorTracking", async () => {
    if (!selectedSourceInfo) {
      console.error("No source selected for tracking");
      return false;
    }

    console.log("Starting cursor tracking...");
    trackingData = [];
    startTime = Date.now();

    cursorTrackingInterval = setInterval(() => {
      const point = screen.getCursorScreenPoint();
      const bounds = selectedSourceInfo!.bounds;

      // Check if cursor is inside recording bounds
      const isInsideBounds =
        point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.height;

      const timestamp = Date.now() - startTime;

      const cursorPos = {
        global_display_data: {
          x: point.x,
          y: point.y,
          timestamp,
        },
        recorded_display_data: isInsideBounds
          ? {
              x: point.x - bounds.x,
              y: point.y - bounds.y,
              timestamp,
              is_inside_bounds: true,
            }
          : {
              x: 0,
              y: 0,
              timestamp,
              is_inside_bounds: false,
            },
      };

      if (trackingData.length % 30 === 0) {
        // Log every second
        console.log(
          "Cursor position:",
          point,
          "Inside bounds:",
          isInsideBounds
        );
      }

      // Create data point exactly matching desired format
      trackingData.push(cursorPos);
    }, 1000 / 30); // 30fps

    return true;
  });

  // Stop cursor tracking
  // Stop tracking and save data
  ipcMain.handle("stopCursorTracking", async () => {
    if (cursorTrackingInterval) {
      clearInterval(cursorTrackingInterval);
      cursorTrackingInterval = null;
    }

    if (!selectedSourceInfo) {
      throw new Error("No source info available");
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const primaryDisplay = screen.getPrimaryDisplay();

    // Create final data structure exactly matching desired format
    const cursorData: CursorData = {
      recording_info: {
        start_time: startTime,
        end_time: endTime,
        duration: duration,
        frame_rate: 30,
        global_window_dimension: {
          width: primaryDisplay.bounds.width,
          height: primaryDisplay.bounds.height,
        },
        recorded_display_dimension: {
          x: selectedSourceInfo.bounds.x,
          y: selectedSourceInfo.bounds.y,
          width: selectedSourceInfo.bounds.width,
          height: selectedSourceInfo.bounds.height,
        },
      },
      tracking_data: trackingData,
    };

    try {
      const fileName = `cursor-data-${startTime}.json`;
      const filePath = path.join(app.getPath("downloads"), fileName);

      await fs.promises.writeFile(
        filePath,
        JSON.stringify(cursorData, null, 2),
        "utf-8"
      );

      // Reset states
      trackingData = [];
      selectedSourceInfo = null;
      selectedSourceId = null; // Reset ID here instead

      return filePath;
    } catch (error) {
      console.error("Failed to save cursor data:", error);
      throw error;
    }
  });

  ipcMain.handle(
    "openFile",
    async (
      _,
      options: {
        title: string;
        filters: { name: string; extensions: string[] }[];
      }
    ) => {
      const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        title: options.title,
        filters: options.filters,
      });

      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    }
  );

  // Add a new handler to read JSON files
  ipcMain.handle("readJsonFile", async (_, filePath: string) => {
    try {
      const data = await fs.promises.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw error;
    }
  });

  //// Handler to stream video data
  ipcMain.handle("getVideoStream", async (_, filePath) => {
    try {
      // For WebM files specifically
      const stats = await fs.promises.stat(filePath);
      const buffer = await fs.promises.readFile(filePath);

      return {
        buffer: buffer,
        size: stats.size,
        type: "video/webm;codecs=vp8,opus", // Specific codec for WebM
      };
    } catch (error) {
      console.error("Error reading video file:", error);
      throw error;
    }
  });

  // Add this with your other IPC handlers //  test below
  ipcMain.handle("renderVideo", async (_, { videoPath, cursorData }) => {
    try {
      console.log("Received video path:", videoPath); // Debug log
      const outputFileName = `rendered-video-${Date.now()}.mp4`;
      const outputPath = await renderVideo({
        videoPath,
        cursorData,
        outputFileName,
      });
      return outputPath;
    } catch (error) {
      console.error("Failed to render video:", error);
      throw error;
    }
  });
  //////////////////////////////////////////////////////////
  /////////////////////// Overlay ////////////////////////
  // Add these IPC handlers
  // Simple IPC handlers
  ipcMain.handle("createOverlayWindow", () => {
    createOverlayWindow();
  });

  ipcMain.handle("closeOverlayWindow", () => {
    if (overlayWindow) {
      overlayWindow.close();
      overlayWindow = null;
    }
  });

  ipcMain.handle("setClickThrough", (_, clickthrough: boolean) => {
    if (overlayWindow) {
      overlayWindow.setIgnoreMouseEvents(clickthrough);
      mainWindow.setAlwaysOnTop(true, "screen-saver");
      mainWindow.moveTop();
      mainWindow.focus();
    }
  });

  // ipcMain.handle("setDrawingTool", (_, toolState: DrawingToolState) => {
  //   console.log("Main process received tool change:", toolState);
  //   overlayWindow?.focus();
  //   overlayWindow?.webContents.send("tool-change", toolState);
  //   console.log("Sent tool change to overlay window:", toolState);
  // });
  ipcMain.handle("setDrawingTool", (_, toolState: DrawingToolState) => {
    console.log("Main process received tool change:", toolState);
    if (toolState.tool === 'clear') {
      overlayWindow?.webContents.send("canvas-clear");
      return;
    }
    
    overlayWindow?.focus();
    overlayWindow?.webContents.send("tool-change", toolState);
    console.log("Sent tool change to overlay window:", toolState);
  });

  //////////////////////////////////////////////////////////
});

// Add cleanup for cursor tracking
app.on("window-all-closed", () => {
  if (cursorTrackingInterval) {
    clearInterval(cursorTrackingInterval);
    cursorTrackingInterval = null;
  }

  // Add overlay window cleanup
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("before-quit", () => {
  if (cursorTrackingInterval) {
    clearInterval(cursorTrackingInterval);
    cursorTrackingInterval = null;
  }
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
  }
});
