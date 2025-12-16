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

  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info);
    if (!mainWindow) return;

    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "アップデート利用可能",
        message: "新しいバージョンが利用可能です",
        detail: "アップデートをダウンロードしてインストールしますか？",
        buttons: ["今すぐ更新", "あとで"],
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
        title: "アップデート準備完了",
        message: "アップデートの準備ができました",
        detail: "アプリを再起動して更新を適用します",
        buttons: ["今すぐ再起動", "あとで"],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on("error", (error) => {
    dialog.showErrorBox(
      "アップデートエラー",
      error == null ? "unknown" : (error.stack || error).toString(),
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
