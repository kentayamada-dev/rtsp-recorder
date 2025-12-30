import { Configuration } from "electron-builder";
import ffmpegStatic from "ffmpeg-static";

const transformString = (str: string, mode: "replace" | "remove") => {
  if (mode === "remove") {
    return str.split(" ").join("");
  } else if (mode === "replace") {
    return str.toLowerCase().split(" ").join("-");
  } else {
    return str;
  }
};

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const productName = getEnv("PRODUCT_NAME");
const companyName = getEnv("COMPANY_NAME");

export default {
  productName,
  appId: `com.${companyName}.${transformString(productName, "replace")}`,
  npmRebuild: false,
  asarUnpack: ["resources/**"],
  extraResources: [
    {
      from: `${ffmpegStatic}`,
      to: "./",
    },
  ],
  directories: {
    buildResources: "build",
  },
  publish: {
    provider: "github",
    releaseType: "release",
  },
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
  },
  nsis: {
    artifactName: `${transformString(productName, "remove")}Setup-\${arch}-\${version}.\${ext}`,
    uninstallDisplayName: productName,
    createDesktopShortcut: "always",
    deleteAppDataOnUninstall: true,
  },
  electronFuses: {
    enableEmbeddedAsarIntegrityValidation: true,
    onlyLoadAppFromAsar: true,
  },
  files: [
    "!.vscode/*",
    "!.vitest/*",
    "!src/*",
    "!electron.vite.config.ts",
    "!vitest.config.ts",
    "!{prettier.config.mts,.prettierignore,README.md,note.md,LICENSE}",
    "!{.npmrc,pnpm-lock.yaml,pnpm-workspace.yaml}",
    "!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}",
  ],
} satisfies Configuration;
