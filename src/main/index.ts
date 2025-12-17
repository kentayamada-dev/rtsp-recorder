import { app } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log/main";
import { setupIpc } from "./ipc";
import { createMenu } from "./menu";
import { createTray } from "./tray";
import { createMainWindow, getMainWindow } from "./window";
import { setIsQuitting } from "./state";

const isDev = import.meta.env.DEV;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

log.initialize();
autoUpdater.logger = log;

app.on("before-quit", () => {
  setIsQuitting(true);
});

app.on("second-instance", (_event) => {
  const mainWindow = getMainWindow();

  if (!mainWindow) return;

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
});

app.whenReady().then(() => {
  setupIpc();
  createMainWindow({ isDev });
  createMenu();
  createTray(getMainWindow());
});

app.on("window-all-closed", () => {
  app.quit();
});
