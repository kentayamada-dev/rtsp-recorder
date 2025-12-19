import { contextBridge, ipcRenderer } from "electron";
import type { IPCChannels } from "@ipc-channel-types";

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
