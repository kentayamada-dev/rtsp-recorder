import { app } from "electron";
import { createTray } from "./tray";
import { createMainWindow } from "./window";
import { quitting } from "./state";
import { setupInvokeHandlers } from "./ipc/setupInvokeHandlers";
import { setupEventHandlers } from "./ipc/setupEventHandlers";
import { createEventSender } from "./ipc/sendEvent";
import { logger } from "./log";
import { createMenu } from "./menu";
import { setupSecurity } from "./security";

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
});

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on("before-quit", () => {
  quitting.set(true);
});

app.on("window-all-closed", () => {
  app.quit();
});

const initializeApp = async () => {
  await app.whenReady();
  const mainWindow = await createMainWindow();
  setupSecurity(mainWindow);
  const sendEvent = createEventSender(mainWindow);
  createMenu();
  createTray(mainWindow);
  setupInvokeHandlers(mainWindow);
  setupEventHandlers(sendEvent, mainWindow);
};

initializeApp();
