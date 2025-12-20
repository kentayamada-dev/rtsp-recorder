import type { FormStore } from "./form";

export type IPCChannels = {
  selectFolder: {
    params: [];
    return: Promise<string>;
  };
  validateFolder: {
    params: [folderPath: string];
    return: boolean;
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
    return: Partial<FormStore["values"]> | undefined;
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
    return: FormStore["autoSave"] | undefined;
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
