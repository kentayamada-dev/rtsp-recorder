import { app, shell, BrowserWindow, dialog, Menu } from "electron";
import { join } from "node:path";
import { autoUpdater } from "electron-updater";
import log from "electron-log/main";
import { getEnv } from "./utils";
import { setupIpc } from "./ipc";

let mainWindow: BrowserWindow | null = null;
const isDev = import.meta.env.DEV;

log.initialize();
autoUpdater.logger = log;

if (!isDev) {
  Menu.setApplicationMenu(null);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (isDev) {
    mainWindow.loadURL(getEnv("ELECTRON_RENDERER_URL"));
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

const setupAutoUpdater = (): void => {
  if (isDev) return;

  autoUpdater.on("update-available", () => {
    if (!mainWindow) return;

    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Available",
        message: "A new version is available",
        detail: "Would you like to download and install the update?",
        buttons: ["Update Now", "Later"],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  });

  autoUpdater.on("update-downloaded", () => {
    if (!mainWindow) return;

    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update Ready",
        message: "The update is ready",
        detail: "Restart the app to apply the update",
        buttons: ["Restart Now", "Later"],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on("error", () => {
    dialog.showErrorBox(
      "Update Error",
      "Something went wrong while updating the app. Please try again later.",
    );
  });

  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdates();
};

app.whenReady().then(() => {
  setupIpc();
  createWindow();
  setupAutoUpdater();
});

app.on("window-all-closed", () => {
  app.quit();
});
