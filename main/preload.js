const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  blocker: {
    start: (blacklist, hardcore, blockedWebsites) => ipcRenderer.send('blocker:start', { blacklist, hardcore, blockedWebsites }),
    stop: () => ipcRenderer.send('blocker:stop')
  },
  gemini: {
    generate: (topic, apiKey, lang) => ipcRenderer.invoke('gemini:generate', { topic, apiKey, lang }),
    evaluate: (qaPairs, apiKey, lang) => ipcRenderer.invoke('gemini:evaluate', { qaPairs, apiKey, lang })
  },
  storage: {
    load: () => ipcRenderer.invoke('storage:load'),
    save: (data) => ipcRenderer.invoke('storage:save', { data })
  },
  scanner: {
    getProcesses: () => ipcRenderer.invoke('scanner:getProcesses')
  },
  shell: {
    openExternal: (url) => ipcRenderer.send('shell:openExternal', { url })
  },
  system: {
    openFileDialog: () => ipcRenderer.invoke('dialog:openFile')
  },
  updater: {
    onError: (callback) => ipcRenderer.on('updater:error', (event, error) => callback(error)),
    onAvailable: (callback) => ipcRenderer.on('updater:available', (event, info) => callback(info)),
    onProgress: (callback) => ipcRenderer.on('updater:progress', (event, progressObj) => callback(progressObj)),
    onDownloaded: (callback) => ipcRenderer.on('updater:downloaded', (event, info) => callback(info)),
    installUpdate: () => ipcRenderer.send('updater:install')
  },
  auth: {
    onGoogleAuth: (callback) => ipcRenderer.on('auth:google', (event, token) => callback(token))
  }
});
