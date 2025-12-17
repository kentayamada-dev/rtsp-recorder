import { Menu } from "electron";

export const createMenu = ({ isDev }: { isDev: boolean }) => {
  if (isDev) return;
  Menu.setApplicationMenu(null);
};
