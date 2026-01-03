type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? PathValue<T[K], R>
      : never
    : never;

type PathKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string ? (T[K] extends object ? K | `${K}.${PathKeys<T[K]>}` : K) : never;
    }[keyof T]
  : never;

type WindowState = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type { PathValue, PathKeys, WindowState };
