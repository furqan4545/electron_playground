// import { app, BrowserWindow, ipcMain } from "electron";
// import path from "path";

// import { isDev } from "./util.js";
// import { getPreloadPath } from "./pathResolver.js";

// let mainWindow: BrowserWindow;
// let selectorWindow: BrowserWindow | null = null;

// app.on("ready", () => {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: getPreloadPath(),
//     },
//   });

//   if (isDev()) {
//     mainWindow.loadURL("http://localhost:5173");
//   } else {
//     mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
//   }
//   // Handle the creation of selector window
//   ipcMain.handle("open-selector", () => {
//     // Minimize main window
//     mainWindow.minimize();

//     // Create transparent selector window
//     selectorWindow = new BrowserWindow({
//       width: 400,
//       height: 300,
//       frame: false, // Remove the default window frame
//       transparent: true,
//       webPreferences: {
//         preload: getPreloadPath(),
//       },
//       resizable: true,
//       movable: true,
//     });

//     if (isDev()) {
//       selectorWindow.loadURL("http://localhost:5173/selector"); // You'll create this route
//     } else {
//       selectorWindow.loadFile(
//         path.join(app.getAppPath(), "dist-react/selector.html")
//       );
//     }
//   });
// });

// import { app, BrowserWindow, ipcMain, desktopCapturer } from "electron";
// import path from "path";

// import { isDev } from "./util.js";
// import { getPreloadPath } from "./pathResolver.js";

// // import ffmpeg from "fluent-ffmpeg";
// import { path as ffmpegBinaryPath } from "@ffmpeg-installer/ffmpeg";
// import fs from "fs";
// import { writeFile, appendFile } from "fs/promises";

// import ffmpeg from "fluent-ffmpeg";
// import ffmpegStatic from "ffmpeg-static";
// import ffprobeStatic from "ffprobe-static";

// // Get the correct paths for the packaged app
// const getFfmpegPath = () => {
//   const ffmpegPath = ffmpegStatic as unknown as string;
//   console.log("FFmpeg path:", ffmpegPath);
//   return ffmpegPath;
// };

// const getFfprobePath = () => {
//   const ffprobePath = ffprobeStatic.path.replace(
//     "app.asar",
//     "app.asar.unpacked"
//   );
//   console.log("FFprobe path:", ffprobePath);
//   return ffprobePath;
// };

// app.whenReady().then(async () => {
//   const logPath = path.join(app.getPath("userData"), "ffmpeg-logs.txt");
//   const log = async (msg: string) => {
//     const timestamp = new Date().toISOString();
//     try {
//       // Set FFmpeg paths
//       ffmpeg.setFfmpegPath(getFfmpegPath());
//       ffmpeg.setFfprobePath(getFfprobePath());

//       console.log("FFmpeg setup complete");
//     } catch (error) {
//       console.error("FFmpeg setup failed:", error);
//     }
//   };

//   try {
//     const ffPath = getFfmpegPath();
//     await log(`Checking FFmpeg at: ${ffPath}`);
//     await log(`File exists: ${fs.existsSync(ffPath)}`);
//     await log(`Directory contents: ${fs.readdirSync(path.dirname(ffPath))}`);

//     ffmpeg.setFfmpegPath(ffPath);
//     await log(`FFmpeg path set: ${ffPath}`);
//     await log(`App is packaged: ${app.isPackaged}`);
//     await log(`Platform: ${process.platform}`);
//     await log(`Resources path: ${process.resourcesPath}`);

//     // Test FFmpeg
//     ffmpeg.getAvailableFormats((err, formats) => {
//       if (err) {
//         log(`FFmpeg test failed: ${err}`);
//       } else {
//         log("FFmpeg test successful");
//       }
//     });
//   } catch (error) {
//     await log(`FFmpeg Error: ${error}`);
//   }
// });

// ////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
// working code always

// import {
//   app,
//   BrowserWindow,
//   desktopCapturer,
//   ipcMain,
//   session,
//   systemPreferences,
//   screen,
// } from "electron";
// import path from "path";
// import { getPreloadPath } from "./pathResolver.js";
// import { isDev } from "./util.js";
// import fs from "fs";

// let mainWindow: BrowserWindow;
// let selectedSourceId: string | null = null;

// let cameraWindow: BrowserWindow | null = null; // Window for camera preview

// // Add cursor tracking interfaces
// interface CursorPosition {
//   x: number;
//   y: number;
//   timestamp: number;
//   type: "move" | "click";
//   display: {
//     id: number;
//     bounds: {
//       x: number;
//       y: number;
//       width: number;
//       height: number;
//     };
//   };
// }

// // Add cursor tracking variables
// let cursorTrackingInterval: NodeJS.Timeout | null = null;
// let trackingData: CursorPosition[] = [];
// let startTime: number = 0;

// const createMainWindow = () => {
//   mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: getPreloadPath(),
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

//   ///////////////////////////////////////////////////////////////
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
//   ///////////////////////////////////////////////////////////////

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

//   // Add a new handler for source selection
//   ipcMain.handle("selectSource", async (_, sourceId: string) => {
//     selectedSourceId = sourceId;
//     return true;
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
//       } finally {
//         selectedSourceId = null; // Reset after use
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

//   // Add cursor tracking IPC handlers
//   ipcMain.handle("startCursorTracking", () => {
//     console.log("Starting cursor tracking...");
//     trackingData = [];
//     startTime = Date.now();

//     cursorTrackingInterval = setInterval(() => {
//       const point = screen.getCursorScreenPoint();
//       const displays = screen.getAllDisplays();

//       // Find which display the cursor is currently on
//       const currentDisplay = displays.find((display) => {
//         const { x, y, width, height } = display.bounds;
//         return (
//           point.x >= x &&
//           point.x <= x + width &&
//           point.y >= y &&
//           point.y <= y + height
//         );
//       });

//       if (currentDisplay) {
//         trackingData.push({
//           x: point.x,
//           y: point.y,
//           timestamp: Date.now() - startTime,
//           type: "move",
//           display: {
//             id: currentDisplay.id,
//             bounds: currentDisplay.bounds,
//           },
//         });
//       }
//     }, 1000 / 30); // 30fps

//     return true;
//   });

//   // Stop cursor tracking
//   ipcMain.handle("stopCursorTracking", async () => {
//     console.log("Stopping cursor tracking...");

//     if (cursorTrackingInterval) {
//       clearInterval(cursorTrackingInterval);
//       cursorTrackingInterval = null;
//     }

//     const endTime = Date.now();
//     const duration = endTime - startTime;

//     const cursorData = {
//       recording_start_time: startTime,
//       recording_duration: duration,
//       frame_rate: 30,
//       screen_info: {
//         displays: screen.getAllDisplays().map((display) => ({
//           id: display.id,
//           bounds: display.bounds,
//           workArea: display.workArea,
//           scaleFactor: display.scaleFactor,
//           rotation: display.rotation,
//           internal: display.internal,
//         })),
//       },
//       tracking_data: trackingData,
//     };

//     try {
//       const downloadsPath = app.getPath("downloads");
//       const fileName = `cursor-data-${Date.now()}.json`;
//       const filePath = path.join(downloadsPath, fileName);

//       await fs.promises.writeFile(
//         filePath,
//         JSON.stringify(cursorData, null, 2),
//         "utf-8"
//       );

//       console.log("Cursor data saved to:", filePath);
//       trackingData = []; // Clear the data
//       return filePath;
//     } catch (error) {
//       console.error("Error saving cursor data:", error);
//       throw error;
//     }
//   });
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

/////////////////////////////////////////////////////////////
///// Working code with cursor tracking ////////

// import {
//   app,
//   BrowserWindow,
//   desktopCapturer,
//   ipcMain,
//   session,
//   systemPreferences,
//   screen,
// } from "electron";
// import path from "path";
// import { getPreloadPath } from "./pathResolver.js";
// import { isDev } from "./util.js";
// import fs from "fs";

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
// // let selectedSourceInfo: {
// //   id: string;
// //   bounds: { x: number; y: number; width: number; height: number };
// // } | null = null;

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

//   // Add a new handler for source selection
//   // ipcMain.handle("selectSource", async (_, sourceId: string) => {
//   //   selectedSourceId = sourceId;
//   //   return true;
//   // });

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

//////////////////////////////////////////////////////
/// TEST ///

import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  session,
  systemPreferences,
  screen,
} from "electron";
import path from "path";
import { getPreloadPath } from "./pathResolver.js";
import { isDev } from "./util.js";
import fs from "fs";

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

let cursorTrackingInterval: NodeJS.Timeout | null = null;
let trackingData: CursorData["tracking_data"] = [];
let startTime: number = 0;
let selectedSourceInfo: SourceInfo | null = null;
// let selectedSourceInfo: {
//   id: string;
//   bounds: { x: number; y: number; width: number; height: number };
// } | null = null;

let selectedSourceBounds: {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  isFullScreen: boolean;
} | null = null;

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

  // Add a new handler for source selection
  // ipcMain.handle("selectSource", async (_, sourceId: string) => {
  //   selectedSourceId = sourceId;
  //   return true;
  // });

  // // working code
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
});

// Add cleanup for cursor tracking
app.on("window-all-closed", () => {
  if (cursorTrackingInterval) {
    clearInterval(cursorTrackingInterval);
    cursorTrackingInterval = null;
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
});
