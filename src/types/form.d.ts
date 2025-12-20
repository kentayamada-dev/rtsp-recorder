type StrictOmit<T, K extends keyof T> = Omit<T, K>;

type FormValues = {
  rtspUrl: string;
  outputFolder: string;
  captureInterval: string;
  autoUpload: "yes" | "no";
  uploadInterval: string;
};

type FormStore = {
  autoSave: boolean;
  values: StrictOmit<FormValues, "captureInterval" | "uploadInterval"> & {
    captureInterval: number;
    uploadInterval: number;
  };
};

export type { FormValues, FormStore };
