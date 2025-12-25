import { session, type BrowserWindow } from "electron";
import { isDev } from "./config";

const ALLOWED_PERMISSIONS = [""];
const ALLOWED_ORIGINS = [""];

export const setupSecurity = (mainWindow: BrowserWindow) => {
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const origin = new URL(url).origin;
    if (!ALLOWED_ORIGINS.includes(origin)) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const origin = new URL(url).origin;
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const isMainFrame = details.resourceType === "mainFrame";

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        ...(isMainFrame && {
          "Content-Security-Policy": [
            [
              "default-src 'self';",
              `script-src 'self'${isDev ? " 'unsafe-inline'" : ""};`,
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data:;",
              "object-src 'none';",
              "frame-ancestors 'none';",
            ].join(" "),
          ],
        }),
      },
    });
  });

  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const origin = webContents.getURL();

      if (
        ALLOWED_PERMISSIONS.includes(permission) &&
        ALLOWED_ORIGINS.includes(origin)
      ) {
        callback(true);
      } else {
        callback(false);
      }
    },
  );
};
