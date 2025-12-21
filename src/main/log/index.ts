import { mkdir, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { app } from "electron";
import { isDefined } from "@main/utils";
import type { LoggerOptions } from "./type";
import type { LogLevel } from '@shared-types/ipc';

const FOLDER_NAME = "Logs";

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
} as const;

const pad = (n: number, len = 2) => String(n).padStart(len, "0");

const formatIso8601WithOffset = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3);

  const offsetMinutesTotal = -date.getTimezoneOffset();
  const sign = offsetMinutesTotal >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutesTotal);
  const offsetHour = pad(Math.floor(abs / 60));
  const offsetMinute = pad(abs % 60);

  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}${sign}${offsetHour}:${offsetMinute}`;
};

const createLogger = (options: LoggerOptions) => {
  const { logToTerminal } = options;
  const logsBaseDir = join(app.getPath("userData"), FOLDER_NAME);

  const getLogFilePath = async (logLevel: LogLevel): Promise<string> => {
    const today = isDefined(formatIso8601WithOffset().slice(0, 10));
    const datePath = join(logsBaseDir, today);
    await mkdir(datePath, { recursive: true });
    return join(datePath, `${logLevel}.log`);
  };

  const write = async (logLevel: LogLevel, message: string, args: any[]) => {
    const timestamp = formatIso8601WithOffset();

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
