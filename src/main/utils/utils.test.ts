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
  it("should generate cron schedule for frequency 1 (daily)", () => {
    expect(generateCronSchedule(1)).toBe("0 0 * * *");
  });

  it("should generate cron schedule for frequency 2 (twice daily)", () => {
    expect(generateCronSchedule(2)).toBe("0 0,12 * * *");
  });

  it("should generate cron schedule for frequency 3 (every 8 hours)", () => {
    expect(generateCronSchedule(3)).toBe("0 0,8,16 * * *");
  });

  it("should generate cron schedule for frequency 4 (every 6 hours)", () => {
    expect(generateCronSchedule(4)).toBe("0 0,6,12,18 * * *");
  });

  it("should generate cron schedule for frequency 5 (every 5 hours)", () => {
    expect(generateCronSchedule(5)).toBe("0 0,5,10,15,20 * * *");
  });

  it("should generate cron schedule for frequency 6 (every 4 hours)", () => {
    expect(generateCronSchedule(6)).toBe("0 0,4,8,12,16,20 * * *");
  });
});
