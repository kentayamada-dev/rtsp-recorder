import { app, dialog, ipcMain, shell, type BrowserWindow } from "electron";
import type { EventHandlerMap, SendEvent } from "./types";
import { store } from "@main/store";
import { type ScheduledTask, schedule } from "node-cron";
import {
  deleteFiles,
  formatDate,
  generateCronSchedule,
  getFilesByExtension,
  handleError,
  validatePath,
} from "@main/utils";
import { join } from "node:path";
import { createFFmpeg } from "@main/ffmpeg";
import { createGoogle } from "@main/google";
import { logger } from "@main/log";
import { config } from "@main/config";
import type { Auth } from "googleapis";
import { i18n } from "@main/i18n";

const registerEventHandlers = (handlers: EventHandlerMap) => {
  (Object.keys(handlers) as Array<keyof EventHandlerMap>).forEach((channel) => {
    ipcMain.on(channel, handlers[channel]);
  });
};

let captureInterval: ReturnType<typeof setInterval>;
let scheduledUploadTask: ScheduledTask;

export const setupEventHandlers = (
  sendEvent: SendEvent,
  mainWindow: BrowserWindow,
) => {
  const ffmpegExe = config["dev"]
    ? join(
        app.getAppPath(),
        `node_modules/ffmpeg-static/${config["files"]["ffmpeg"]}`,
      )
    : join(process.resourcesPath, config["files"]["ffmpeg"]);

  const ffmpeg = createFFmpeg(ffmpegExe, logger);

  const appData = app.getPath("userData");

  registerEventHandlers({
    "file:open": (_envet, { filePath }) => {
      shell.openPath(filePath);
    },
    reset: () => {
      store.delete("form");
      store.delete("google");
    },
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
      }
      sendEvent("capture:message", {
        message: "Capture stopped",
      });
    },

    "form:capture": (_envet, formData) => {
      store.set("form.captureForm", formData);
    },
    "form:upload": (_envet, formData) => {
      store.set("form.uploadForm", formData);
    },
    "google:secretFile": (_envet, googleSecretFile) => {
      store.set("google.secretFile", googleSecretFile);
    },
    "google:sheet:enabled": (_envet, enabled) => {
      store.set("google.sheet.enabled", enabled);
    },
    "google:sheet:values": (_envet, data) => {
      store.set("google.sheet.values", data);
    },
    "upload:start": (_event, { fps, inputFolder, numberUpload }) => {
      scheduledUploadTask = schedule(
        generateCronSchedule(numberUpload),
        async () => {
          try {
            const today = new Date();
            const videoTitle = formatDate(today).second;

            const images = await getFilesByExtension(
              inputFolder,
              config["files"]["imageExt"],
            );

            if (images.length === 0) {
              throw new Error(i18n.t("error.imagesNotFound"));
            }

            sendEvent("capture:message", {
              message: "Creating video...",
            });

            const { videoFile } = await ffmpeg.createVideo(
              inputFolder,
              fps,
              join(appData, "images_list.tmp"),
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

            const secretFile = await store.get("google.secretFile");

            if (!secretFile) {
              throw new Error(i18n.t("error.secretFileNotFound"));
            }

            const tokenFile = join(appData, config["files"]["token"]);

            if (!(await validatePath(tokenFile, "json"))) {
              throw new Error(i18n.t("error.generateToken"));
            }

            const google = createGoogle(tokenFile, secretFile, logger);
            let googleAuthClient: Auth.OAuth2Client;

            googleAuthClient = await google.loadOAuthClient();

            const videoUrl = await google.uploadVideo(
              googleAuthClient,
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
              message: `Uploaded: ${videoUrl}`,
            });

            const googleSheetEnabled = await store.get("google.sheet.enabled");
            if (!googleSheetEnabled) return;
            const googleSheetForm = await store.get("google.sheet.values");

            if (!googleSheetForm?.sheetId || !googleSheetForm?.sheetTitle) {
              throw new Error(i18n.t("error.setSheetData"));
            }
            await google.insertData(
              googleAuthClient,
              googleSheetForm.sheetId,
              googleSheetForm.sheetTitle,
              ["Uploaded Date", "Link"],
              [[today.toString(), videoUrl]],
            );
          } catch (error) {
            const errorObj = handleError(error);
            const { message } = errorObj;

            logger.error("Upload Error: ", errorObj);

            dialog.showMessageBox(mainWindow, {
              type: "error",
              title: config["appTitle"],
              message,
            });
          }
        },
      );
    },
    "upload:stop": () => {
      scheduledUploadTask?.stop();
    },
  });
};
