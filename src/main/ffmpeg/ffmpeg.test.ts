import { describe, it, vi } from "vitest";
import { createFFmpeg } from ".";
import { join } from "node:path";
import { getFilesByExtension } from "../utils/index";

describe("ffmpeg", () => {
  const testOutputFolder = join(process.cwd(), ".vitest/test-captures");
  const ffmpegPath = join(process.cwd(), "node_modules/ffmpeg-static/ffmpeg.exe");
  const logger = { info: vi.fn(), error: vi.fn() };
  const ffmpeg = createFFmpeg(ffmpegPath, logger);

  it("captureFrame", async () => {
    const rtspUrl = "rtsp://localhost:8554/stream";
    const captureInterval = 5000;
    const maxCaptures = 10;
    let captureCount = 0;

    const interval = setInterval(async () => {
      if (captureCount < maxCaptures) {
        await ffmpeg.captureFrame({
          outputFolder: testOutputFolder,
          rtspUrl,
          onCapture: (progress) => {
            console.log(progress);
          },
        });
        captureCount++;
      }
    }, captureInterval);

    try {
      await new Promise((resolve) => {
        const checker = setInterval(() => {
          if (captureCount >= maxCaptures) {
            clearInterval(checker);
            resolve(undefined);
          }
        }, 100);
      });
    } finally {
      clearInterval(interval);
    }
  });

  it("createVideo", async () => {
    const images = await getFilesByExtension(testOutputFolder, ".png");

    await ffmpeg.createVideo(testOutputFolder, 1, join(testOutputFolder, "images_list.tmp"), images, (progress) => {
      console.log(progress);
    });
  });
});
