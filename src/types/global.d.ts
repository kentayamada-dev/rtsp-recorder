import type { Api } from "../main/ipc/types";

declare global {
  interface Window {
    api: Api;
  }
}
