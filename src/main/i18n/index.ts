import { store } from "@main/store";
import { app } from "electron";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import {
  type SupportedLang,
  type ValidateTranslations,
  type Paths,
  supportedLangs,
} from "@shared-types/i18n";

const translations = {
  en,
  ja,
} as const satisfies Record<SupportedLang, ValidateTranslations<typeof en>>;

type TranslationKey = Paths<typeof en>;

export const i18n = (() => {
  let currentTranslations = {};
  let currentLang: SupportedLang = supportedLangs[0];

  const isSupportedLang = (lang: any): lang is SupportedLang => {
    return supportedLangs.includes(lang);
  };

  const changeCurrentTranslations = () => {
    currentTranslations = translations[currentLang];
  };

  const changeCurrentLang = async (lang: SupportedLang) => {
    currentLang = lang;
    await store.set("lang", currentLang);
    changeCurrentTranslations();
  };

  const t = (key: TranslationKey) => {
    const value = key
      .split(".")
      .reduce((obj, k) => obj?.[k], currentTranslations);
    return value && typeof value === "string" ? value : key;
  };

  const init = async () => {
    const lang = await store.get("lang");

    if (isSupportedLang(lang)) {
      currentLang = lang;
    } else {
      const systemLang = app.getLocale().split("-")[0];
      currentLang = isSupportedLang(systemLang)
        ? systemLang
        : supportedLangs[0];

      await store.set("lang", currentLang);
    }

    changeCurrentTranslations();
  };

  return {
    init,
    changeCurrentLang,
    t,
    getCurrentLang: () => currentLang,
  };
})();
