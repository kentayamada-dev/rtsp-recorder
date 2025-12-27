import { describe, it, vi } from "vitest";
import { join } from "node:path";
import { createYouTube } from ".";

describe("youtube", () => {
  const testOutputFolder = join(process.cwd(), ".vitest/test-captures");
  const secretFile = join(testOutputFolder, "secret.json");
  const videoFile = join(testOutputFolder, "output.mp4");
  const logger = { info: vi.fn(), error: vi.fn() };

  it("uploadVideo", async () => {
    const youtube = createYouTube(
      join(testOutputFolder, "token.json"),
      secretFile,
      logger,
    );
    await youtube.uploadVideo("sample", videoFile, (proress) => {
      console.log(proress);
    });
  });
});
