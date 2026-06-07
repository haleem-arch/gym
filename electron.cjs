const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const os = require('os');
const urlModule = require('url');
const { spawn } = require('child_process');

let mainWindow;

// Redirect-safe simple file downloader in pure Node.js
function downloadFile(fileUrl, destPath, onProgress, onComplete, onError) {
  const protocol = fileUrl.startsWith('https') ? https : http;
  
  const request = protocol.get(fileUrl, (response) => {
    // Handle HTTP Redirects (301, 302, 307, 308)
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      const redirectUrl = urlModule.resolve(fileUrl, response.headers.location);
      return downloadFile(redirectUrl, destPath, onProgress, onComplete, onError);
    }
    
    if (response.statusCode !== 200) {
      onError(new Error(`Server returned HTTP ${response.statusCode}`));
      return;
    }
    
    const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
    let downloadedBytes = 0;
    const fileStream = fs.createWriteStream(destPath);
    
    response.pipe(fileStream);
    
    response.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      if (totalBytes > 0) {
        const percent = Math.round((downloadedBytes / totalBytes) * 100);
        onProgress(percent);
      }
    });
    
    fileStream.on('finish', () => {
      fileStream.close(() => {
        onComplete();
      });
    });
    
    fileStream.on('error', (err) => {
      fs.unlink(destPath, () => {});
      onError(err);
    });
  });
  
  request.on('error', (err) => {
    fs.unlink(destPath, () => {});
    onError(err);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'Life Gym Coach Portal',
    icon: path.join(__dirname, 'app_icon_rounded.png'),
    backgroundColor: '#060713', // Dark theme matching the portal style
    show: false, // Don't show the window until it's ready to avoid white flash
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Check if we are running in development mode via a command-line flag
  const isDev = process.argv.includes('--dev');
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('https://gym-kappa-three.vercel.app');
  }

  // Once the window is loaded and ready, display it
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Full Screen F11 and refresh (F5/Ctrl+R) keyboard shortcut listener
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      const isFullScreen = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFullScreen);
      event.preventDefault();
    }
    if ((input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) && input.type === 'keyDown') {
      mainWindow.webContents.reloadIgnoringCache();
      event.preventDefault();
    }
  });

  // Connection fail loader -> redirects to local offline page
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    // Only redirect main frame HTTP/HTTPS failures (not local file, devtools, or small assets)
    if (validatedURL.startsWith('http') && errorCode < 0) {
      mainWindow.loadFile(path.join(__dirname, 'offline.html'), {
        query: { url: validatedURL }
      });
    }
  });

  // Disable native menu bar (removes File/Edit/View menu on Windows/Linux)
  Menu.setApplicationMenu(null);
  if (mainWindow) {
    mainWindow.setMenu(null);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.on('download-and-install-update', (event, downloadUrl) => {
  const tempFilePath = path.join(os.tmpdir(), 'Life-Gym-Coach-Portal-Setup.exe');
  
  // Resolve relative Vercel URLs to absolute URLs
  let resolvedUrl = downloadUrl;
  if (downloadUrl.startsWith('/')) {
    resolvedUrl = 'https://gym-kappa-three.vercel.app' + downloadUrl;
  }
  
  downloadFile(
    resolvedUrl,
    tempFilePath,
    (percent) => {
      if (mainWindow) {
        mainWindow.webContents.send('update-progress', percent);
      }
    },
    () => {
      // Setup download complete, execute installer detached and close the app
      try {
        const child = spawn(tempFilePath, [], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        app.quit();
      } catch (err) {
        console.error('Failed to execute update installer:', err);
        if (mainWindow) {
          mainWindow.webContents.send('update-error', `Failed to execute installer: ${err.message}`);
        }
      }
    },
    (err) => {
      console.error('Update download error:', err);
      if (mainWindow) {
        mainWindow.webContents.send('update-error', `Download failed: ${err.message}`);
      }
    }
  );
});

// App lifecycle event listeners
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
