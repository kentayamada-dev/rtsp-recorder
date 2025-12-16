import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@renderer/app";
import "@renderer/assets/app.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
