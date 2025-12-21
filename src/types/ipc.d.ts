import type { FormStore } from "./form";

export type IPCChannels = {
  selectFolder: {
    params: [];
    return: Promise<string | null>;
  };
  validateFolder: {
    params: [folderPath: string];
    return: Promise<boolean>;
  };
  startCapture: {
    params: [rtspUrl: string, folderPath: string, interval: number];
    return: void;
  };
  stopCapture: {
    params: [];
    return: void;
  };
  getForm: {
    params: [];
    return: Promise<Partial<FormStore["values"]> | undefined>;
  };
  saveForm: {
    params: [FormStore["values"]];
    return: void;
  };
  resetFormValues: {
    params: [];
    return: void;
  };
  getFormAutoSave: {
    params: [];
    return: Promise<FormStore["autoSave"] | undefined>;
  };
  saveFormAutoSave: {
    params: [autoSave: FormStore["autoSave"]];
    return: void;
  };
  showQuestionMessage: {
    params: [title: string, message: string];
    return: Promise<boolean>;
  };
};
