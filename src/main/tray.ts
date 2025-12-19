import { Menu, Tray } from "electron";
import icon from "../../resources/icon.png?asset";
import { getMainWindow } from "./window";

export const createTray = () => {
  const mainWindow = getMainWindow();

  const tray = new Tray(icon);
  const trayMenu = Menu.buildFromTemplate([
    {
      role: "quit",
    },
  ]);
  tray.setContextMenu(trayMenu);
  tray.on("click", () => mainWindow?.show());
};
