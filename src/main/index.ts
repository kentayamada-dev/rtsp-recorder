import { app } from "electron";
import { setupIpc } from "./ipc";
import { createMenu } from "./menu";
import { createTray } from "./tray";
import { createMainWindow, getMainWindow } from "./window";
import { setIsQuitting } from "./state";

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

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
  const isDev = import.meta.env.DEV;

  setupIpc();
  createMainWindow({ isDev });
  createMenu({ isDev });
  createTray(getMainWindow());
});

app.on("window-all-closed", () => {
  app.quit();
});
