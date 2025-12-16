import type { IPCChannels } from "./ipc";

type Api = {
  invoke: <K extends keyof IPCChannels>(
    channel: K,
    ...args: Parameters<IPCChannels[K]>
  ) => Promise<ReturnType<IPCChannels[K]>>;
};

declare global {
  interface Window {
    api: Api;
  }
}
