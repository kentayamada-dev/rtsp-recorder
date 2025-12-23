import { authenticate } from "@google-cloud/local-auth";
import { app } from "electron";
import { createReadStream } from "node:fs";
import { access, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { google } from "googleapis";
import { logger } from "./log";
import { sendEvent } from "./ipc";

const TOKEN_FILE = "token.json";
const TOKEN_FILE_PATH = join(app.getPath("userData"), TOKEN_FILE);

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath);
    return true;
  } catch (err) {
    return false;
  }
};

export const uploadVideo = async (
  today: Date,
  secretFilePath: string,
  videoTitle: string,
  videoFilePath: string,
): Promise<void> => {
  let credentials: any = null;

  if (await fileExists(TOKEN_FILE_PATH)) {
    const tokenData = await readFile(TOKEN_FILE_PATH, "utf-8");
    credentials = JSON.parse(tokenData);
  }

  if (
    !credentials ||
    !credentials.refresh_token ||
    new Date(credentials.expiry_date) <= today
  ) {
    const auth = await authenticate({
      scopes: "https://www.googleapis.com/auth/youtube.upload",
      keyfilePath: secretFilePath,
    });

    credentials = auth.credentials;
    await writeFile(TOKEN_FILE_PATH, JSON.stringify(credentials));
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials(credentials);

  auth.on("tokens", (tokens) => {
    if (tokens.refresh_token) {
      credentials.refresh_token = tokens.refresh_token;
    }
    credentials.access_token = tokens.access_token;
    credentials.expiry_date = tokens.expiry_date;
    writeFile(TOKEN_FILE_PATH, JSON.stringify(credentials));
  });

  const youtube = google.youtube({
    version: "v3",
    auth: auth,
  });

  try {
    sendEvent("getMessage", `Upload started`, "upload");

    const fileStats = await stat(videoFilePath);
    const fileSize = fileStats.size;
    const videoStream = createReadStream(videoFilePath);
    let bytesUploaded = 0;

    videoStream.on("data", (chunk) => {
      bytesUploaded += chunk.length;
      const progress = Math.round((bytesUploaded / fileSize) * 100);
      sendEvent("uploadProgress", progress);
    });

    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: videoTitle,
        },
        status: {
          privacyStatus: "private",
        },
      },
      media: {
        body: videoStream,
      },
    });

    if (response.data.id) {
      const logMessage = `Uploaded: https://youtu.be/${response.data.id}`;
      logger.info(logMessage);
      sendEvent("getMessage", logMessage, "upload");
    } else {
      throw new Error(
        `Upload failed with unexpected response: ${JSON.stringify(
          response.data,
        )}`,
      );
    }
  } catch (error) {
    logger.error(`Upload failed: ${error}`);
  }
};
