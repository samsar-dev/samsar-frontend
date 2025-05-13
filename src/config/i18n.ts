import i18n from "i18next";
import { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "@/locales/en.json";
import arTranslation from "@/locales/ar.json";

const resources = {
  en: {
    common: enTranslation,
    listings: enTranslation.listings,
  },
  AR: {
    common: arTranslation,
    listings: arTranslation.listings,
  },
};

const i18nConfig: InitOptions = {
  resources,
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  supportedLngs: ["en", "AR"],
  load: "languageOnly",
  ns: ["common", "listings"],
  defaultNS: "common",
  fallbackNS: "common",
  nsSeparator: ":",
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true,
  debug: true, // Enable debug mode
  saveMissing: true, // Save missing translations
};

i18n.use(initReactI18next).init(i18nConfig);

// Set document direction based on language
const currentLanguage = localStorage.getItem("language") || "en";
document.dir = currentLanguage === "ar" ? "rtl" : "ltr";

// Debug logging
console.log("i18n Resources:", resources);
console.log("i18n Current Language:", i18n.language);
console.log("i18n Translations:", i18n.t("common:sortOptions"));
console.log("Document direction set to:", document.dir);

export default i18n;
