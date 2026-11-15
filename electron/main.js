/**
 * BrainrotGP — Electron Desktop Main Process
 *
 * Runs the Next.js production server internally using Node.js
 * and displays the app in a dedicated Chromium window.
 *
 * Benefits:
 *  1. Completely standalone Windows app — no cloud server hosting required
 *  2. Connects directly to OpenF1 API from the user's computer
 *  3. Audio continues playing in the background even when switching windows
 *  4. Works out-of-the-box with zero configuration
 */

const { app, BrowserWindow, shell, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const http = require('http');
const net  = require('net');

const DEV_MODE = process.argv.includes('--dev');
const APP_ROOT = path.join(__dirname, '..');

let mainWindow = null;
let httpServer = null;
let appPort    = 3000;

// ── Find an available port (prefers 3000, falls back gracefully) ──────────────
function getAvailablePort(preferredPort = 3000) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.listen(preferredPort, '127.0.0.1', () => {
      const port = tester.address().port;
      tester.close(() => resolve(port));
    });
    tester.on('error', () => {
      const fallback = net.createServer();
      fallback.listen(0, '127.0.0.1', () => {
        const port = fallback.address().port;
        fallback.close(() => resolve(port));
      });
    });
  });
}

// ── In-Process Next.js Server ─────────────────────────────────────────────────
async function startServer() {
  appPort = await getAvailablePort(3000);
  console.log(`[BrainrotGP] Starting internal server on port ${appPort}...`);

  const next = require('next');
  const nextApp = next({
    dev: DEV_MODE,
    dir: APP_ROOT,
    quiet: !DEV_MODE,
  });

  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();

  return new Promise((resolve, reject) => {
    httpServer = http.createServer((req, res) => {
      handle(req, res);
    });

    httpServer.listen(appPort, '127.0.0.1', (err) => {
      if (err) return reject(err);
      console.log(`[BrainrotGP] Ready on http://127.0.0.1:${appPort}`);
      resolve(appPort);
    });
  });
}

// ── Create Main Window ────────────────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#000000',
    title: 'BrainrotGP',
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false, // Ensures audio & video continue playing when window is unfocused
    },
  });

  // Explicitly identify BrainrotGP desktop app in userAgent
  const currentUA = mainWindow.webContents.getUserAgent();
  mainWindow.webContents.setUserAgent(`${currentUA} BrainrotGP-Desktop/${app.getVersion()}`);

  Menu.setApplicationMenu(buildMenu());

  mainWindow.loadURL(`http://127.0.0.1:${appPort}/`);

  // Open external links (github, docs) in default system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (DEV_MODE) {
    mainWindow.webContents.openDevTools();
  }
}

// ── Splash Screen Window ──────────────────────────────────────────────────────
function showSplashWindow() {
  const splash = new BrowserWindow({
    width: 480,
    height: 300,
    frame: false,
    resizable: false,
    center: true,
    backgroundColor: '#000000',
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splash.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #000000;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 20px;
          user-select: none;
        }
        .title {
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #ff334b;
          text-align: center;
          line-height: 0.9;
        }
        .status {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .bar {
          width: 140px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }
        .bar-inner {
          position: absolute;
          inset: 0;
          background: #ff334b;
          animation: slide 1.2s infinite ease-in-out;
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      </style>
    </head>
    <body>
      <div class="title">BRAINROT<br/>GP</div>
      <div class="bar"><div class="bar-inner"></div></div>
      <div class="status">Starting Local Engine...</div>
    </body>
    </html>
  `));

  return splash;
}

// ── Application Menu ──────────────────────────────────────────────────────────
function buildMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'BrainrotGP',
      submenu: [
        { label: 'Open Dashboard', accelerator: 'CmdOrCtrl+D', click: () => mainWindow?.loadURL(`http://127.0.0.1:${appPort}/dashboard`) },
        { label: 'Paddock Home / Lineup', accelerator: 'CmdOrCtrl+H', click: () => mainWindow?.loadURL(`http://127.0.0.1:${appPort}/`) },
        { type: 'separator' },
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', click: () => mainWindow?.webContents.reloadIgnoringCache() },
        { type: 'separator' },
        { label: 'Quit BrainrotGP', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Full Screen', accelerator: 'F11', role: 'togglefullscreen' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Developer Tools', accelerator: 'F12', click: () => mainWindow?.webContents.toggleDevTools() },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates...',
          click: () => {
            if (DEV_MODE) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Development Mode',
                message: 'Update checks are disabled in development mode.',
              });
              return;
            }
            autoUpdater.checkForUpdatesAndNotify().catch((err) => {
              dialog.showMessageBox(mainWindow, {
                type: 'error',
                title: 'Update Error',
                message: 'Failed to check for updates: ' + (err.message || err),
              });
            });
          },
        },
        { type: 'separator' },
        { label: 'GitHub Repository', click: () => shell.openExternal('https://github.com/Piyushgarg06/Brainrot-GP') },
        { label: 'OpenF1 Live API', click: () => shell.openExternal('https://openf1.org') },
      ],
    },
  ]);
}

// ── Auto Updater ─────────────────────────────────────────────────────────────
function setupAutoUpdater() {
  if (DEV_MODE) {
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    console.log('[BrainrotGP] Update available:', info.version);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[BrainrotGP] Update downloaded:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      dialog
        .showMessageBox(mainWindow, {
          type: 'info',
          title: 'Update Ready',
          message: `A new version of BrainrotGP (v${info.version}) has been downloaded.`,
          detail: 'Restart BrainrotGP now to apply the update, or it will automatically apply the next time you open the app.',
          buttons: ['Restart & Install', 'Later'],
          defaultId: 0,
          cancelId: 1,
        })
        .then((returnValue) => {
          if (returnValue.response === 0) {
            autoUpdater.quitAndInstall();
          }
        });
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('[BrainrotGP] Auto-updater error:', err == null ? 'unknown' : (err.stack || err).toString());
  });

  // Check for updates on launch after 3 seconds
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.error('[BrainrotGP] Startup update check failed:', err);
    });
  }, 3000);
}

// ── App Lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Prevent Windows/Chromium from suspending audio/timers when in background
  app.commandLine.appendSwitch('disable-renderer-backgrounding');
  app.commandLine.appendSwitch('disable-background-timer-throttling');
  app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

  const splash = showSplashWindow();

  try {
    await startServer();
  } catch (err) {
    console.error('[BrainrotGP] Failed to start internal server:', err);
  }

  if (splash && !splash.isDestroyed()) {
    splash.close();
  }

  createMainWindow();
  setupAutoUpdater();
});

app.on('window-all-closed', () => {
  if (httpServer) {
    httpServer.close();
  }
  app.quit();
});

app.on('before-quit', () => {
  if (httpServer) {
    httpServer.close();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
