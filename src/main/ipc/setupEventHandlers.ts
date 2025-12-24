import { ipcMain } from "electron";
import type { EventHandlerMap, SendEvent } from "./types";
import { store } from "@main/store";
import cron, { type ScheduledTask } from "node-cron";
import { captureFrame, createVideo } from "@main/ffmpeg";
import { formatDate, isDefined } from "@main/utils";
import { uploadVideo } from "@main/youtube";

const registerEventHandlers = (handlers: EventHandlerMap) => {
  (Object.keys(handlers) as Array<keyof EventHandlerMap>).forEach((channel) => {
    ipcMain.on(channel, handlers[channel]);
  });
};

let captureInterval: ReturnType<typeof setInterval> | null = null;
let scheduledUploadTask: ScheduledTask | null = null;

const generateCronSchedule = (frequency: number): string => {
  const schedules: { [key: number]: number[] } = {
    1: [0], // midnight
    2: [0, 12], // midnight, noon
    3: [0, 8, 16], // every 8 hours
    4: [0, 6, 12, 18], // every 6 hours
    5: [0, 5, 10, 15, 20], // every 5 hours
    6: [0, 4, 8, 12, 16, 20], // every 4 hours
  };

  const hours = isDefined(schedules[frequency]);
  const hourString = hours.join(",");

  return `0 ${hourString} * * *`;
};

export const setupEventHandlers = (sendEvent: SendEvent) => {
  registerEventHandlers({
    "capture:start": (_event, { rtspUrl, interval, outputFolder }) => {
      captureInterval = captureFrame({
        rtspUrl,
        outputFolder,
        interval,
        sendEvent,
      });
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
    "form:capture:reset": () => {
      store.delete("captureForm.values");
    },
    "form:capture:save": (_envet, formData) => {
      store.set("captureForm.values", formData);
    },
    "form:upload:reset": () => {
      store.delete("uploadForm.values");
    },
    "form:upload:save": (_envet, formData) => {
      store.set("uploadForm.values", formData);
    },
    "upload:start": async (
      _event,
      { fps, inputFolder, numberUpload, secretFile },
    ) => {
      scheduledUploadTask = cron.schedule(
        generateCronSchedule(numberUpload),
        async () => {
          const today = new Date();
          const videoTitle = formatDate(today).second;
          const { outputFilePath } = await createVideo(
            inputFolder,
            fps,
            sendEvent,
            videoTitle,
          );
          await uploadVideo(secretFile, videoTitle, outputFilePath, sendEvent);
        },
      );
    },
    "upload:stop": () => {
      scheduledUploadTask?.stop();
      scheduledUploadTask = null;
    },
  });
};
