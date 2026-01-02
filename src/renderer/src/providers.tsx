import { type JSX } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { LocaleProvider } from "./i18n";

const darkTheme = createTheme({
  components: {
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
    fontFamily: "Noto Sans JP Variable",
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
