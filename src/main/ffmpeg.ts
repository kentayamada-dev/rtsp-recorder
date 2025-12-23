import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join, extname } from "path";
import { spawn } from "node:child_process";
import { isDev } from "./config";
import { app } from "electron";
import { logger } from "./log";
import { sendEvent } from "./ipc";

const FFMPEG_EXE_FILE = "ffmpeg.exe";
const IMG_EXT = ".png";

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
    filename: `${year}-${month}-${day}_${hours}-${minutes}-${seconds}${IMG_EXT}`,
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
        const logMessage = `Captured: ${filename}`;
        logger.info(logMessage);
        sendEvent("getMessage", logMessage, "capture");
      }
    });
  }, interval * 1000);
};

const getImagesRecursively = async (dir: string) => {
  const images: string[] = [];

  const traverse = async (currentPath: string) => {
    const files = await readdir(currentPath);

    for (const file of files) {
      const fullPath = join(currentPath, file);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await traverse(fullPath);
      } else {
        if (extname(file).toLowerCase() === IMG_EXT) {
          images.push(fullPath);
        }
      }
    }
  };

  await traverse(dir);
  return images.sort();
};

export const createVideo = async (
  folderPath: string,
  fps: number,
): Promise<{ outputFilePath: string }> => {
  const outputFilePath = join(folderPath, "output.mp4");
  const images = await getImagesRecursively(folderPath);
  const listFile = join(app.getPath("userData"), "images_list.tmp");
  const listContent = images
    .map((img) => `file '${img.replace(/\\/g, "/")}'\nduration 1`)
    .join("\n");

  await writeFile(listFile, listContent, "utf-8");

  return new Promise<{ outputFilePath: string }>((resolve) => {
    const ffmpeg = spawn(ffmpegExePath, [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-c:v",
      "libx264",
      "-crf",
      "17",
      "-preset",
      "veryslow",
      "-pix_fmt",
      "yuv420p",
      "-r",
      String(fps),
      "-an",
      outputFilePath,
    ]);

    ffmpeg.stderr.on("data", (data) => {
      const output = data.toString();
      const frameMatch = output.match(/frame=\s*(\d+)/);

      if (frameMatch) {
        const currentFrame = parseInt(frameMatch[1]);
        const progress = Math.min(
          Math.round((currentFrame / images.length) * 100),
          100,
        );
        sendEvent("captureProgress", progress);
      }
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        const logMessage = `Video created: ${outputFilePath}`;
        logger.info(logMessage);
        sendEvent("getMessage", logMessage, "capture");
        sendEvent("captureProgress", 100);
        resolve({
          outputFilePath,
        });
      }
    });
  });
};
