import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { isDev } from "./config";
import { app } from "electron";
import { logger } from "./log";

const FFMPEG_EXE_FILE = "ffmpeg.exe";

const ffmpegExePath = isDev
  ? join(app.getAppPath(), `node_modules/ffmpeg-static/${FFMPEG_EXE_FILE}`)
  : join(process.resourcesPath, FFMPEG_EXE_FILE);

const formatDate = (date: Date) => {
  const pad = (num: number) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return {
    dateFolder: `${year}-${month}-${day}`,
    hourFolder: `${year}-${month}-${day}_${hours}`,
    filename: `${year}-${month}-${day}_${hours}-${minutes}-${seconds}.png`,
  };
};

export const captureFrame = (
  rtspUrl: string,
  folderPath: string,
  interval: number,
) => {
  return setInterval(async () => {
    const { dateFolder, hourFolder, filename } = formatDate(new Date());

    const hourDir = join(join(folderPath, dateFolder), hourFolder);
    const filepath = join(hourDir, filename);

    await mkdir(hourDir, { recursive: true });

    const ffmpeg = spawn(ffmpegExePath, [
      "-rtsp_transport",
      "tcp",
      "-i",
      rtspUrl,
      "-vframes",
      "1",
      "-q:v",
      "1",
      filepath,
    ]);

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        logger.info(`Captured: ${filename}`);
      }
    });
  }, interval * 1000);
};
