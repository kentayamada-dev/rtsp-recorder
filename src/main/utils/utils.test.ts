import { describe, it } from "vitest";
import { join } from "node:path";
import { deleteFiles, getFilesByExtension } from ".";

describe("utils", () => {
  const testOutputFolder = join(process.cwd(), ".vitest/test-captures");

  it("deleteFiles", async () => {
    const images = await getFilesByExtension(testOutputFolder, ".png");
    await new Promise((resolve) => setTimeout(resolve, 8000));

    await deleteFiles(images);
  });
});
