import { existsSync, mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { app } from "electron";

type LogLevel = "info" | "error";

const createLogger = () => {
  const logsBaseDir = join(app.getPath("userData"), "logs");

  if (!existsSync(logsBaseDir)) {
    mkdirSync(logsBaseDir, { recursive: true });
  }

  const getLogFilePath = (logLevel: LogLevel): string => {
    const today = new Date().toISOString().split("T")[0] || "";
    const datePath = join(logsBaseDir, today);

    if (!existsSync(datePath)) {
      mkdirSync(datePath, { recursive: true });
    }

    return join(datePath, `${logLevel}.log`);
  };

  const write = (logLevel: LogLevel, message: string, args: any[]) => {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${logLevel.toUpperCase()}] ${message}${
      args.length > 0 ? ` ${JSON.stringify(args)}` : ""
    }`;
    appendFileSync(getLogFilePath(logLevel), formatted + "\n", "utf-8");
  };

  return {
    info: (message: string, ...args: any[]) => write("info", message, args),
    error: (message: string, ...args: any[]) => write("error", message, args),
  } as const satisfies Record<
    LogLevel,
    (message: string, ...args: any[]) => void
  >;
};

export const logger = createLogger();
