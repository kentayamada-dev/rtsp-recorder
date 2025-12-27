import { createReadStream } from "node:fs";
import { readFile, stat, writeFile } from "node:fs/promises";
import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";
import { validatePath } from "@main/utils";
import type { Logger } from "@main/log/type";

export const createYouTube = (
  tokenFile: string,
  clientSecretFile: string,
  logger: Logger,
) => {
  const scopes = ["https://www.googleapis.com/auth/youtube.upload"];

  const loadOAuthClient = async () => {
    const content = await readFile(clientSecretFile, "utf-8");
    const { client_id, client_secret } = (
      JSON.parse(content) as {
        installed: {
          client_id: string;
          client_secret: string;
        };
      }
    ).installed;

    const oauth2Client = new google.auth.OAuth2(client_id, client_secret);

    if (await validatePath(tokenFile, "json")) {
      const credentials = JSON.parse(await readFile(tokenFile, "utf-8"));
      oauth2Client.setCredentials(credentials);
      return oauth2Client;
    }

    const credentials = (
      await authenticate({
        scopes,
        keyfilePath: clientSecretFile,
      })
    ).credentials;

    await writeFile(tokenFile, JSON.stringify(credentials), "utf-8");
    oauth2Client.setCredentials(credentials);

    return oauth2Client;
  };

  const uploadVideo = async (
    videoTitle: string,
    videoFile: string,
    onProgress?: (progress: number) => void,
  ): Promise<string> => {
    const auth = await loadOAuthClient();

    const youtube = google.youtube({
      version: "v3",
      auth,
    });

    const fileSize = (await stat(videoFile)).size;
    const videoStream = createReadStream(videoFile);

    let bytesUploaded = 0;
    let lastProgress = 0;

    videoStream.on("data", (chunk) => {
      bytesUploaded += chunk.length;
      const progress = Math.round((bytesUploaded / fileSize) * 100);

      if (progress !== lastProgress) {
        lastProgress = progress;
        onProgress?.(progress);
      }
    });

    try {
      const response = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: videoTitle,
          },
          status: {
            privacyStatus: "unlisted",
          },
        },
        media: {
          body: videoStream,
        },
      });

      const videoId = response.data.id;

      if (videoId) {
        logger.info(`Uploaded: https://youtu.be/${videoId}`);
        return videoId;
      } else {
        throw new Error(
          `The upload failed with an unexpected response: ${JSON.stringify(response.data)}`,
        );
      }
    } catch (error: any) {
      throw error;
    }
  };

  return {
    uploadVideo,
  };
};
