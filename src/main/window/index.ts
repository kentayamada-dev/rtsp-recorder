import { BrowserWindow, shell } from "electron";
import { join } from "node:path";
import type { CreateWindowOptions, MainWindow } from "./type";
import { setupAutoUpdater } from "../updater";
import { getEnv } from "../utils";
import { getIsQuitting } from "../state";

let mainWindow: MainWindow = null;

const getMainWindow = (): MainWindow => {
  return mainWindow;
};

const createMainWindow = ({ isDev }: CreateWindowOptions): void => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      devTools: isDev,
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({
      mode: "detach",
    });
  }

  mainWindow.on("close", (e) => {
    if (getIsQuitting()) return;

    e.preventDefault();
    mainWindow?.hide();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.once("show", () => {
    if (isDev) return;

    setTimeout(() => {
      if (!mainWindow) return;
      setupAutoUpdater(mainWindow);
    }, 5000);
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
};

export { getMainWindow, createMainWindow };
