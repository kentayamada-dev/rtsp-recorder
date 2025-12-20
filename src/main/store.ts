import { app } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { logger } from "./log";
import type { FormStore } from "@shared-types/form";

type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? PathValue<T[K], R>
      : never
    : never;

type PathKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | `${K}.${PathKeys<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

const createStore = <Schema extends Record<string, any>>(
  fileName: string = "config.json",
) => {
  const filePath = join(app.getPath("userData"), fileName);
  let data: Partial<Schema> = {};

  const load = () => {
    try {
      if (existsSync(filePath)) {
        data = JSON.parse(readFileSync(filePath, "utf-8"));
      }
    } catch (error) {
      logger.error("Failed to load store:", error);
      data = {};
    }
  };

  const save = () => {
    try {
      writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      logger.error("Failed to save store:", error);
    }
  };

  const getNestedValue = (obj: any, path: string): any => {
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
    const lastKey = keys.pop()!;
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
    const lastKey = keys.pop();
    let current = obj;

    for (const key of keys) {
      if (!current || typeof current !== "object" || !(key in current)) {
        return false;
      }
      current = current[key];
    }

    if (
      lastKey &&
      current &&
      typeof current === "object" &&
      lastKey in current
    ) {
      delete current[lastKey];
      return true;
    }
    return false;
  };

  load();

  return {
    get<K extends PathKeys<Schema>>(key: K): PathValue<Schema, K> | undefined {
      return getNestedValue(data, key as string);
    },

    set<K extends PathKeys<Schema>>(key: K, value: PathValue<Schema, K>) {
      setNestedValue(data, key as string, value);
      save();
    },

    delete<K extends PathKeys<Schema>>(key: K) {
      deleteNestedValue(data, key as string);
      save();
    },
  };
};

type StoreSchema = {
  form: FormStore;
  window: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export const store = createStore<StoreSchema>("config.json");
