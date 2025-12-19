import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@renderer/app";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "@fontsource/inter/500.css";

const darkTheme = createTheme({
  components: {
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          margin: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: "#1e2227",
        },
      },
    },
  },
  typography: {
    fontFamily: "Inter",
  },
  palette: {
    mode: "dark",
    background: {
      default: "#23272e",
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
