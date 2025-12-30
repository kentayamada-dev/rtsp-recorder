import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { isDefined } from "@main/utils";
import type { PathKeys, PathValue } from "./type";
import { config } from "@main/config";
import { app } from "electron";
import type { FormStore, GoogleStore } from "@shared-types/form";

const createStore = <Schema extends Record<string, any>>() => {
  const appData = app.getPath("userData");
  const filePath = join(appData, config["files"]["config"]);
  let data: Partial<Schema> = {};

  const load = async () => {
    try {
      const raw = await readFile(filePath, "utf-8");
      data = JSON.parse(raw);
    } catch (error: any) {
      data = {};
    }
  };

  const ready = load();

  let writeChain: Promise<void> = Promise.resolve();

  const save = () => {
    writeChain = writeChain.then(async () => {
      await writeFile(filePath, JSON.stringify(data), "utf-8");
    });

    return writeChain;
  };

  const getNestedValue = (obj: unknown, path: string): any => {
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (result && typeof result === "object" && key in result) {
        result = result[key];
      } else {
        return undefined;
      }
    }

    return result;
  };

  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split(".");
    const lastKey = isDefined(keys.pop());
    let current = obj;

    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
  };

  const deleteNestedValue = (obj: any, path: string): boolean => {
    const keys = path.split(".");
    const lastKey = isDefined(keys.pop());
    let current = obj;

    for (const key of keys) {
      if (!current || typeof current !== "object" || !(key in current)) {
        return false;
      }
      current = current[key];
    }

    if (current && typeof current === "object" && lastKey in current) {
      delete current[lastKey];
      return true;
    }

    return false;
  };

  return {
    async get<K extends PathKeys<Schema>>(
      key: K,
    ): Promise<PathValue<Schema, K> | undefined> {
      await ready;
      return getNestedValue(data, key as string);
    },

    async set<K extends PathKeys<Schema>>(
      key: K,
      value: PathValue<Schema, K>,
    ): Promise<void> {
      await ready;
      setNestedValue(data, key as string, value);
      await save();
    },

    async delete<K extends PathKeys<Schema>>(key: K): Promise<void> {
      await ready;
      deleteNestedValue(data, key as string);
      await save();
    },
  };
};

export const store = createStore<{
  form: FormStore;
  google: GoogleStore;
  window: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}>();
