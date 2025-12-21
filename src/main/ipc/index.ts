import { BrowserWindow, dialog, ipcMain } from "electron";
import { access } from "node:fs/promises";
import { isDefined } from "@main/utils";
import type { CaptureInterval, IpcHandlers } from "./type";
import { captureFrame } from "@main/ffmpeg";
import { store } from "@main/store";
import type { IPCChannels } from "@shared-types/ipc";

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

  startCapture: (_event, rtspUrl, folderPath, interval) => {
    captureInterval = captureFrame(rtspUrl, folderPath, interval);
  },

  stopCapture: () => {
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
    }
  },

  getForm: async () => {
    const formValues = await store.get("form.values");

    return formValues;
  },

  saveForm: async (_event, formData) => {
    await store.set("form.values", formData);
  },

  resetFormValues: async () => {
    await store.delete("form.values");
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

  saveFormAutoSave: async (_event, autoSave) => {
    await store.set("form.autoSave", autoSave);
  },
} as const satisfies IpcHandlers;

export const setupIpc = () => {
  (Object.keys(handlers) as (keyof IPCChannels)[]).forEach((channel) => {
    ipcMain.handle(channel, handlers[channel]);
  });
};
