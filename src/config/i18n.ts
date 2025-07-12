import i18n from "i18next";
import { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

// Import all translations using the index files
import enTranslations from "@/locales/en";
import arTranslations from "@/locales/ar";

// Define the resources structure with all namespaces
const resources = {
  en: enTranslations,
  ar: arTranslations,
};

const i18nConfig: InitOptions = {
  resources,
  // Load language from localStorage if available, otherwise use Arabic
  lng: localStorage.getItem('language') || "ar",
  fallbackLng: "ar",
  supportedLngs: ["en", "ar"],
  load: "languageOnly",
  detection: {
    // Disable all detection methods
    order: [],
    caches: [],
  },
  // Language will be set explicitly by the SettingsContext
  ns: [
    "common",
    "auth",
    "profile",
    "listings",
    "filters",
    "features",
    "options",
    "form",
    "errors",
    "home",
    "footer",
    "categories",
    "enums",
    "settings",
    "locations",
  ],
  defaultNS: "common",
  fallbackNS: "common",
  keySeparator: ".", // Use dot as key separator
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true,
  returnEmptyString: false,
  debug: false, // Disable debug mode
  saveMissing: false, // Disable saving missing translations
  saveMissingTo: "all", // Keep for consistency, though not used when saveMissing is false
};

i18n.use(Backend).use(initReactI18next).init(i18nConfig);

// Language direction will be set by the SettingsContext
if (localStorage.getItem("language")) {
  document.dir = localStorage.getItem("language") === "ar" ? "rtl" : "ltr";
}

export default i18n;
