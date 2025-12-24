import { app } from "electron";
import { createReadStream } from "node:fs";
import { access, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";
import type { SendEvent } from "./ipc/types";

const PORT = 42813;
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
const REDIRECT_URI = `http://127.0.0.1:${PORT}`;
const TOKEN_FILE_PATH = join(app.getPath("userData"), "token.json");

type CredentialsFile = {
  installed: {
    client_id: string;
    client_secret: string;
  };
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const loadOAuthClient = async (clientSecretFile: string) => {
  const content = await readFile(clientSecretFile, "utf-8");
  const { client_id, client_secret } = (JSON.parse(content) as CredentialsFile)
    .installed;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    REDIRECT_URI,
  );

  if (await fileExists(TOKEN_FILE_PATH)) {
    const credentials = JSON.parse(await readFile(TOKEN_FILE_PATH, "utf-8"));
    oauth2Client.setCredentials(credentials);
    return oauth2Client;
  }

  const credentials = (
    await authenticate({
      scopes: SCOPES,
      keyfilePath: clientSecretFile,
    })
  ).credentials;

  await writeFile(TOKEN_FILE_PATH, JSON.stringify(credentials), "utf-8");
  oauth2Client.setCredentials(credentials);

  return oauth2Client;
};

export const uploadVideo = async (
  clientSecretFile: string,
  videoTitle: string,
  videoFilePath: string,
  sendEvent: SendEvent,
): Promise<void> => {
  sendEvent("upload:message", { message: "Starting YouTube authentication…" });

  const auth = await loadOAuthClient(clientSecretFile);

  const youtube = google.youtube({
    version: "v3",
    auth,
  });

  const fileSize = (await stat(videoFilePath)).size;
  const videoStream = createReadStream(videoFilePath);

  let bytesUploaded = 0;
  let lastProgress = 0;

  videoStream.on("data", (chunk) => {
    bytesUploaded += chunk.length;
    const progress = Math.round((bytesUploaded / fileSize) * 100);

    if (progress !== lastProgress) {
      lastProgress = progress;
      sendEvent("upload:progress", { progress });
    }
  });

  sendEvent("upload:message", { message: "Uploading video…" });

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

  if (!response.data.id) {
    throw new Error("Upload failed: No video ID returned");
  }

  const url = `https://youtu.be/${response.data.id}`;
  sendEvent("upload:message", { message: `Uploaded: ${url}` });
};
