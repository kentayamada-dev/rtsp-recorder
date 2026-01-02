import { createReadStream } from "node:fs";
import { readFile, stat, writeFile } from "node:fs/promises";
import { google, type Auth } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";
import type { Logger } from "@main/log/type";
import { config } from "@main/config";
import { toMutable } from "@main/utils";
import { i18n } from "@main/i18n";

export const createGoogle = (
  tokenFile: string,
  clientSecretFile: string,
  logger: Logger,
) => {
  const generateToken = async () => {
    let credentials: Auth.Credentials;
    try {
      credentials = (
        await authenticate({
          scopes: toMutable(config["google"]["scopes"]),
          keyfilePath: clientSecretFile,
        })
      ).credentials;
    } catch (error) {
      throw new Error(i18n.t("error.googleAuthFailed"));
    }

    await writeFile(tokenFile, JSON.stringify(credentials), "utf-8");
  };

  const loadOAuthClient = async () => {
    let oauth2Client: Auth.OAuth2Client;

    try {
      const { client_id, client_secret } = (
        JSON.parse(await readFile(clientSecretFile, "utf-8")) as {
          installed: {
            client_id: string;
            client_secret: string;
          };
        }
      ).installed;

      oauth2Client = new google.auth.OAuth2(client_id, client_secret);
    } catch (error) {
      throw new Error(i18n.t("error.googleSecretFaildLoad"));
    }

    try {
      const credentials = JSON.parse(await readFile(tokenFile, "utf-8"));
      oauth2Client.setCredentials(credentials);
    } catch (error) {
      throw new Error(i18n.t("error.googleTokenFaildLoad"));
    }

    return oauth2Client;
  };

  const uploadVideo = async (
    auth: Auth.OAuth2Client,
    videoTitle: string,
    videoFile: string,
    onProgress?: (progress: number) => void,
  ): Promise<string> => {
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
      const videoUrl = `${config["google"]["youtubeUrl"]}${videoId}`;
      logger.info(`Uploaded: ${videoUrl}`);
      return videoUrl;
    } else {
      throw new Error(
        `The upload failed with an unexpected response: ${JSON.stringify(response.data)}`,
      );
    }
  };

  const insertData = async (
    auth: Auth.OAuth2Client,
    sheetId: string,
    sheetName: string,
    headers: (string | number)[],
    values: (string | number)[][],
  ): Promise<void> => {
    const sheets = google.sheets({ version: "v4", auth });

    const sheet = (
      await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      })
    ).data.sheets?.find((sheet) => sheet.properties?.title === sheetName);

    if (!sheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
    }

    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!1:1`,
    });

    const hasHeaders = existingData.data.values?.[0]?.length ?? 0 > 0;

    if (!hasHeaders) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [headers],
        },
      });
    }

    const updatedSheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const targetSheet = updatedSheet.data.sheets?.find(
      (s) => s.properties?.title === sheetName,
    );

    const targetSheetId = targetSheet?.properties?.sheetId;
    if (targetSheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                fields: "gridProperties.frozenRowCount",
                properties: {
                  sheetId: targetSheetId,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
              },
            },
          ],
        },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });
  };

  return {
    uploadVideo,
    insertData,
    generateToken,
    loadOAuthClient,
  };
};
