type ValidateTranslations<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: T[K] extends string ? string : ValidateTranslations<T[K]>;
      }
    : string;

type Paths<T, P extends string = ""> = T extends string
  ? P
  : {
      [K in keyof T & string]: Paths<T[K], `${P}${P extends "" ? "" : "."}${K}`>;
    }[keyof T & string];

const supportedLangs = ["en", "ja"] as const;

type SupportedLang = (typeof supportedLangs)[number];

export { type ValidateTranslations, type Paths, type SupportedLang, supportedLangs };
