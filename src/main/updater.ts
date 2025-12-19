import { BrowserWindow, dialog } from "electron";
import { autoUpdater } from "electron-updater";
import { logger } from "./log";

export const setupAutoUpdater = (mainWindow: BrowserWindow): void => {
  autoUpdater.logger = logger;
  autoUpdater.autoDownload = false;

  autoUpdater.on("update-available", () => {
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

  autoUpdater.on("error", (error) => {
    logger.error("Auto-update error:", error);
    dialog.showErrorBox(
      "Update Error",
      "Something went wrong while updating the app. Please try again later.",
    );
  });

  autoUpdater.checkForUpdates();
};
