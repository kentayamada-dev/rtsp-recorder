import { BrowserWindow, dialog } from "electron";
import { autoUpdater } from "electron-updater";
import { config } from "./config";
import { i18n } from "./i18n";

export const setupAutoUpdater = (mainWindow: BrowserWindow): void => {
  autoUpdater.autoDownload = false;

  autoUpdater.on("update-available", async () => {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: config["appTitle"],
      message: i18n.t("autoUpdater.updateAvailable"),
      detail: i18n.t("autoUpdater.updateAvailableDetail"),
      buttons: [i18n.t("autoUpdater.updateNow"), i18n.t("menuBar.later")],
    });

    if (response === 0) {
      autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on("update-downloaded", async () => {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: config["appTitle"],
      message: i18n.t("autoUpdater.updateDownloaded"),
      detail: i18n.t("autoUpdater.updateDownloadedDetail"),
      buttons: [i18n.t("autoUpdater.restartNow"), i18n.t("menuBar.later")],
    });

    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on("error", async () => {
    await dialog.showMessageBox(mainWindow, {
      type: "error",
      title: config["appTitle"],
      message: i18n.t("autoUpdater.updateError"),
      detail: i18n.t("autoUpdater.updateErrorDetail"),
      buttons: ["OK"],
    });
  });

  autoUpdater.checkForUpdates();
};
