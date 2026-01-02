import { describe, expect, it } from "vitest";
import { join } from "node:path";
import { deleteFiles, generateCronSchedule, getFilesByExtension } from ".";

describe("utils", () => {
  const testOutputFolder = join(process.cwd(), ".vitest/test-captures");

  it("deleteFiles", async () => {
    const images = await getFilesByExtension(testOutputFolder, ".png");
    await new Promise((resolve) => setTimeout(resolve, 8000));

    await deleteFiles(images);
  });
});

describe("generateCronSchedule", () => {
  it("should generate cron for frequency 1", () => {
    expect(generateCronSchedule(1)).toBe("0 0 0 * * *");
  });

  it("should generate cron for frequency 2", () => {
    expect(generateCronSchedule(2)).toBe("0 0 0,12 * * *");
  });

  it("should add offset seconds", () => {
    expect(generateCronSchedule(1, 5)).toBe("5 0 0 * * *");
  });

  it("should handle frequency 4 with offset", () => {
    expect(generateCronSchedule(4, 30)).toBe("30 0 0,6,12,18 * * *");
  });
});
