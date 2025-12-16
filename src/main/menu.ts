import { Menu } from "electron";

export const createMenu = () => {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [{ role: "quit" }],
      },
    ]),
  );
};
