const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const log = require('electron-log/main');

log.initialize();
log.transports.file.maxSize = 5 * 1024 * 1024;
log.info(`App start — v${app.getVersion()} · Electron ${process.versions.electron}`);

// Chỉ cho phép một instance — mở lần hai thì focus cửa sổ đang chạy
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null); // app thật không có menu bar kiểu trình duyệt
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    icon: path.join(__dirname, '../../build/icon.ico'),
    // Header của app vẽ đè lên vùng title bar — nút phóng to/thu nhỏ là nút native
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#202020',
      symbolColor: '#e6e6e6',
      height: 48,
    },
    // Mica (backgroundMaterial) của Electron chưa ổn định — DWM có máy không áp,
    // cửa sổ thành trong suốt thô nhìn xuyên ra sau. Dùng nền đặc cho chắc chắn.
    backgroundColor: '#202020',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Link ngoài (nếu có) mở bằng trình duyệt hệ thống, không mở trong app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Menu đã tắt nên gắn lại phím tắt DevTools để hỗ trợ chẩn đoán tại kho
  win.webContents.on('before-input-event', (_e, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      win.webContents.toggleDevTools();
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../../dist-renderer/index.html'));
  }
}

app.on('window-all-closed', () => {
  app.quit();
});

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception:', err);
});
