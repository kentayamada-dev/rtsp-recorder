import { BrowserWindow } from "electron";
import type { Args, MainToRendererEvents } from "./types";

export const createEventSender = (window: BrowserWindow) => {
  return <K extends keyof MainToRendererEvents>(
    channel: K,
    ...args: Args<MainToRendererEvents[K]["payload"]>
  ) => {
    window.webContents.send(channel, args[0]);
  };
};
