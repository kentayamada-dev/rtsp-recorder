import type { IPCChannels, IPCEvents } from "@shared-types/ipc";
import type { IpcMainEvent, IpcMainInvokeEvent } from "electron";

type IpcHandler<K extends keyof IPCChannels> = (
  event: IpcMainInvokeEvent,
  ...args: IPCChannels[K]["params"]
) => IPCChannels[K]["return"];

type IpcHandlers = { [K in keyof IPCChannels]: IpcHandler<K> };

type IpcEventHandler<K extends keyof IPCEvents> = (
  event: IpcMainEvent,
  ...args: IPCEvents[K]
) => void;

type IpcEventHandlers = {
  [K in keyof IPCEvents]: IpcEventHandler<K>;
};

type CaptureInterval = ReturnType<typeof setInterval> | null;

export type { CaptureInterval, IpcHandlers, IpcEventHandlers };
