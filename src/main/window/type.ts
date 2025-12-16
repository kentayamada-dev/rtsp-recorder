import type { BrowserWindow } from "electron";

type MainWindow = BrowserWindow | null;

type CreateWindowOptions = {
  isDev: boolean;
};

export type { MainWindow, CreateWindowOptions };
