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
  // Add new cursor tracking methods
  startCursorTracking: () => ipcRenderer.invoke("startCursorTracking"),
  stopCursorTracking: () => ipcRenderer.invoke("stopCursorTracking"),
  openFile: (options: { 
    title: string; 
    filters: { name: string; extensions: string[] }[];
  }) => ipcRenderer.invoke("openFile", options),
  readJsonFile: (filePath: string) => ipcRenderer.invoke("readJsonFile", filePath),
  getVideoStream: (filePath: string) => ipcRenderer.invoke("getVideoStream", filePath),
  renderVideo: (data: { videoPath: string; cursorData: any }) => 
    ipcRenderer.invoke("renderVideo", data),

  // Add new methods for overlay window
  createOverlayWindow: () => ipcRenderer.invoke('createOverlayWindow'),
  closeOverlayWindow: () => ipcRenderer.invoke('closeOverlayWindow'),
  setClickThrough: (clickthrough: boolean) => ipcRenderer.invoke('setClickThrough', clickthrough),

  // Set drawing tool
  setDrawingTool: (toolState: { tool: string; color: string; width: number }) => 
    ipcRenderer.invoke("setDrawingTool", toolState),
  
  // on: (channel: string, callback: Function) => {
  //   console.log("Registering listener for channel:", channel);
  //   if (channel === 'setup-overlay' || channel === 'tool-change') {
  //     ipcRenderer.on(channel, (_, data) => callback(data));
  //   }
  // },
  on: (channel: string, callback: Function) => {
    console.log("Registering listener for channel:", channel);
    if (channel === 'setup-overlay' || channel === 'tool-change' || channel === 'canvas-clear') {
      ipcRenderer.on(channel, (_, data) => callback(data));
    }
  }

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

      startCursorTracking: () => Promise<boolean>;
      stopCursorTracking: () => Promise<string>;
      openFile: (options: {
        title: string;
        filters: { name: string; extensions: string[] }[];
      }) => Promise<string | null>;
      readJsonFile: (filePath: string) => Promise<any>;
      getVideoStream: (filePath: string) => Promise<{
        buffer: Uint8Array;
        size: number;
        type: string;
      }>;
      renderVideo: (data: { 
        videoPath: string; 
        cursorData: any 
      }) => Promise<string>;

      // Add new methods
      createOverlayWindow: () => Promise<void>;
      closeOverlayWindow: () => Promise<void>;
      setClickThrough: (clickthrough: boolean) => Promise<void>;

      on: (channel: string, callback: (data: any) => void) => void;
      // setDrawingTool: (tool: string) => Promise<void>;
      setDrawingTool: (toolState: { tool: string; color: string; width: number }) => Promise<void>;
    };
  }
}
