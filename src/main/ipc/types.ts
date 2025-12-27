import type { CaptureForm, UploadForm, FormStore } from "@shared-types/form";
import type { createEventSender } from "./sendEvent";

type Args<T> = T extends void ? [] : [T];

type Invoke = {
  getFormAutoSave: {
    request: void;
    response: boolean | undefined;
  };
  validatePath: {
    request: {
      path: string;
      type: "folder" | "json";
    };
    response: boolean;
  };
  selectDialog: {
    request: {
      type: "folder" | "json";
    };
    response: string | undefined;
  };
  getCaptureForm: {
    request: void;
    response: Partial<CaptureForm> | undefined;
  };
  getUploadForm: {
    request: void;
    response: Partial<UploadForm> | undefined;
  };
  showQuestionDialog: {
    request: {
      title: string;
      message: string;
    };
    response: boolean;
  };
};

type RendererToMainEvents = {
  "capture:start": {
    payload: CaptureForm;
  };
  "capture:stop": {
    payload: void;
  };
  "upload:start": {
    payload: UploadForm & {
      fps: number;
    };
  };
  "upload:stop": {
    payload: void;
  };
  "form:autosave": {
    payload: FormStore["autoSave"];
  };
  "form:capture:save": {
    payload: CaptureForm;
  };
  "form:capture:reset": {
    payload: void;
  };
  "form:upload:save": {
    payload: UploadForm;
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
) => Promise<Invoke[K]["response"]>;

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
};

export type {
  Args,
  Api,
  MainToRendererEvents,
  InvokeHandlerMap,
  EventHandlerMap,
  SendEvent,
};
