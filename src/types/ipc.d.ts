import type { FormStore } from "./form";

type LogLevel = "info" | "error";

type IPCChannels = {
  selectFolder: {
    params: [];
    return: Promise<string | null>;
  };
  validateFolder: {
    params: [folderPath: string];
    return: Promise<boolean>;
  };
  getForm: {
    params: [];
    return: Promise<Partial<FormStore["values"]> | undefined>;
  };
  getFormAutoSave: {
    params: [];
    return: Promise<FormStore["autoSave"] | undefined>;
  };
  showQuestionMessage: {
    params: [title: string, message: string];
    return: Promise<boolean>;
  };
};

type IPCEvents = {
  getLog: [log: string, level: LogLevel];
  stopCapture: [];
  startCapture: [rtspUrl: string, folderPath: string, interval: number];
  saveForm: [FormStore["values"]];
  resetFormValues: [];
  saveFormAutoSave: [autoSave: FormStore["autoSave"]];
};

type Api = {
  invoke: <K extends keyof IPCChannels>(
    channel: K,
    ...args: IPCChannels[K]["params"]
  ) => Promise<Awaited<IPCChannels[K]["return"]>>;
  on: <K extends keyof IPCEvents>(
    channel: K,
    listener: (...args: IPCEvents[K]) => void,
  ) => () => void;
  once: <K extends keyof IPCEvents>(
    channel: K,
    listener: (...args: IPCEvents[K]) => void,
  ) => void;
  send: <K extends keyof IPCEvents>(channel: K, ...args: IPCEvents[K]) => void;
  off: <K extends keyof IPCEvents>(
    channel: K,
    listener: (...args: IPCEvents[K]) => void,
  ) => void;
};

export type { IPCChannels, IPCEvents, LogLevel, Api };
