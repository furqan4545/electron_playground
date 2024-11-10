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
// working code

// import {
//   app,
//   BrowserWindow,
//   desktopCapturer,
//   ipcMain,
//   session,
//   systemPreferences,
// } from "electron";
// import path from "path";
// import { getPreloadPath } from "./pathResolver.js";
// import { isDev } from "./util.js";
// import fs from "fs";

// let mainWindow: BrowserWindow;
// let selectedSourceId: string | null = null;

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
// });

// app.on("window-all-closed", () => {
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
///// TEST 2 ////////

import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  session,
  systemPreferences,
} from "electron";
import path from "path";
import { getPreloadPath } from "./pathResolver.js";
import { isDev } from "./util.js";
import fs from "fs";

let mainWindow: BrowserWindow;
let selectedSourceId: string | null = null;

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
  ipcMain.handle("selectSource", async (_, sourceId: string) => {
    selectedSourceId = sourceId;
    return true;
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
      } finally {
        selectedSourceId = null; // Reset after use
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
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
