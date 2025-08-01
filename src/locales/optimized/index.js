// Auto-generated optimized translations index
import criticalAr from './ar/critical.json';
import criticalEn from './en/critical.json';
import lazyAr from './ar/lazy.json';
import lazyEn from './en/lazy.json';
import deferredAr from './ar/deferred.json';
import deferredEn from './en/deferred.json';

// Critical translations (loaded immediately)
export const criticalTranslations = {
  ar: criticalAr,
  en: criticalEn,
};

// Lazy translations (loaded on demand)
export const lazyTranslations = {
  ar: lazyAr,
  en: lazyEn,
};

// Deferred translations (loaded after app is interactive)
export const deferredTranslations = {
  ar: deferredAr,
  en: deferredEn,
};

// Dynamic import functions
export const loadTranslations = async (language, bundle) => {
  switch (bundle) {
    case 'critical':
      return criticalTranslations[language];
    case 'lazy':
      return lazyTranslations[language];
    case 'deferred':
      return deferredTranslations[language];
    default:
      return criticalTranslations[language];
  }
};
