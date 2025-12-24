import { BrowserWindow, dialog } from "electron";
import { autoUpdater } from "electron-updater";
import { logger } from "./log";

const UPDATE_NOW = 0;

export const setupAutoUpdater = (mainWindow: BrowserWindow): void => {
  autoUpdater.autoDownload = false;

  autoUpdater.on("update-available", async () => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update Available",
      message: "A new version is available",
      detail: "Would you like to download and install the update?",
      buttons: ["Update Now", "Later"],
    });

    if (result.response === UPDATE_NOW) {
      autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on("update-downloaded", async () => {
    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update Ready",
      message: "The update is ready",
      detail: "Restart the app to apply the update",
      buttons: ["Restart Now", "Later"],
    });

    if (result.response === UPDATE_NOW) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on("error", async (error) => {
    logger.error("Auto-update error:", error);
    await dialog.showMessageBox(mainWindow, {
      type: "error",
      title: "Update Error",
      message: "Something went wrong while updating the app.",
      detail: "Please try again later.",
      buttons: ["OK"],
    });
  });

  autoUpdater.checkForUpdates();
};
