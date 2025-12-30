type LoggerOptions = {
  logToTerminal: boolean;
};

type LogLevel = "info" | "error";

type Logger = Record<LogLevel, (message: string, log?: any) => Promise<void>>;

export type { LoggerOptions, Logger, LogLevel };
