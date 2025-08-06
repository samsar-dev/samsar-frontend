import type { InitOptions } from "i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ChainedBackend from "i18next-chained-backend";
import resourcesToBackend from "i18next-resources-to-backend";

// Common namespaces that are used across the app
const defaultNS = "common";
const fallbackLng = "ar";
const supportedLngs = ["en", "ar"];

// List of all namespaces to preload
const allNamespaces = [
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
];

// Function to load translations dynamically
const loadTranslations = (lng: string, ns: string) => {
  return import(`@/locales/${lng}/${ns}.json`);
};

const i18nConfig: InitOptions = {
  // Set the default language from localStorage or fallback to Arabic
  lng: localStorage.getItem("language") || fallbackLng,
  fallbackLng,
  supportedLngs,
  defaultNS,
  fallbackNS: defaultNS,
  ns: allNamespaces,

  // Performance optimizations
  load: "languageOnly", // Only load language code (e.g., 'en' not 'en-US')
  saveMissing: false, // Disable in production
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },

  // Backend configuration for lazy loading
  backend: {
    backends: [
      resourcesToBackend((lng: string, ns: string) =>
        loadTranslations(lng, ns).catch(() => ({})),
      ),
    ],
    backendOptions: [
      {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },
    ],
  },

  // Optimize bundle size
  partialBundledLanguages: true, // Allow partial loading of languages
  keySeparator: ".",
  returnObjects: true, // Enable object access for nested translations
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: true,
  },
  debug: process.env.NODE_ENV === "development",
};

// Initialize i18next
i18n
  .use(ChainedBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig);

// Set document direction based on language
const updateDocumentDirection = (lng: string) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
};

// Listen for language changes
i18n.on("languageChanged", updateDocumentDirection);

// Initial direction setup
updateDocumentDirection(i18n.language);

export default i18n;
