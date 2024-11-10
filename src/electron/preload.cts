import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  // Get available screen sources
  getSources: () => ipcRenderer.invoke("getSources"),
  selectSource: (sourceId: string) =>
    ipcRenderer.invoke("selectSource", sourceId),

  // Save recording
  saveRecording: (buffer: Uint8Array) =>
    ipcRenderer.invoke("saveRecording", buffer),
  checkScreenPermission: () => ipcRenderer.invoke("checkScreenPermission"),
  getPlatform: () => ipcRenderer.invoke("getPlatform"),
  toggleCamera: (show: boolean) => ipcRenderer.invoke("toggleCamera", show),
  saveCameraRecording: (buffer: Uint8Array) =>
    ipcRenderer.invoke("saveCameraRecording", buffer),
  moveWindow: (x: number, y: number) => ipcRenderer.invoke("moveWindow", x, y), // Move camera window
});

declare global {
  interface Window {
    electron: {
      getSources: () => Promise<
        {
          id: string;
          name: string;
          thumbnailURL: string;
          display_id: string;
          appIcon: string | null;
        }[]
      >;
      selectSource: (sourceId: string) => Promise<boolean>;
      saveRecording: (buffer: Uint8Array) => Promise<string>;
      checkScreenPermission: () => Promise<boolean>;
      getPlatform: () => Promise<string>;
      toggleCamera: (show: boolean) => Promise<void>;
      saveCameraRecording: (buffer: Uint8Array) => Promise<string>;
      moveWindow: (x: number, y: number) => Promise<void>; // Move camera window
    };
  }
}
