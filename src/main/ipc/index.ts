import { BrowserWindow, dialog, ipcMain } from "electron";
import type { IPCChannels } from "@ipc-channel-types";
import { existsSync } from "node:fs";
import { isDefined } from "@main/utils";
import type { CaptureInterval, IpcHandlers } from "./type";
import { captureFrame } from "@main/ffmpeg";

let captureInterval: CaptureInterval = null;

const handlers = {
  selectFolder: async (_event) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(isDefined(mainWindow), {
      properties: ["openDirectory"],
    });
    return isDefined(result.filePaths[0]);
  },

  validateFolder: (_event, folderPath) => {
    return existsSync(folderPath);
  },

  startCapture: (_event, rtspUrl, folderPath, interval) => {
    captureInterval = captureFrame(rtspUrl, folderPath, interval);
  },

  stopCapture: (_event) => {
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
    }
  },
} satisfies IpcHandlers;

export const setupIpc = () => {
  (Object.keys(handlers) as (keyof IPCChannels)[]).forEach((channel) => {
    ipcMain.handle(channel, handlers[channel]);
  });
};
