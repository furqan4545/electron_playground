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

import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";

let mainWindow: BrowserWindow;
let selectorWindow: BrowserWindow | null = null;

app.on("ready", () => {
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
    mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
  }
  // Handle the creation of selector window
  ipcMain.handle("open-selector", () => {
    // Minimize main window
    mainWindow.minimize();

    // Create transparent selector window
    selectorWindow = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false, // Remove the default window frame
      transparent: true,
      webPreferences: {
        preload: getPreloadPath(),
      },
      resizable: true,
      movable: true,
    });

    if (isDev()) {
      selectorWindow.loadURL("http://localhost:5173/selector"); // You'll create this route
    } else {
      selectorWindow.loadFile(
        path.join(app.getAppPath(), "dist-react/selector.html")
      );
    }
  });
  ipcMain.handle("close-selector", () => {
    if (selectorWindow) {
      selectorWindow.close();
      selectorWindow = null;
      // Restore main window
      mainWindow.restore();
    }
  });
});
