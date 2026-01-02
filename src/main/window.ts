import { app, BrowserWindow, shell } from "electron";
import { join } from "node:path";
import { getEnv, isDefined } from "@main/utils";
import { quitting } from "@main/state";
import { store } from "@main/store";
import { setupAutoUpdater } from "@main/updater";
import { config } from "./config";
import type { WindowState } from "./store/type";

const createMainWindow = async (
  windowState: WindowState | undefined,
): Promise<BrowserWindow> => {
  const mainWindow = new BrowserWindow({
    ...(windowState
      ? {
          ...Object.fromEntries(
            Object.entries(windowState).filter(
              ([, value]) => value !== undefined,
            ),
          ),
        }
      : {
          center: true,
          width: 1000,
          height: 700,
        }),
    show: false,
    backgroundColor: "#23272e",
    title: config["appTitle"],
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      devTools: config["dev"],
    },
  });

  app.on("second-instance", () => {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  });

  mainWindow.on("close", async (e) => {
    const isQuitting = quitting.get();
    if (!mainWindow) return;

    if (isQuitting) {
      const position = mainWindow.getPosition();
      const size = mainWindow.getSize();

      await store.set("window", {
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

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.once("show", () => {
    if (config["dev"]) return;

    setTimeout(() => {
      if (!mainWindow) return;
      setupAutoUpdater(mainWindow);
    }, 3000);
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (config["dev"]) {
    mainWindow.loadURL(getEnv("ELECTRON_RENDERER_URL"));
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  return mainWindow;
};

export { createMainWindow };
