import log from "electron-log/main";
import { join } from "node:path";

log.initialize();

const commonFormat = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";

log.transports.file.level = "info";
log.transports.file.format = commonFormat;

log.transports.file.resolvePathFn = (variables, message) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const dateFolder = `${year}-${month}-${day}`;
  const level = message?.level || "info";

  return join(variables.libraryDefaultDir, dateFolder, `${level}.log`);
};

log.transports.console.level = "info";
log.transports.console.format = commonFormat;

export const logger = log;
