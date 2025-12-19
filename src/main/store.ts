import { type FromSchema } from "json-schema-to-ts";
import Store from "electron-store";

const windowStateSchema = {
  type: "object",
  properties: {
    x: { type: "number" },
    y: { type: "number" },
    width: { type: "number" },
    height: { type: "number" },
  },
  required: ["x", "y", "width", "height"],
} as const;

const schema = {
  windowState: windowStateSchema,
} as const;

type WindowState = FromSchema<typeof windowStateSchema> | undefined;

const store = new Store({ schema });

const getWindowState = (): WindowState => {
  return store.get("windowState") as WindowState;
};

const saveWindowState = (
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  store.set("windowState", { x, y, width, height });
};

export { saveWindowState, getWindowState };
