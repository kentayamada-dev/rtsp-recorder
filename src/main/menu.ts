import {
  app,
  dialog,
  Menu,
  shell,
  type BrowserWindow,
  type MenuItemConstructorOptions,
} from "electron";
import { config } from "./config";
import { i18n } from "./i18n";
import type { SupportedLang } from "@shared-types/i18n";

const changeLocaleWithPrompt = async (
  mainWindow: BrowserWindow,
  lang: SupportedLang,
) => {
  if (i18n.getCurrentLang() === lang) return;

  i18n.changeCurrentLang(lang);
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: "info",
    message: i18n.t("dialog.restartRequired"),
    detail: i18n.t("dialog.restartMessage"),
    buttons: [i18n.t("menuBar.restart"), i18n.t("menuBar.later")],
  });
  if (response === 0) {
    app.relaunch();
    app.quit();
  }
};

export const createMenu = (mainWindow: BrowserWindow) => {
  const fileMenu: MenuItemConstructorOptions = {
    label: i18n.t("menuBar.file"),
    submenu: [{ role: "quit", label: i18n.t("menuBar.quit") }],
  };

  const devMenu: MenuItemConstructorOptions = {
    label: i18n.t("menuBar.view"),
    submenu: [
      { role: "forceReload", label: i18n.t("menuBar.forceReload") },
      { role: "toggleDevTools", label: i18n.t("menuBar.toggleDevTools") },
    ],
  };

  const aboutMenu: MenuItemConstructorOptions = {
    label: i18n.t("menuBar.about"),
    submenu: [
      {
        label: i18n.t("menuBar.devInfo"),
        click: () => {
          shell.openExternal("https://github.com/kentayamada-dev");
        },
      },
      {
        label: i18n.t("menuBar.appSourceCode"),
        click: () => {
          shell.openExternal(
            "https://github.com/kentayamada-dev/rtsp-recorder",
          );
        },
      },
    ],
  };

  const localeMenu: MenuItemConstructorOptions = {
    label: i18n.t("menuBar.language"),
    submenu: [
      {
        label: "English",
        click: () => changeLocaleWithPrompt(mainWindow, "en"),
      },
      {
        label: "日本語",
        click: () => changeLocaleWithPrompt(mainWindow, "ja"),
      },
    ],
  };

  const template: MenuItemConstructorOptions[] = config["dev"]
    ? [fileMenu, devMenu, aboutMenu, localeMenu]
    : [fileMenu, aboutMenu, localeMenu];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};
