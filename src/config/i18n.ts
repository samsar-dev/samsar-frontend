import i18n from "i18next";
import { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "@/locales/en.json";
import arTranslation from "@/locales/ar.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  ar: {
    translation: arTranslation,
  },
};

const i18nConfig: InitOptions = {
  resources,
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true,
  debug: false,
  saveMissing: false,
};

i18n.use(initReactI18next).init(i18nConfig);

export default i18n;
