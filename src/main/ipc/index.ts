import { BrowserWindow, dialog, ipcMain } from "electron";
import { existsSync } from "node:fs";
import { isDefined } from "@main/utils";
import type { CaptureInterval, IpcHandlers } from "./type";
import { captureFrame } from "@main/ffmpeg";
import { store } from "@main/store";
import type { IPCChannels } from "@shared-types/ipc";

let captureInterval: CaptureInterval = null;

const handlers = {
  selectFolder: async () => {
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

  stopCapture: () => {
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
    }
  },

  getForm: () => {
    const formValues = store.get("form.values");

    return formValues;
  },

  saveForm: (_event, formData) => {
    store.set("form.values", formData);
  },

  resetFormValues: () => {
    store.delete("form.values");
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

  getFormAutoSave() {
    const autoSave = store.get("form.autoSave");

    return autoSave;
  },

  saveFormAutoSave(_event, autoSave) {
    store.set("form.autoSave", autoSave);
  },
} as const satisfies IpcHandlers;

export const setupIpc = () => {
  (Object.keys(handlers) as (keyof IPCChannels)[]).forEach((channel) => {
    ipcMain.handle(channel, handlers[channel]);
  });
};
