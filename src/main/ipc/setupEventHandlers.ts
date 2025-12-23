import { ipcMain } from "electron";
import type { EventHandlerMap, Interval, SendEvent } from "./types";
import { store } from "@main/store";
import { captureFrame, createVideo } from "@main/ffmpeg";
import { uploadVideo } from "@main/youtube";

const registerEventHandlers = (handlers: EventHandlerMap) => {
  (Object.keys(handlers) as Array<keyof EventHandlerMap>).forEach((channel) => {
    ipcMain.on(channel, handlers[channel]);
  });
};

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

export const setupEventHandlers = (sendEvent: SendEvent) => {
  registerEventHandlers({
    "capture:start": (_event, { rtspUrl, folderPath, interval }) => {
      captureInterval = captureFrame(rtspUrl, folderPath, interval, sendEvent);
    },
    "capture:stop": () => {
      if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
      }
    },
    "form:autosave": (_event, autoSave) => {
      store.set("form.autoSave", autoSave);
    },
    "form:reocrd:reset": () => {
      store.delete("captureForm.values");
    },
    "form:reocrd:save": (_envet, formData) => {
      store.set("captureForm.values", formData);
    },
    "form:upload:reset": () => {
      store.delete("uploadForm.values");
    },
    "form:upload:save": (_envet, formData) => {
      store.set("uploadForm.values", formData);
    },
    "upload:start": (_event, { folderPath, interval, fps, secretFilePath }) => {
      uploadInterval = setInterval(async () => {
        if (isUploading) return;
        isUploading = true;
        const { outputFilePath } = await createVideo(
          folderPath,
          fps,
          sendEvent,
        );
        const today = new Date();
        const videoTitle = getVideoTitle(today);
        await uploadVideo(
          today,
          secretFilePath,
          videoTitle,
          outputFilePath,
          sendEvent,
        );
        isUploading = false;
      }, interval * ONE_HOUR_MS);
    },
    "upload:stop": () => {
      if (uploadInterval) {
        clearInterval(uploadInterval);
        uploadInterval = null;
      }
    },
  });
};
