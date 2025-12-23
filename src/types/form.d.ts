type StrictOmit<T, K extends keyof T> = Omit<T, K>;

type CaptureFormValues = {
  rtspUrl: string;
  outputFolder: string;
  captureInterval: string;
};

type UploadFormValues = {
  inputFolder: string;
  secretFile: string;
  uploadInterval: string;
};

type CaptureFormStore = {
  values: StrictOmit<CaptureFormValues, "captureInterval"> & {
    captureInterval: number;
  };
};

type UploadFormStore = {
  values: StrictOmit<UploadFormValues, "uploadInterval"> & {
    uploadInterval: number;
  };
};

type FormStore = {
  autoSave: boolean;
};

export type {
  FormStore,
  CaptureFormValues,
  CaptureFormStore,
  UploadFormStore,
  UploadFormValues,
};
