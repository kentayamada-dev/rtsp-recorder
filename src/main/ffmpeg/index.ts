import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import type { CaptureForm } from "@shared-types/form";
import type { StrictOmit } from "@shared-types/types";
import type { Logger } from "@main/log/type";
import { formatDate } from "@main/utils";

export const createFFmpeg = (ffmpegExe: string, logger: Logger) => {
  const imgExt = ".png";
  const captureFrame = async ({
    outputFolder,
    rtspUrl,
    onCapture,
  }: StrictOmit<CaptureForm, "interval"> & {
    onCapture?: (filepath: string) => void;
  }) => {
    const { date, hour, second } = formatDate(new Date());
    const filename = `${second}${imgExt}`;
    const hourDir = join(outputFolder, date, hour);
    const filepath = join(hourDir, filename);
    await mkdir(hourDir, { recursive: true });

    const ffmpegProcess = spawn(ffmpegExe, [
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

    ffmpegProcess.on("error", (err) => {
      throw err;
    });

    ffmpegProcess.on("close", async (code) => {
      if (code === 0) {
        await logger.info(`Captured: ${filepath}`);
        onCapture?.(filepath);
      } else {
        const error = `FFmpeg failed with code ${code}`;
        throw new Error(error);
      }
    });
  };

  const createVideo = async (
    inputFolder: string,
    fps: number,
    imgListFile: string,
    images: string[],
    onProgress?: (progress: number) => void,
  ): Promise<{ videoFile: string }> => {
    const videoFile = join(inputFolder, "output.mp4");
    const listContent = images
      .map((img) => `file '${img.replace(/\\/g, "/")}'\nduration 1`)
      .join("\n");

    await writeFile(imgListFile, listContent, "utf-8");

    return new Promise<{ videoFile: string }>((resolve, reject) => {
      const ffmpegProcess = spawn(ffmpegExe, [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        imgListFile,
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
        videoFile,
      ]);

      let lastProgress = 0;

      ffmpegProcess.stderr.on("data", (data) => {
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
            onProgress?.(progress);
          }
        }
      });

      ffmpegProcess.on("error", (err) => reject(err));

      ffmpegProcess.stderr.on("error", (err) => reject(err));

      ffmpegProcess.on("close", async (code) => {
        if (code === 0) {
          await logger.info(`Video created: ${videoFile}`);
          resolve({ videoFile });
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });
    });
  };

  return {
    captureFrame,
    createVideo,
  };
};
