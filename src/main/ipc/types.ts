import type { FormStore, GoogleStore } from "@shared-types/form";
import type { createEventSender } from "./sendEvent";
import type { IpcMainEvent, IpcMainInvokeEvent, MessageBoxOptions, MessageBoxReturnValue } from "electron";
import type { SupportedLang } from "@shared-types/i18n";

type Args<T> = T extends void ? [] : [T];

type Invoke = {
  getConfigFile: {
    request: void;
    response: string;
  };
  getGoogleSheetEnabled: {
    request: void;
    response: GoogleStore["sheet"]["enabled"] | undefined;
  };
  getLang: {
    request: void;
    response: SupportedLang | undefined;
  };
  getGoogleSheetValues: {
    request: void;
    response: Partial<GoogleStore["sheet"]["values"]> | undefined;
  };
  getGoogleSecretFile: {
    request: void;
    response: GoogleStore["secretFile"] | undefined;
  };
  generateGoogleToken: {
    request: void;
    response: { success: boolean; message: string };
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
    response: Partial<FormStore["captureForm"]> | undefined;
  };
  getUploadForm: {
    request: void;
    response: Partial<FormStore["uploadForm"]> | undefined;
  };
  showDialog: {
    request: MessageBoxOptions;
    response: MessageBoxReturnValue;
  };
};

type RendererToMainEvents = {
  "capture:start": {
    payload: FormStore["captureForm"];
  };
  "capture:stop": {
    payload: void;
  };
  "upload:start": {
    payload: FormStore["uploadForm"];
  };
  "upload:stop": {
    payload: void;
  };
  "form:capture": {
    payload: FormStore["captureForm"];
  };
  "form:upload": {
    payload: FormStore["uploadForm"];
  };
  "google:secretFile": {
    payload: GoogleStore["secretFile"];
  };
  "google:sheet:enabled": {
    payload: GoogleStore["sheet"]["enabled"];
  };
  "google:sheet:values": {
    payload: GoogleStore["sheet"]["values"];
  };
  reset: {
    payload: void;
  };
  "file:open": {
    payload: {
      filePath: string;
    };
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
  event: IpcMainInvokeEvent,
  payload: Invoke[K]["request"],
) => Promise<Invoke[K]["response"]> | Invoke[K]["response"];

type InvokeHandlerMap = {
  [K in keyof Invoke]: InvokeHandler<K>;
};

type EventHandler<K extends keyof RendererToMainEvents> = (
  event: IpcMainEvent,
  ...args: Args<RendererToMainEvents[K]["payload"]>
) => void;

type EventHandlerMap = {
  [K in keyof RendererToMainEvents]: EventHandler<K>;
};

type SendEvent = ReturnType<typeof createEventSender>;

type Api = {
  invoke<K extends keyof Invoke>(channel: K, ...args: Args<Invoke[K]["request"]>): Promise<Invoke[K]["response"]>;

  send<K extends keyof RendererToMainEvents>(channel: K, ...args: Args<RendererToMainEvents[K]["payload"]>): void;

  on<K extends keyof MainToRendererEvents>(
    channel: K,
    listener: (...args: Args<MainToRendererEvents[K]["payload"]>) => void,
  ): () => void;
};

export type { Args, Api, MainToRendererEvents, InvokeHandlerMap, EventHandlerMap, SendEvent };
