import { mkdir, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { formatDate } from "@main/utils";
import type { Logger, LoggerOptions, LogLevel } from "./type";
import { config } from "@main/config";
import { app } from "electron";

const createLogger = (options: LoggerOptions): Logger => {
  const { logToTerminal } = options;
  const logsBaseDir = join(app.getPath("userData"), config["folders"]["logs"]);
  const { iso8601WithOffset, date } = formatDate(new Date());

  const getLogFilePath = async (logLevel: LogLevel): Promise<string> => {
    const datePath = join(logsBaseDir, date);
    await mkdir(datePath, { recursive: true });
    return join(datePath, `${logLevel}.log`);
  };

  const write = async (logLevel: LogLevel, message: string, log: any) => {
    const timestamp = iso8601WithOffset;
    const colors = config["ansiColors"];
    const formatted = `[${timestamp}] [${logLevel.toUpperCase()}] ${message}${log ? ` ${JSON.stringify(log)}` : ""}`;

    const filePath = await getLogFilePath(logLevel);
    await appendFile(filePath, formatted + "\n", "utf-8");

    if (logToTerminal) {
      const color = logLevel === "error" ? colors.red : colors.cyan;
      const coloredOutput = `${colors.gray}[${timestamp}]${colors.reset} ${color}[${logLevel.toUpperCase()}]${colors.reset} ${message}${
        log ? ` ${JSON.stringify(log)}` : ""
      }`;

      const consoleMethod = logLevel === "error" ? "error" : "log";
      console[consoleMethod](coloredOutput);
    }
  };

  return {
    info: (message: string, log?: any) => write("info", message, log),
    error: (message: string, log?: any) => write("error", message, log),
  };
};

export const logger = createLogger({ logToTerminal: config["dev"] });
