import { ipcMain, type IpcMainInvokeEvent } from "electron";
import type { IPCChannels } from "@ipc-channel-types";

const handle = <K extends keyof IPCChannels>(
  channel: K,
  handler: (
    event: IpcMainInvokeEvent,
    ...args: Parameters<IPCChannels[K]>
  ) => ReturnType<IPCChannels[K]> | Promise<ReturnType<IPCChannels[K]>>,
) => {
  ipcMain.handle(channel, handler);
};

export const setupIpc = () => {
  handle("ping", () => console.log("pong"));
};
