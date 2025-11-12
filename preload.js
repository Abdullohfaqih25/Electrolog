const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  loginAndDownload: () => ipcRenderer.invoke("login-and-download"),
});
