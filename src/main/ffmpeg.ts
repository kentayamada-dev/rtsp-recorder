import {
  mkdir,
  readdir,
  rmdir,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import { join, extname } from "node:path";
import { spawn } from "node:child_process";
import { isDev } from "./config";
import { app } from "electron";
import archiver from "archiver";
import { logger } from "./log";
import type { SendEvent } from "./ipc/types";
import { createWriteStream } from "node:fs";
import { relative } from "node:path";
import type { CaptureForm } from "@shared-types/form";
import { formatDate } from "./utils";

const FFMPEG_EXE_FILE = "ffmpeg.exe";
const IMG_EXT = ".png";

const ffmpegExePath = isDev
  ? join(app.getAppPath(), `node_modules/ffmpeg-static/${FFMPEG_EXE_FILE}`)
  : join(process.resourcesPath, FFMPEG_EXE_FILE);

const deleteEmptyFolders = async (folderPath: string): Promise<void> => {
  const files = await readdir(folderPath, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      const fullPath = join(folderPath, file.name);
      await deleteEmptyFolders(fullPath);

      const remaining = await readdir(fullPath);
      if (remaining.length === 0) {
        await rmdir(fullPath);
      }
    }
  }
};

const zipImages = (
  folderPath: string,
  images: string[],
  zipFilePath: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", async () => {
      try {
        await Promise.all(images.map((img) => unlink(img)));
        await deleteEmptyFolders(folderPath);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    images.forEach((img) => {
      const relativePath = relative(folderPath, img);
      archive.file(img, { name: relativePath });
    });
    archive.finalize();
  });
};

type CaptureFrame = CaptureForm & {
  sendEvent: SendEvent;
};

export const captureFrame = ({
  interval,
  outputFolder,
  rtspUrl,
  sendEvent,
}: CaptureFrame) => {
  return setInterval(async () => {
    const { date, hour, second } = formatDate(new Date());
    const filename = `${second}${IMG_EXT}`;

    const hourDir = join(join(outputFolder, date), hour);
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
        sendEvent("capture:message", { message: logMessage });
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
  sendEvent: SendEvent,
  videoTitle: string,
): Promise<{ outputFilePath: string }> => {
  const outputFilePath = join(folderPath, "output.mp4");
  const zipFilePath = join(folderPath, `${videoTitle}_archived.zip`);
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

    let lastProgress = 0;

    ffmpeg.stderr.on("data", (data) => {
      const output = data.toString();
      const frameMatch = output.match(/frame=\s*(\d+)/);

      if (frameMatch) {
        const currentFrame = parseInt(frameMatch[1]);
        const progress = Math.min(
          Math.round((currentFrame / images.length) * 100),
          100,
        );
        if (progress !== lastProgress) {
          lastProgress = progress;
          sendEvent("capture:progress", { progress });
        }
      }
    });

    ffmpeg.on("close", async (code) => {
      if (code === 0) {
        const logMessage = `Video created: ${outputFilePath}`;
        logger.info(logMessage);
        sendEvent("capture:message", { message: logMessage });
        sendEvent("capture:message", { message: "Zip Started" });
        await zipImages(folderPath, images, zipFilePath);
        sendEvent("capture:message", { message: "Zip Ended" });
        resolve({ outputFilePath });
      }
    });
  });
};
