import { BrowserWindow, shell } from "electron";
import { join } from "node:path";
import type { MainWindow } from "./type";
import { getEnv, isDefined } from "@main/utils";
import { getIsQuitting } from "@main/state";
import { isDev } from "@main/config";
import { getWindowState, saveWindowState } from "@main/store";
import { setupAutoUpdater } from "@main/updater";

let mainWindow: MainWindow = null;

const getMainWindow = (): MainWindow => {
  return mainWindow;
};

const createMainWindow = (): void => {
  const windowState = getWindowState();

  mainWindow = new BrowserWindow({
    ...(windowState
      ? {
          x: windowState.x,
          y: windowState.y,
          width: windowState.width,
          height: windowState.height,
        }
      : {
          center: true,
          width: 1000,
          height: 700,
        }),
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      devTools: isDev,
    },
  });

  mainWindow.on("close", (e) => {
    const isQuitting = getIsQuitting();
    if (!mainWindow) return;

    if (isQuitting) {
      const position = mainWindow.getPosition();
      const size = mainWindow.getSize();

      saveWindowState(
        isDefined(position[0]),
        isDefined(position[1]),
        isDefined(size[0]),
        isDefined(size[1]),
      );
      return;
    }

    e.preventDefault();
    mainWindow.hide();
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
