const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

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
      sandbox: true
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

  // Disable native menu bar (removes File/Edit/View menu on Windows/Linux)
  Menu.setApplicationMenu(null);
  if (mainWindow) {
    mainWindow.setMenu(null);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

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
