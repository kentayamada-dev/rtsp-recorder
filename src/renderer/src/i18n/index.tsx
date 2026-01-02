import {
  createContext,
  useState,
  useContext,
  type JSX,
  useEffect,
} from "react";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import type {
  SupportedLang,
  ValidateTranslations,
  Paths,
} from "@shared-types/i18n";

type LocaleContextType = {
  locale: SupportedLang;
  setLocale: (lang: SupportedLang) => void;
};

const translations = {
  en,
  ja,
} as const satisfies Record<SupportedLang, ValidateTranslations<typeof en>>;

type TranslationKey = Paths<typeof en>;

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

type LocaleProviderProps = {
  children: JSX.Element;
};

export const LocaleProvider = ({
  children,
}: LocaleProviderProps): JSX.Element => {
  const [locale, setLocale] = useState<SupportedLang>("en");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const lang = await window.api.invoke("getLang");

      if (lang) {
        setLocale(lang);
      }
      setIsReady(true);
    };

    fetchData();
  }, []);

  if (!isReady) return <></>;

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

type UseLocaleReturn = {
  locale: SupportedLang;
  setLocale: (lang: SupportedLang) => void;
  t: (key: TranslationKey) => string;
};

export const useLocale = (): UseLocaleReturn => {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  const { locale, setLocale } = context;
  const t = (key: TranslationKey): string => {
    const value = key
      .split(".")
      .reduce((obj, k) => obj?.[k], translations[locale]);
    return typeof value === "string" ? value : key;
  };

  return { locale, setLocale, t };
};
