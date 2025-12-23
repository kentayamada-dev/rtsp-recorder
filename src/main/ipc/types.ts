import type {
  CaptureFormStore,
  UploadFormStore,
  FormStore,
} from "@shared-types/form";
import type { createEventSender } from "./sendEvent";

type Args<T> = T extends void ? [] : [T];

type Interval = ReturnType<typeof setInterval> | null;

type Invoke = {
  selectFolder: {
    request: void;
    response: string | null;
  };
  selectJsonFile: {
    request: void;
    response: string | null;
  };
  getFormAutoSave: {
    request: void;
    response: boolean | undefined;
  };
  validateFolder: {
    request: {
      folderPath: string;
    };
    response: boolean;
  };
  validateJsonFile: {
    request: {
      filePath: string;
    };
    response: boolean;
  };
  getCaptureForm: {
    request: void;
    response: Partial<CaptureFormStore["values"]> | undefined;
  };
  getUploadForm: {
    request: void;
    response: Partial<UploadFormStore["values"]> | undefined;
  };
  showQuestionMessage: {
    request: {
      title: string;
      message: string;
    };
    response: boolean;
  };
};

type RendererToMainEvents = {
  "capture:start": {
    payload: {
      rtspUrl: string;
      folderPath: string;
      interval: number;
    };
  };
  "capture:stop": {
    payload: void;
  };
  "upload:start": {
    payload: {
      folderPath: string;
      interval: number;
      fps: number;
      secretFilePath: string;
    };
  };
  "upload:stop": {
    payload: void;
  };
  "form:autosave": {
    payload: FormStore["autoSave"];
  };
  "form:reocrd:save": {
    payload: CaptureFormStore["values"];
  };
  "form:reocrd:reset": {
    payload: void;
  };
  "form:upload:save": {
    payload: UploadFormStore["values"];
  };
  "form:upload:reset": {
    payload: void;
  };
};

type MainToRendererEvents = {
  "capture:progress": {
    payload: {
      progress: number;
    };
  };
  "capture:message": {
    payload: {
      message: string;
    };
  };
  "upload:progress": {
    payload: {
      progress: number;
    };
  };
  "upload:message": {
    payload: {
      message: string;
    };
  };
};

type InvokeHandler<K extends keyof Invoke> = (
  event: Electron.IpcMainInvokeEvent,
  payload: Invoke[K]["request"],
) => Promise<Invoke[K]["response"]> | Invoke[K]["response"];

type InvokeHandlerMap = {
  [K in keyof Invoke]: InvokeHandler<K>;
};

type EventHandler<K extends keyof RendererToMainEvents> = (
  event: Electron.IpcMainEvent,
  ...args: Args<RendererToMainEvents[K]["payload"]>
) => void;

type EventHandlerMap = {
  [K in keyof RendererToMainEvents]: EventHandler<K>;
};

type SendEvent = ReturnType<typeof createEventSender>;

type Api = {
  invoke<K extends keyof Invoke>(
    channel: K,
    ...args: Args<Invoke[K]["request"]>
  ): Promise<Invoke[K]["response"]>;

  send<K extends keyof RendererToMainEvents>(
    channel: K,
    ...args: Args<RendererToMainEvents[K]["payload"]>
  ): void;

  on<K extends keyof MainToRendererEvents>(
    channel: K,
    listener: (...args: Args<MainToRendererEvents[K]["payload"]>) => void,
  ): () => void;

  off<K extends keyof RendererToMainEvents>(
    channel: K,
    listener: (...args: Args<RendererToMainEvents[K]["payload"]>) => void,
  ): void;
};

export type {
  Args,
  Interval,
  Api,
  MainToRendererEvents,
  InvokeHandlerMap,
  EventHandlerMap,
  SendEvent,
};
