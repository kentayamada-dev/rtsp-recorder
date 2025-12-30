type GoogleStore = {
  secretFile: string;
  sheet: {
    enabled: boolean;
    values: {
      sheetId: string;
      sheetTitle: string;
    };
  };
};

type FormStore = {
  captureForm: {
    rtspUrl: string;
    outputFolder: string;
    interval: number;
  };
  uploadForm: {
    inputFolder: string;
    numberUpload: number;
    fps: number;
  };
};

export type { FormStore, GoogleStore };
