import { mkdir, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { app } from "electron";
import { formatDate } from "@main/utils";
import type { LoggerOptions } from "./type";

const FOLDER_NAME = "Logs";

type LogLevel = "info" | "error";

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
} as const;

const createLogger = (options: LoggerOptions) => {
  const { logToTerminal } = options;
  const logsBaseDir = join(app.getPath("userData"), FOLDER_NAME);
  const { iso8601WithOffset, date } = formatDate(new Date());

  const getLogFilePath = async (logLevel: LogLevel): Promise<string> => {
    const datePath = join(logsBaseDir, date);
    await mkdir(datePath, { recursive: true });
    return join(datePath, `${logLevel}.log`);
  };

  const write = async (logLevel: LogLevel, message: string, args: any[]) => {
    const timestamp = iso8601WithOffset;

    const formatted = `[${timestamp}] [${logLevel.toUpperCase()}] ${message}${
      args.length > 0 ? ` ${JSON.stringify(args)}` : ""
    }`;

    const filePath = await getLogFilePath(logLevel);
    await appendFile(filePath, formatted + "\n", "utf-8");

    if (logToTerminal) {
      const color = logLevel === "error" ? colors.red : colors.cyan;
      const coloredOutput = `${colors.gray}[${timestamp}]${
        colors.reset
      } ${color}[${logLevel.toUpperCase()}]${colors.reset} ${message}${
        args.length > 0 ? ` ${JSON.stringify(args)}` : ""
      }`;

      const consoleMethod = logLevel === "error" ? "error" : "log";
      console[consoleMethod](coloredOutput);
    }
  };

  return {
    info: (message: string, ...args: any[]) => write("info", message, args),
    error: (message: string, ...args: any[]) => write("error", message, args),
  } as const satisfies Record<
    LogLevel,
    (message: string, ...args: any[]) => Promise<void>
  >;
};

export const logger = createLogger({ logToTerminal: true });
