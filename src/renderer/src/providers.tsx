import { type JSX } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { LocaleProvider } from "./i18n";
// @ts-ignore
import NotoSansJP from "./assets/noto-sans-jp-japanese-400-normal.woff2";
// @ts-ignore
import RobotMono from "./assets/roboto-mono-latin-400-normal.woff2";

const darkTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Noto Sans JP';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: url(${NotoSansJP}) format('woff2');
        }
        @font-face {
          font-family: 'Roboto Mono';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: url(${RobotMono}) format('woff2');
          unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
        }
      `,
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: { margin: 0 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { background: "#1e2227" },
      },
    },
  },
  typography: {
    fontFamily: ["Noto Sans JP"].join(","),
  },
  palette: {
    mode: "dark",
    background: {
      default: "#23272e",
    },
  },
});

type ProvidersProps = {
  children: JSX.Element;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <LocaleProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </LocaleProvider>
  );
};
