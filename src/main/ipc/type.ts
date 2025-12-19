import type { IPCChannels } from "@ipc-channel-types";
import type { IpcMainInvokeEvent } from "electron";

type IpcHandler<K extends keyof IPCChannels> = (
  event: IpcMainInvokeEvent,
  ...args: IPCChannels[K]["params"]
) => IPCChannels[K]["return"] | Promise<IPCChannels[K]["return"]>;

type IpcHandlers = { [K in keyof IPCChannels]: IpcHandler<K> };

type CaptureInterval = ReturnType<typeof setInterval> | null;

export type { CaptureInterval, IpcHandlers };
