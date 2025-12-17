import { Menu, shell, type MenuItemConstructorOptions } from "electron";

export const createMenu = ({ isDev }: { isDev: boolean }) => {
  const fileMenu: MenuItemConstructorOptions = {
    label: "File",
    submenu: [{ role: "quit" }],
  };

  const devMenu: MenuItemConstructorOptions = {
    label: "View",
    submenu: [{ role: "forceReload" }, { role: "toggleDevTools" }],
  };

  const aboutMenu: MenuItemConstructorOptions = {
    label: "About",
    submenu: [
      {
        label: "Developer Info",
        click: () => {
          shell.openExternal("https://github.com/kentayamada-dev");
        },
      },
      {
        label: "App Source Code",
        click: () => {
          shell.openExternal(
            "https://github.com/kentayamada-dev/rtsp-recorder",
          );
        },
      },
    ],
  };

  const template: MenuItemConstructorOptions[] = isDev
    ? [fileMenu, devMenu]
    : [fileMenu, aboutMenu];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};
