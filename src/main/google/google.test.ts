import { describe, it, vi } from "vitest";
import { join } from "node:path";
import { createGoogle } from ".";

describe("google", async () => {
  const testOutputFolder = join(process.cwd(), ".vitest/test-captures");
  const secretFile = join(testOutputFolder, "secret.json");
  const videoFile = join(testOutputFolder, "output.mp4");
  const logger = { info: vi.fn(), error: vi.fn() };
  const google = createGoogle(
    join(testOutputFolder, "token.json"),
    secretFile,
    logger,
  );
  const auth = await google.loadOAuthClient();

  it("uploadVideo", async () => {
    await google.uploadVideo(auth, "sample", videoFile, (proress) => {
      console.log(proress);
    });
  });

  it("insertData", async () => {
    await google.insertData(
      auth,
      "1S4l7Wibuo_uwg7-zWQUyzEzaiVEJQiCmJV97Z_Jn9_A",
      "Data",
      [[new Date().toString(), "test"]],
    );
  });
});
