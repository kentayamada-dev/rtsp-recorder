import type { IPCChannels } from "@shared-types/ipc";
import { contextBridge, ipcRenderer } from "electron";

const invoke = async <K extends keyof IPCChannels>(
  channel: K,
  ...args: IPCChannels[K]["params"]
): Promise<IPCChannels[K]["return"]> => {
  return ipcRenderer.invoke(channel, ...args);
};

const api = {
  invoke,
};

contextBridge.exposeInMainWorld("api", api);
