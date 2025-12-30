import { type JSX } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

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
    fontFamily: "Noto Sans JP",
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
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
