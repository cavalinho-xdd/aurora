/**
 * @file main.js
 * @description Electron Main Process entry point.
 * Orchestrates window lifecycle management, system tray integration, and IPC communications.
 * Contains critical logic for deep-linking (OAuth flows) and the "Hardcore Mode" constraint 
 * which deliberately intercepts application termination events.
 */
const { app, BrowserWindow, ipcMain, Tray, Menu, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

app.commandLine.appendSwitch('disable-vulkan');

const { startBlocker, stopBlocker } = require('./blocker');
const { generateQuestions, evaluateAnswers } = require('./geminiService');
const { loadData, saveData } = require('./storage');
const { getProcesses } = require('./scanner');
const { parseFile } = require('./fileParser');

let mainWindow;
let tray = null;
let isHardcoreMode = false;
let isQuitting = false;

/**
 * Deep Link & Single Instance Registration
 * Ensures OAuth redirects map back to a single running instance of the application.
 */
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('aurora', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('aurora')
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      const url = commandLine.pop()
      handleDeepLink(url);
    }
  })
}

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

const http = require('http');

let authServer = null;
let isFocusing = false;
let blockedDomains = [];

function startAuthServer() {
  if (authServer) return;
  authServer = http.createServer((req, res) => {
    if (req.url && req.url.startsWith('/auth?token=')) {
      try {
        const urlObj = new URL(req.url, 'http://127.0.0.1:43210');
        const token = urlObj.searchParams.get('token');
        if (mainWindow && token) {
          mainWindow.webContents.send('auth:google', token);
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.focus();
          
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="background:#0F172A; color:white; font-family:sans-serif; text-align:center; padding-top:100px;">
                <h2>Authentication Successful!</h2>
                <p>You can close this tab and return to the Aurora app.</p>
                <script>
                  setTimeout(() => { window.close(); }, 2000);
                </script>
              </body>
            </html>
          `);
        } else {
          res.writeHead(400);
          res.end('Bad Request: Missing token or window not ready');
        }
      } catch(e) {
        console.error("Local auth server error:", e);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    } else if (req.url === '/status') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        isFocusing,
        isHardcoreMode,
        blacklist: blockedDomains
      }));
    } else {
      res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
      res.end('Not Found');
    }
  });

  authServer.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.warn("Port 43210 is in use. Local auth server skipped. Relying on deep links.");
    } else {
      console.error("Auth server error:", e);
    }
  });

  authServer.listen(43210, '127.0.0.1', () => {
    console.log("Local auth server listening on 127.0.0.1:43210");
  });
}

function handleDeepLink(url) {
  if (url && url.startsWith('aurora://auth')) {
    try {
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get('token');
      if (mainWindow && token) {
        mainWindow.webContents.send('auth:google', token);
      }
    } catch (e) {
      console.error("Deep link parse error:", e);
    }
  }
}

/**
 * Bootstraps the primary rendering context.
 * Implements the graceful initialization pattern (ready-to-show) to prevent FOUC.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0F172A',
    autoHideMenuBar: true,
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (e) => {
    if (isHardcoreMode) {
      e.preventDefault();
      return;
    }
    
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  ipcMain.on('blocker:start', (event, { blacklist, hardcore, blockedWebsites }) => {
    isFocusing = true;
    isHardcoreMode = hardcore || false;
    blockedDomains = blockedWebsites || [];
    startBlocker(blacklist);
  });

  ipcMain.on('blocker:stop', () => {
    isFocusing = false;
    isHardcoreMode = false;
    blockedDomains = [];
    stopBlocker();
  });

  ipcMain.handle('gemini:generate', async (event, { topic, apiKey, lang, filePath }) => {
    let documentText = '';
    if (filePath) {
      console.log(`[Main] Parsing file for context: ${filePath}`);
      documentText = await parseFile(filePath);
    }
    return await generateQuestions(topic, apiKey, lang, documentText);
  });

  ipcMain.handle('gemini:evaluate', async (event, { qaPairs, apiKey, lang }) => {
    return await evaluateAnswers(qaPairs, apiKey, lang);
  });

  ipcMain.handle('storage:load', () => {
    return loadData();
  });

  ipcMain.handle('scanner:getProcesses', async () => {
    return await getProcesses();
  });

  ipcMain.handle('storage:save', (event, { data }) => {
    return saveData(data);
  });

  ipcMain.on('shell:openExternal', (event, { url }) => {
    shell.openExternal(url);
  });

  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Documents', extensions: ['pdf', 'docx', 'txt', 'md'] }
      ]
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      return { path: filePath, name: path.basename(filePath) };
    }
    return null;
  });

  autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('updater:available', info);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) mainWindow.webContents.send('updater:progress', progressObj);
  });

  autoUpdater.on('error', (err) => {
    if (mainWindow) mainWindow.webContents.send('updater:error', err.message);
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) mainWindow.webContents.send('updater:downloaded', info);
  });

  ipcMain.on('updater:install', () => {
    isQuitting = true;
    autoUpdater.quitAndInstall();
  });

  createWindow();
  startAuthServer();

  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify().catch(err => console.error("Updater error:", err));
  }

  try {
    tray = new Tray(path.join(__dirname, 'icon.png'));
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open Aurora', click: () => mainWindow.show() },
      { type: 'separator' },
      { 
        label: 'Quit', 
        click: () => {
          if (!isHardcoreMode) {
            isQuitting = true;
            app.quit();
          }
        } 
      }
    ]);
    tray.setToolTip('Aurora');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
      mainWindow.show();
    });
  } catch (err) {
    console.error("Failed to create tray:", err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  stopBlocker();
  if (process.platform !== 'darwin') app.quit();
});
