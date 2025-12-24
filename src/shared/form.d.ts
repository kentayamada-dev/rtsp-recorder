type StrictOmit<T, K extends keyof T> = Omit<T, K>;

type CaptureFormValues = {
  rtspUrl: string;
  outputFolder: string;
  interval: string;
};

type UploadFormValues = {
  inputFolder: string;
  secretFile: string;
  numberUpload: number;
};

type CaptureFormStore = {
  values: StrictOmit<CaptureFormValues, "interval"> & {
    interval: number;
  };
};

type UploadFormStore = {
  values: UploadFormValues;
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
