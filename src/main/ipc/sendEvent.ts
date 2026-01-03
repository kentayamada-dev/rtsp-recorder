import { BrowserWindow } from "electron";
import type { Args, MainToRendererEvents } from "./types";

export const createEventSender = (mainWindow: BrowserWindow) => {
  return <K extends keyof MainToRendererEvents>(channel: K, ...args: Args<MainToRendererEvents[K]["payload"]>) => {
    mainWindow.webContents.send(channel, args[0]);
  };
};
