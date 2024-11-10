import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  // Get available screen sources
  getSources: () => ipcRenderer.invoke("getSources"),
  selectSource: (sourceId: string) =>
    ipcRenderer.invoke("selectSource", sourceId),

  // Start recording with specific source
  startRecording: (sourceId: string) =>
    ipcRenderer.invoke("startRecording", sourceId),

  // Stop recording
  stopRecording: () => ipcRenderer.invoke("stopRecording"),

  // Save recording
  saveRecording: (buffer: Uint8Array) =>
    ipcRenderer.invoke("saveRecording", buffer),
  checkScreenPermission: () => ipcRenderer.invoke("checkScreenPermission"),
  getPlatform: () => ipcRenderer.invoke("getPlatform"),
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
      startRecording: (sourceId: string) => Promise<{
        sourceId: string;
        systemAudio: boolean;
        audioConfig:
          | false
          | {
              mandatory: {
                chromeMediaSource: "desktop";
                chromeMediaSourceId: string;
              };
            };
      }>;
      stopRecording: () => Promise<boolean>;
      saveRecording: (buffer: Uint8Array) => Promise<string>;
      checkScreenPermission: () => Promise<boolean>;
      getPlatform: () => Promise<string>;
    };
  }
}
