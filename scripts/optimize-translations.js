#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TranslationOptimizer {
  constructor() {
    this.localesDir = path.join(__dirname, '../src/locales');
    this.outputDir = path.join(__dirname, '../src/locales/optimized');
    this.stats = {
      originalSize: 0,
      optimizedSize: 0,
      compressionRatio: 0,
      duplicatesRemoved: 0
    };
  }

  async optimize() {
    console.log('🚀 Starting translation optimization...');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const languages = ['ar', 'en'];
    
    for (const lang of languages) {
      await this.optimizeLanguage(lang);
    }

    this.generateOptimizedIndex();
    this.printStats();
  }

  async optimizeLanguage(language) {
    console.log(`📦 Optimizing ${language} translations...`);
    
    const langDir = path.join(this.localesDir, language);
    const outputLangDir = path.join(this.outputDir, language);
    
    if (!fs.existsSync(outputLangDir)) {
      fs.mkdirSync(outputLangDir, { recursive: true });
    }

    const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
    const allTranslations = {};
    const duplicates = new Set();

    // Load all translations
    for (const file of files) {
      const filePath = path.join(langDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Track original size
      this.stats.originalSize += JSON.stringify(content).length;
      
      // Remove duplicates and optimize
      const optimized = this.optimizeTranslationObject(content, duplicates);
      allTranslations[file.replace('.json', '')] = optimized;
      
      // Write optimized file
      const optimizedPath = path.join(outputLangDir, file);
      fs.writeFileSync(optimizedPath, JSON.stringify(optimized, null, 0));
      
      this.stats.optimizedSize += JSON.stringify(optimized).length;
    }

    // Create compressed bundle
    this.createCompressedBundle(language, allTranslations);
  }

  optimizeTranslationObject(obj, duplicates, prefix = '') {
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nested = this.optimizeTranslationObject(value, duplicates, fullKey);
        if (Object.keys(nested).length > 0) {
          result[key] = nested;
        }
      } else {
        const stringValue = String(value);
        
        // Skip if it's a duplicate
        if (duplicates.has(stringValue)) {
          this.stats.duplicatesRemoved++;
          continue;
        }
        
        // Skip common phrases that can be shared
        if (this.shouldSkipCommonPhrase(stringValue)) {
          continue;
        }
        
        // Optimize string
        const optimized = this.optimizeString(stringValue);
        result[key] = optimized;
        duplicates.add(stringValue);
      }
    }
    
    return result;
  }

  shouldSkipCommonPhrase(text) {
    const commonPhrases = [
      'البحث', 'حفظ', 'إلغاء', 'تعديل', 'حذف', 'نعم', 'لا', 'رجوع', 'متابعة',
      'عرض', 'إخفاء', 'عرض الكل', 'إخفاء الكل', 'عرض أقل', 'عرض المزيد',
      'السعر', 'الموقع', 'الوصف', 'العنوان', 'الصور', 'الفيديو', 'الملفات'
    ];
    
    return commonPhrases.includes(text);
  }

  optimizeString(text) {
    // Remove extra whitespace
    return text.trim().replace(/\s+/g, ' ');
  }

  createCompressedBundle(language, translations) {
    console.log(`🗜️  Creating compressed bundle for ${language}...`);
    
    // Create namespace mapping
    const namespaceMapping = {
      critical: ['common', 'auth', 'errors', 'form'],
      lazy: ['listings', 'profile', 'settings', 'home', 'categories', 'locations'],
      deferred: ['features', 'options', 'footer', 'enums', 'filters']
    };

    const bundles = {
      critical: {},
      lazy: {},
      deferred: {}
    };

    // Distribute translations into bundles
    for (const [namespace, content] of Object.entries(translations)) {
      let targetBundle = 'deferred';
      
      if (namespaceMapping.critical.includes(namespace)) {
        targetBundle = 'critical';
      } else if (namespaceMapping.lazy.includes(namespace)) {
        targetBundle = 'lazy';
      }
      
      bundles[targetBundle][namespace] = content;
    }

    // Write compressed bundles
    for (const [bundleName, content] of Object.entries(bundles)) {
      if (Object.keys(content).length > 0) {
        const bundlePath = path.join(this.outputDir, language, `${bundleName}.json`);
        fs.writeFileSync(bundlePath, JSON.stringify(content, null, 0));
      }
    }
  }

  generateOptimizedIndex() {
    const indexContent = `// Auto-generated optimized translations index
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
`;

    fs.writeFileSync(path.join(this.outputDir, 'index.js'), indexContent);
  }

  printStats() {
    this.stats.compressionRatio = ((this.stats.originalSize - this.stats.optimizedSize) / this.stats.originalSize * 100).toFixed(1);
    
    console.log('\n📊 Translation Optimization Stats:');
    console.log(`Original Size: ${(this.stats.originalSize / 1024).toFixed(2)} kB`);
    console.log(`Optimized Size: ${(this.stats.optimizedSize / 1024).toFixed(2)} kB`);
    console.log(`Compression Ratio: ${this.stats.compressionRatio}%`);
    console.log(`Duplicates Removed: ${this.stats.duplicatesRemoved}`);
    console.log('✅ Translation optimization complete!');
  }
}

// Run optimization
const optimizer = new TranslationOptimizer();
optimizer.optimize().catch(console.error);
