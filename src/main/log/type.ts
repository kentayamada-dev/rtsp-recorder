type LoggerOptions = {
  logToTerminal: boolean;
};

type LogLevel = "info" | "error";

type Logger = Record<
  LogLevel,
  (message: string, ...args: any[]) => Promise<void>
>;

export type { LoggerOptions, Logger, LogLevel };
