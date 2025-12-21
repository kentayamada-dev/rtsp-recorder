import type { IPCChannels, IPCEvents, Api } from "@shared-types/ipc";
import { contextBridge, ipcRenderer } from "electron";

const api = {
  invoke: async <K extends keyof IPCChannels>(
    channel: K,
    ...args: IPCChannels[K]["params"]
  ) => {
    return ipcRenderer.invoke(channel, ...args);
  },

  on: <K extends keyof IPCEvents>(
    channel: K,
    listener: (...args: IPCEvents[K]) => void,
  ): (() => void) => {
    const subscription = (_event: unknown, ...args: unknown[]) => {
      listener(...(args as IPCEvents[K]));
    };

    ipcRenderer.on(channel as string, subscription);

    return () => {
      ipcRenderer.removeListener(channel as string, subscription);
    };
  },

  once: <K extends keyof IPCEvents>(
    channel: K,
    listener: (...args: IPCEvents[K]) => void,
  ) => {
    const subscription = (_event: unknown, ...args: unknown[]) => {
      listener(...(args as IPCEvents[K]));
    };
    ipcRenderer.once(channel as string, subscription);
  },

  send: <K extends keyof IPCEvents>(channel: K, ...args: IPCEvents[K]) => {
    ipcRenderer.send(channel as string, ...args);
  },

  off: <K extends keyof IPCEvents>(
    channel: K,
    listener: (...args: IPCEvents[K]) => void,
  ) => {
    ipcRenderer.off(channel as string, listener as any);
  },
} as const satisfies Api;

contextBridge.exposeInMainWorld("api", api);
