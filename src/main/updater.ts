import { BrowserWindow, dialog } from "electron";
import { autoUpdater } from "electron-updater";
import { logger } from "./log";

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

    if (result.response === 0) {
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

    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on("error", (error) => {
    logger.error("Auto-update error:", error);
    dialog.showErrorBox(
      "Update Error",
      "Something went wrong while updating the app. Please try again later.",
    );
  });

  autoUpdater.checkForUpdates();
};
