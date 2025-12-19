import type { IPCChannels } from "./ipc";

type Api = {
  invoke: <K extends keyof IPCChannels>(
    channel: K,
    ...args: IPCChannels[K]["params"]
  ) => Promise<IPCChannels[K]["return"]>;
};

declare global {
  interface Window {
    api: Api;
  }
}
