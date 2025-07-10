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
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  supportedLngs: ["en", "ar"],
  load: "languageOnly",
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

// Set document direction based on language
const currentLanguage = localStorage.getItem("language") || "en";
document.dir = currentLanguage === "ar" ? "rtl" : "ltr";

export default i18n;
