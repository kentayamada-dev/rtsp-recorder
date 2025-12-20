import { BrowserWindow, shell } from "electron";
import { join } from "node:path";
import type { MainWindow } from "./type";
import { getEnv, isDefined } from "@main/utils";
import { getIsQuitting } from "@main/state";
import { isDev } from "@main/config";
import { store } from "@main/store";
import { setupAutoUpdater } from "@main/updater";

let mainWindow: MainWindow = null;

const getMainWindow = (): MainWindow => {
  return mainWindow;
};

const createMainWindow = (): void => {
  const window = store.get("window");

  mainWindow = new BrowserWindow({
    ...(window
      ? {
          ...Object.fromEntries(
            Object.entries(window).filter(([, value]) => value !== undefined),
          ),
        }
      : {
          center: true,
          width: 1000,
          height: 700,
        }),
    show: false,
    backgroundColor: "#23272e",
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

      store.set("window", {
        x: isDefined(position[0]),
        y: isDefined(position[1]),
        width: isDefined(size[0]),
        height: isDefined(size[1]),
      });
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
    }, 3000);
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
