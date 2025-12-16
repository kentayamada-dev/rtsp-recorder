import { BrowserWindow, Menu, Tray } from "electron";
import icon from "../../resources/icon.png?asset";

export const createTray = (mainWindow: BrowserWindow | null) => {
  const tray = new Tray(icon);
  const trayMenu = Menu.buildFromTemplate([
    {
      role: "quit",
    },
  ]);
  tray.setContextMenu(trayMenu);
  tray.on("click", () => mainWindow?.show());
};
