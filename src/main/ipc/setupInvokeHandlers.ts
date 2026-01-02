import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { store } from "@main/store";
import { handleError, isDefined, validatePath } from "@main/utils";
import type { InvokeHandlerMap } from "./types";
import { createGoogle } from "@main/google";
import { join } from "node:path";
import { logger } from "@main/log";
import { config } from "@main/config";
import { i18n } from "@main/i18n";

const registerInvokeHandlers = (handlers: InvokeHandlerMap) => {
  (Object.keys(handlers) as Array<keyof InvokeHandlerMap>).forEach(
    (channel) => {
      ipcMain.handle(channel, handlers[channel]);
    },
  );
};

export const setupInvokeHandlers = (mainWindow: BrowserWindow) => {
  const appData = app.getPath("userData");

  registerInvokeHandlers({
    getConfigFile: () => {
      const configFile = join(appData, config["files"]["config"]);

      return configFile;
    },
    getCaptureForm: () => {
      const captureForm = store.get("form.captureForm");

      return captureForm;
    },
    getUploadForm: () => {
      const uploadForm = store.get("form.uploadForm");

      return uploadForm;
    },
    getLang: () => {
      const lang = i18n.getCurrentLang();

      return lang;
    },
    getGoogleSheetEnabled: () => {
      const enabled = store.get("google.sheet.enabled");

      return enabled;
    },
    getGoogleSheetValues: () => {
      const values = store.get("google.sheet.values");

      return values;
    },
    getGoogleSecretFile: () => {
      const googleSecretFile = store.get("google.secretFile");

      return googleSecretFile;
    },
    selectDialog: async (_event, { type }) => {
      let path: string | undefined;

      try {
        path = (
          await dialog.showOpenDialog(mainWindow, {
            ...(type === "folder"
              ? {
                  properties: ["openDirectory"],
                }
              : {
                  properties: ["openFile"],
                  filters: [{ name: "JSON Files", extensions: ["json"] }],
                }),
          })
        ).filePaths[0];

        return isDefined(path);
      } catch (error) {
        return path;
      }
    },
    showDialog: (_event, options) => {
      const { title, ...rest } = options;
      const result = dialog.showMessageBox(mainWindow, {
        title: config["appTitle"],
        ...rest,
      });

      return result;
    },
    validatePath: (_event, { path, type }) => {
      const isValid = validatePath(path, type);

      return isValid;
    },
    generateGoogleToken: async () => {
      const googleSecretFile = await store.get("google.secretFile");

      if (!googleSecretFile) {
        throw new Error("Google secret file not found");
      }

      const google = createGoogle(
        join(appData, config["files"]["token"]),
        googleSecretFile,
        logger,
      );

      try {
        await google.generateToken();
        return { success: true, message: "Token generated successfully" };
      } catch (error) {
        const { message } = handleError(error);
        return { success: false, message };
      }
    },
  });
};
