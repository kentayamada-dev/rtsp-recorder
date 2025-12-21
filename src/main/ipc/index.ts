import { BrowserWindow, dialog, ipcMain } from "electron";
import { access } from "node:fs/promises";
import { isDefined } from "@main/utils";
import type { CaptureInterval, IpcEventHandlers, IpcHandlers } from "./type";
import { captureFrame } from "@main/ffmpeg";
import { store } from "@main/store";
import type { IPCChannels, IPCEvents } from "@shared-types/ipc";

let captureInterval: CaptureInterval = null;

const handlers = {
  selectFolder: async () => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    try {
      const result = await dialog.showOpenDialog(isDefined(mainWindow), {
        properties: ["openDirectory"],
      });
      return isDefined(result.filePaths[0]);
    } catch (err) {
      return null;
    }
  },

  validateFolder: async (_event, folderPath) => {
    try {
      await access(folderPath);
      return true;
    } catch (error) {
      return false;
    }
  },

  getForm: async () => {
    const formValues = await store.get("form.values");

    return formValues;
  },

  showQuestionMessage: async (_event, title, message) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    const result = await dialog.showMessageBox(isDefined(mainWindow), {
      type: "question",
      title,
      buttons: ["No", "Yes"],
      message,
    });
    return result.response === 1;
  },

  getFormAutoSave: async () => {
    const autoSave = await store.get("form.autoSave");

    return autoSave;
  },
} as const satisfies IpcHandlers;

const eventHandlers = {
  stopCapture: () => {
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
    }
  },
  startCapture: (_event, rtspUrl, folderPath, interval) => {
    captureInterval = captureFrame(rtspUrl, folderPath, interval);
  },
  saveForm: (_event, formData) => {
    store.set("form.values", formData);
  },

  resetFormValues: () => {
    store.delete("form.values");
  },

  saveFormAutoSave: (_event, autoSave) => {
    store.set("form.autoSave", autoSave);
  },
} as const satisfies Partial<IpcEventHandlers>;

export const setupIpc = () => {
  (Object.keys(handlers) as (keyof IPCChannels)[]).forEach((channel) => {
    ipcMain.handle(channel, handlers[channel]);
  });

  (Object.keys(eventHandlers) as (keyof IPCEvents)[]).forEach((channel) => {
    ipcMain.on(channel, eventHandlers[channel]);
  });
};

export const sendEvent = <K extends keyof IPCEvents>(
  channel: K,
  ...args: IPCEvents[K]
) => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  mainWindow?.webContents.send(channel, ...args);
};
