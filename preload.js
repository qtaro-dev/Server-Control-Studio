const { contextBridge, ipcRenderer } = require("electron");

// 管理タブも用途限定APIだけを公開し、任意のコマンドや生IPCは渡さない。
const managementRequest=(method,input)=>ipcRenderer.invoke('management:request',method,input);
contextBridge.exposeInMainWorld('managementAPI',Object.freeze({
  list:()=>managementRequest('list'),register:()=>managementRequest('register'),update:input=>managementRequest('update',input),env:id=>managementRequest('env',{id}),remove:id=>managementRequest('remove',{id}),inspect:id=>managementRequest('inspect',{id}),connection:id=>managementRequest('connection',{id}),operation:(id,action)=>managementRequest('operation',{id,action}),open:(id,path)=>managementRequest('open',{id,path}),preview:(id,token,text)=>managementRequest('preview',{id,token,text}),save:(id,token,text)=>managementRequest('save',{id,token,text}),complete:(id,service)=>managementRequest('complete',{id,service}),
}));

// Never expose raw IPC, Electron events, or filesystem access to the page.
contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("get-app-version"),
  getAboutInfo: () => ipcRenderer.invoke("about:info"),
  openLogoReference: (id) => ipcRenderer.invoke("legal:openLogoReference", id),
  openProjectPage: () => ipcRenderer.invoke("about:openProjectPage"),
  getImageCatalog: () => ipcRenderer.invoke("images:get"),
  updateImageCatalog: () => ipcRenderer.invoke("images:update"),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
  getSettingsPath: () => ipcRenderer.invoke("settings:path"),
  isDirectory: (path) => ipcRenderer.invoke("directory:check", path),
  initializeProjectPaths: () => ipcRenderer.invoke("settings:initializeProjectPaths"),
  pickDirectory: (title) => ipcRenderer.invoke("dialog:openDirectory", { title }),
  writeLog: (message) => ipcRenderer.invoke("write-log", message),
  saveGeneratedFile: (filename, content) => ipcRenderer.invoke("file:saveGenerated", filename, content),
  saveGeneratedBundle: (files, projectName) => ipcRenderer.invoke("file:saveBundle", files, projectName),
  onMenuCommand: (handler) => {
    const listener = (_event, command) => handler(command);
    ipcRenderer.on("menu-command", listener);
    return () => ipcRenderer.removeListener("menu-command", listener);
  },
});
