import { describe, it, vi } from "vitest";
import { join } from "node:path";
import { createGoogle } from ".";

describe("google", async () => {
  const testOutputFolder = join(process.cwd(), ".vitest/test-captures");
  const secretFile = join(testOutputFolder, "secret.json");
  const videoFile = join(testOutputFolder, "output.mp4");
  const tokenFile = join(testOutputFolder, "token.json");
  const logger = { info: vi.fn(), error: vi.fn() };
  const google = createGoogle(tokenFile, secretFile, logger);

  it("uploadVideo", async () => {
    const auth = await google.loadOAuthClient();
    await google.uploadVideo(auth, "sample", videoFile, (proress) => {
      console.log(proress);
    });
  });

  it("insertData", async () => {
    const auth = await google.loadOAuthClient();
    await google.insertData(
      auth,
      "1cBkf0mvhtAcdVlOzihibXAyP7e",
      "Data",
      ["Uploaded Date", "Link"],
      [[new Date().toString(), "https://example.com/"]],
    );
  });

  it("generateToken", async () => {
    await google.generateToken();
  });
});
