import type { Api } from "@main/ipc/types";
import { contextBridge, ipcRenderer } from "electron";

const api: Api = {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, args[0]),
  send: (channel, ...args) => ipcRenderer.send(channel, args[0]),
  on: (channel, listener) => {
    const handler = (_event: any, payload: any) => {
      (listener as any)(payload);
    };
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.off(channel, handler);
  },
};

contextBridge.exposeInMainWorld("api", api);
