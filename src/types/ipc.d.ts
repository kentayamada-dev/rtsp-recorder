export type IPCChannels = {
  selectFolder: {
    params: [];
    return: string;
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
};
