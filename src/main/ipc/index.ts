import { BrowserWindow, dialog, ipcMain } from "electron";
import { stat, readFile } from "node:fs/promises";
import { isDefined } from "@main/utils";
import type { Interval, IpcEventHandlers, IpcHandlers } from "./type";
import { captureFrame, createVideo } from "@main/ffmpeg";
import { store } from "@main/store";
import type { IPCChannels, IPCEvents } from "@shared-types/ipc";
import { uploadVideo } from "@main/youtube";

let captureInterval: Interval = null;
let uploadInterval: Interval = null;
let isUploading = false;
const ONE_HOUR_MS = 3600000;

const getVideoTitle = (date: Date): string => {
  const pad = (num: number) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
};

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

  selectJsonFile: async () => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    try {
      const result = await dialog.showOpenDialog(isDefined(mainWindow), {
        properties: ["openFile"],
        filters: [{ name: "JSON Files", extensions: ["json"] }],
      });
      return isDefined(result.filePaths[0]);
    } catch (err) {
      return null;
    }
  },

  validateFolder: async (_event, folderPath) => {
    try {
      const stats = await stat(folderPath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  },

  validateJsonFile: async (_event, filePath) => {
    try {
      const stats = await stat(filePath);
      if (!stats.isFile()) return false;
      if (!filePath.endsWith(".json")) return false;

      const fileContent = await readFile(filePath, "utf-8");
      JSON.parse(fileContent);
      return true;
    } catch (error) {
      return false;
    }
  },

  getCaptureForm: async () => {
    const formValues = await store.get("captureForm.values");

    return formValues;
  },

  getUploadForm: async () => {
    const formValues = await store.get("uploadForm.values");

    return formValues;
  },

  getFormAutoSave: async () => {
    const autoSave = await store.get("form.autoSave");

    return autoSave;
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
} as const satisfies IpcHandlers;

const eventHandlers = {
  saveFormAutoSave: (_event, autoSave) => {
    store.set("form.autoSave", autoSave);
  },
  stopCapture: () => {
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
    }
  },

  startCapture: (_event, rtspUrl, folderPath, interval) => {
    captureInterval = captureFrame(rtspUrl, folderPath, interval);
  },

  stopUpload: () => {
    if (uploadInterval) {
      clearInterval(uploadInterval);
      uploadInterval = null;
    }
  },

  startUpload: async (_event, folderPath, interval, fps, secretFilePath) => {
    uploadInterval = setInterval(async () => {
      if (isUploading) return;
      isUploading = true;
      const { outputFilePath } = await createVideo(folderPath, fps);
      const today = new Date();
      const videoTitle = getVideoTitle(today);
      await uploadVideo(today, secretFilePath, videoTitle, outputFilePath);
      isUploading = false;
    }, interval * ONE_HOUR_MS);
  },

  saveRecordForm: (_event, formData) => {
    store.set("captureForm.values", formData);
  },

  saveUploadForm: (_event, formData) => {
    store.set("uploadForm.values", formData);
  },

  resetRecordForm: () => {
    store.delete("captureForm.values");
  },

  resetUploadForm: () => {
    store.delete("uploadForm.values");
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
