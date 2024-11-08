// import { contextBridge, ipcRenderer } from "electron";

// // electron.contextBridge.exposeInMainWorld("electron", {
// //   subscribe: (callback: (statistics: any) => void) => callback({}),
// //   getStaticData: () => console.log("getting static data ali. "),
// // });

// contextBridge.exposeInMainWorld("electron", {
//   openSelector: () => ipcRenderer.invoke("open-selector"),
// });

// declare global {
//   interface Window {
//     electron: {
//       openSelector: () => Promise<void>;
//     };
//   }
// }

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  openSelector: () => ipcRenderer.invoke("open-selector"),
  closeSelector: () => ipcRenderer.invoke("close-selector"), // Add this
});

declare global {
  interface Window {
    electron: {
      openSelector: () => Promise<void>;
      closeSelector: () => Promise<void>; // Add this
    };
  }
}
