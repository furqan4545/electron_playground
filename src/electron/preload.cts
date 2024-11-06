const electron = require("electron");

electron.contextBridge.exposeInMainWorld("electron", {
  subscribe: (callback: (statistics: any) => void) => callback({}),
  getStaticData: () => console.log("getting static data ali. "),
});
