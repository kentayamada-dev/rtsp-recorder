import { app, ipcMain } from "electron";
import type { EventHandlerMap, SendEvent } from "./types";
import { store } from "@main/store";
import cron, { type ScheduledTask } from "node-cron";
import {
  deleteFiles,
  formatDate,
  generateCronSchedule,
  getFilesByExtension,
} from "@main/utils";
import { join } from "node:path";
import { isDev } from "@main/config";
import { createFFmpeg } from "@main/ffmpeg";
import { createYouTube } from "@main/youtube";
import { logger } from "@main/log";

const registerEventHandlers = (handlers: EventHandlerMap) => {
  (Object.keys(handlers) as Array<keyof EventHandlerMap>).forEach((channel) => {
    ipcMain.on(channel, handlers[channel]);
  });
};

let captureInterval: ReturnType<typeof setInterval> | null = null;
let scheduledUploadTask: ScheduledTask | null = null;

export const setupEventHandlers = (sendEvent: SendEvent) => {
  const ffmpegExeFile = "ffmpeg.exe";

  const ffmpegExe = isDev
    ? join(app.getAppPath(), `node_modules/ffmpeg-static/${ffmpegExeFile}`)
    : join(process.resourcesPath, ffmpegExeFile);

  const ffmpeg = createFFmpeg(ffmpegExe, logger);

  registerEventHandlers({
    "capture:start": (_event, { interval, ...rest }) => {
      sendEvent("capture:message", {
        message: "Capture started",
      });
      captureInterval = setInterval(async () => {
        await ffmpeg.captureFrame({
          ...rest,
          onCapture: (filename) => {
            sendEvent("capture:message", { message: `Captured: ${filename}` });
          },
        });
      }, interval * 1000);
    },
    "capture:stop": () => {
      if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
      }
      sendEvent("capture:message", {
        message: "Capture stopped",
      });
    },
    "form:autosave": (_event, autoSave) => {
      store.set("form.autoSave", autoSave);
    },
    "form:capture:reset": () => {
      store.delete("captureForm");
    },
    "form:capture:save": (_envet, formData) => {
      store.set("captureForm", formData);
    },
    "form:upload:reset": () => {
      store.delete("uploadForm");
    },
    "form:upload:save": (_envet, formData) => {
      store.set("uploadForm", formData);
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
          const images = await getFilesByExtension(inputFolder, ".png");
          if (images.length === 0) {
            throw new Error("No images found to create video");
          }
          sendEvent("capture:message", {
            message: "Creating video...",
          });
          const { videoFile } = await ffmpeg.createVideo(
            inputFolder,
            fps,
            join(app.getPath("userData"), "images_list.tmp"),
            images,
            (progress) => {
              sendEvent("capture:progress", { progress });
              sendEvent("capture:message", {
                message: `Creating video: ${progress}% complete`,
              });
            },
          );
          sendEvent("capture:message", {
            message: `Video created: ${videoFile}`,
          });
          await deleteFiles(images);
          sendEvent("upload:message", {
            message: "Uploading video...",
          });
          const youtube = createYouTube(
            join(app.getPath("userData"), "token.json"),
            secretFile,
            logger,
          );
          const videoId = await youtube.uploadVideo(
            videoTitle,
            videoFile,
            (progress) => {
              sendEvent("upload:progress", { progress });
              sendEvent("upload:message", {
                message: `Upload video: ${progress}% complete`,
              });
            },
          );
          sendEvent("upload:message", {
            message: `Uploaded: https://youtu.be/${videoId}`,
          });
        },
      );
    },
    "upload:stop": () => {
      scheduledUploadTask?.stop();
      scheduledUploadTask = null;
    },
  });
};
