import { BrowserWindow, dialog, ipcMain } from "electron";
import { store } from "@main/store";
import { isDefined, validatePath } from "@main/utils";
import type { InvokeHandlerMap } from "./types";

const registerInvokeHandlers = (handlers: InvokeHandlerMap) => {
  (Object.keys(handlers) as Array<keyof InvokeHandlerMap>).forEach(
    (channel) => {
      ipcMain.handle(channel, handlers[channel]);
    },
  );
};

export const setupInvokeHandlers = (mainWindow: BrowserWindow) => {
  registerInvokeHandlers({
    getCaptureForm: () => {
      const captureForm = store.get("captureForm");

      return captureForm;
    },
    getUploadForm: () => {
      const uploadForm = store.get("uploadForm");

      return uploadForm;
    },
    getFormAutoSave: () => {
      const autoSave = store.get("form.autoSave");

      return autoSave;
    },
    selectDialog: async (_event, { type }) => {
      let path: string | undefined = undefined;

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
    showQuestionDialog: async (_event, { message, title }) => {
      const result = await dialog.showMessageBox(mainWindow, {
        type: "question",
        title,
        buttons: ["No", "Yes"],
        message,
      });
      return result.response === 1;
    },
    validatePath: (_event, { path, type }) => {
      const isValid = validatePath(path, type);
      return isValid;
    },
  });
};
