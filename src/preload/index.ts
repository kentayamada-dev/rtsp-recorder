import { contextBridge, ipcRenderer } from "electron";
import type { IPCChannels } from "../types/ipc";

const invoke = async <K extends keyof IPCChannels>(
  channel: K,
  ...args: Parameters<IPCChannels[K]>
): Promise<ReturnType<IPCChannels[K]>> => {
  return ipcRenderer.invoke(channel, ...args);
};

const api = {
  invoke,
};

contextBridge.exposeInMainWorld("api", api);
