import { Menu, Tray, type BrowserWindow } from "electron";
import icon from "../../resources/icon.png?asset";
import { i18n } from "./i18n";

export const createTray = (mainWindow: BrowserWindow) => {
  const tray = new Tray(icon);
  const trayMenu = Menu.buildFromTemplate([
    {
      role: "quit",
      label: i18n.t("menuBar.quit"),
    },
  ]);
  tray.setContextMenu(trayMenu);
  tray.on("click", () => mainWindow.show());
};
