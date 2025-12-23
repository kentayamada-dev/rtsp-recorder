import type { FormStore, CaptureFormStore, UploadFormStore } from "./form";

type LogLevel = "info" | "error";

type MessageType = "upload" | "capture";

type IPCChannels = {
  selectFolder: {
    params: [];
    return: Promise<string | null>;
  };
  selectJsonFile: {
    params: [];
    return: Promise<string | null>;
  };
  getFormAutoSave: {
    params: [];
    return: Promise<boolean | undefined>;
  };
  validateFolder: {
    params: [folderPath: string];
    return: Promise<boolean>;
  };
  validateJsonFile: {
    params: [filePath: string];
    return: Promise<boolean>;
  };
  getCaptureForm: {
    params: [];
    return: Promise<Partial<CaptureFormStore["values"]> | undefined>;
  };
  getUploadForm: {
    params: [];
    return: Promise<Partial<UploadFormStore["values"]> | undefined>;
  };
  showQuestionMessage: {
    params: [title: string, message: string];
    return: Promise<boolean>;
  };
};

type IPCEvents = {
  captureProgress: [progress: number];
  uploadProgress: [progress: number];
  getMessage: [message: string, type: MessageType];
  stopCapture: [];
  stopUpload: [];
  startCapture: [rtspUrl: string, folderPath: string, interval: number];
  startUpload: [
    folderPath: string,
    interval: number,
    fps: number,
    secretFilePath: string,
  ];
  saveRecordForm: [CaptureFormStore["values"]];
  saveUploadForm: [UploadFormStore["values"]];
  resetRecordForm: [];
  resetUploadForm: [];
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

export type { IPCChannels, IPCEvents, LogLevel, Api, MessageType };
