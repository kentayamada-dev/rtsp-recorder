import { readdir, rmdir, stat, unlink } from "fs/promises";
import { join, extname, dirname } from "path";

const getEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const isDefined = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
  return value;
};

const formatDate = (date: Date) => {
  const pad = (num: number) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const offsetMinutesTotal = -date.getTimezoneOffset();
  const sign = offsetMinutesTotal >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutesTotal);
  const offsetHour = pad(Math.floor(abs / 60));
  const offsetMinute = pad(abs % 60);

  return {
    date: `${year}-${month}-${day}`,
    hour: `${year}-${month}-${day}_${hours}`,
    minute: `${year}-${month}-${day}_${hours}-${minutes}`,
    second: `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`,
    iso8601WithOffset: `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHour}:${offsetMinute}`,
  };
};

const getFilesByExtension = async (
  folderPath: string,
  extension: string,
): Promise<string[]> => {
  const files: string[] = [];

  const walkDir = async (currentPath: string): Promise<void> => {
    const entries = await readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (extname(entry.name) === extension) {
        files.push(fullPath);
      }
    }
  };

  await walkDir(folderPath);

  return files;
};

const deleteFiles = async (filePaths: string[]): Promise<void> => {
  await Promise.all(filePaths.map((filePath) => unlink(filePath)));

  const dirSet = new Set(filePaths.map((filePath) => dirname(filePath)));

  for (const dir of dirSet) {
    await deleteEmptyDirs(dir);
  }
};

const deleteEmptyDirs = async (dir: string): Promise<void> => {
  try {
    const files = await readdir(dir);
    if (files.length === 0) {
      await rmdir(dir);
      await deleteEmptyDirs(dirname(dir));
    }
  } catch (error) {}
};

const validatePath = async (path: string, type: "folder" | "json") => {
  try {
    const stats = await stat(path);

    if (type === "folder") {
      return stats.isDirectory();
    }

    if (type === "json") {
      if (!stats.isFile()) return false;
      if (!path.endsWith(".json")) return false;
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

const generateCronSchedule = (frequency: number): string => {
  const schedules: { [key: number]: number[] } = {
    1: [0], // midnight
    2: [0, 12], // midnight, noon
    3: [0, 8, 16], // every 8 hours
    4: [0, 6, 12, 18], // every 6 hours
    5: [0, 5, 10, 15, 20], // every 5 hours
    6: [0, 4, 8, 12, 16, 20], // every 4 hours
  };

  const hours = isDefined(schedules[frequency]);
  const hourString = hours.join(",");

  return `0 ${hourString} * * *`;
};

const handleError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }
  return {
    message: String(error),
    stack: undefined,
    name: "Unknown",
  };
};

const toMutable = <T>(readonly: readonly T[]): T[] => {
  return [...readonly];
};

export {
  toMutable,
  getEnv,
  isDefined,
  formatDate,
  getFilesByExtension,
  deleteFiles,
  validatePath,
  generateCronSchedule,
  handleError,
};
