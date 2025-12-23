import { BrowserWindow, dialog, ipcMain } from "electron";
import { store } from "@main/store";
import { isDefined } from "@main/utils";
import { readFile, stat } from "fs/promises";
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
    selectFolder: async () => {
      try {
        const result = await dialog.showOpenDialog(mainWindow, {
          properties: ["openDirectory"],
        });
        return isDefined(result.filePaths[0]);
      } catch (err) {
        return null;
      }
    },
    selectJsonFile: async () => {
      try {
        const result = await dialog.showOpenDialog(mainWindow, {
          properties: ["openFile"],
          filters: [{ name: "JSON Files", extensions: ["json"] }],
        });
        return isDefined(result.filePaths[0]);
      } catch (err) {
        return null;
      }
    },
    showQuestionMessage: async (_event, { message, title }) => {
      const result = await dialog.showMessageBox(mainWindow, {
        type: "question",
        title,
        buttons: ["No", "Yes"],
        message,
      });
      return result.response === 1;
    },
    validateFolder: async (_event, { folderPath }) => {
      try {
        const stats = await stat(folderPath);
        return stats.isDirectory();
      } catch (error) {
        return false;
      }
    },
    validateJsonFile: async (_event, { filePath }) => {
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
  });
};
