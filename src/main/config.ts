export const config = {
  appTitle: "RTSP Recorder",
  dev: import.meta.env.DEV,
  files: {
    config: "config.json",
    token: "token.json",
    imageExt: ".png",
    ffmpeg: "ffmpeg.exe",
  },
  folders: {
    logs: "Logs",
  },
  google: {
    scopes: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
    youtubeUrl: "https://youtu.be/",
  },
  ansiColors: {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    red: "\x1b[31m",
    gray: "\x1b[90m",
  },
} as const;
