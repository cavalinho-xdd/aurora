const { app, BrowserWindow, ipcMain, Tray, Menu, shell } = require('electron');
const path = require('path');

// Disable Vulkan for Linux/Wayland compatibility
app.commandLine.appendSwitch('disable-vulkan');
const { startBlocker, stopBlocker } = require('./blocker');
const { generateQuestions, evaluateAnswers } = require('./geminiService');
const { loadData, saveData } = require('./storage');
const { getProcesses } = require('./scanner');

let mainWindow;
let tray = null;
let isHardcoreMode = false;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0F172A', // Dark mode background from UI/UX rules
    autoHideMenuBar: true, // Skryje horní menu bar (File, Edit, atd.)
    show: false
  });

  // Wait to show until ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (e) => {
    if (isHardcoreMode) {
      e.preventDefault(); // Zcela zablokuje i minimalizaci do traye, chceme to nechat viditelné
      return;
    }
    
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide(); // Minimalizace do traye
    }
  });

  // Load Vite dev server if in dev mode
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  // IPC handlers - MUST be registered before createWindow
  ipcMain.on('blocker:start', (event, { blacklist, hardcore }) => {
    isHardcoreMode = hardcore || false;
    startBlocker(blacklist);
  });

  ipcMain.on('blocker:stop', () => {
    isHardcoreMode = false;
    stopBlocker();
  });

  ipcMain.handle('gemini:generate', async (event, { topic, apiKey, lang }) => {
    return await generateQuestions(topic, apiKey, lang);
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

  createWindow();

  // Nastavení Tray ikony
  try {
    tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Otevřít Aurora', click: () => mainWindow.show() },
    { type: 'separator' },
    { 
      label: 'Ukončit', 
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
