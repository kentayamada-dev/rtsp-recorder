type StrictOmit<T, K extends keyof T> = Omit<T, K>;

type CaptureForm = {
  rtspUrl: string;
  outputFolder: string;
  interval: number;
};

type UploadForm = {
  inputFolder: string;
  secretFile: string;
  numberUpload: number;
};

type FormStore = {
  autoSave: boolean;
};

export type { FormStore, CaptureForm, UploadForm };
