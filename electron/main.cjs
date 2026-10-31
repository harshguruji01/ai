const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

const isDev = process.env.NODE_ENV === 'development';
const APP_URL = process.env.GURUAI_URL || 'https://ai.webguruji.online';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: 'GuruAI – AI Answer Engine by HarshGuruJi',
    icon: path.join(__dirname, '../public/logo.png'),
    autoHideMenuBar: true,
    backgroundColor: '#0B1120',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: true
    }
  });

  // Load the web app URL or local fallback
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadURL(APP_URL);
  }

  // Handle external links safely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Minimize to tray instead of quitting when close clicked (optional preference)
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, '../public/logo.png');
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open GuruAI (Ctrl+Shift+G)',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'New Thread',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.webContents.send('guruai-action', 'new-thread');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Visit HarshGuruJi (webguruji.online)',
        click: () => shell.openExternal('https://webguruji.online')
      },
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('GuruAI – AI Answer Engine');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      }
    });
  } catch (err) {
    console.error('Tray initialization error:', err);
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Register Global Shortcut: Ctrl + Shift + G to toggle GuruAI
  globalShortcut.register('CommandOrControl+Shift+G', () => {
    if (mainWindow) {
      if (mainWindow.isVisible() && mainWindow.isFocused()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
