import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

// Base URL for the website
const BASE_URL = import.meta.env.VITE_BASE_URL || "https://www.samsardeal.com";

// Common Syrian cities in Arabic for SEO
const SYRIAN_CITIES = [
  "دمشق",
  "حلب",
  "حمص",
  "حماة",
  "اللاذقية",
  "طرطوس",
  "دير الزور",
  "الحسكة",
  "الرقة",
  "السويداء",
  "درعا",
  "إدلب",
  "القنيطرة",
];

// Common vehicle types in Arabic for SEO
const VEHICLE_TYPES = [
  "سيارات",
  "مركبات",
  "عربيات",
  "شاحنات",
  "دراجات نارية",
  "باصات",
  "سيارات مستعملة",
  "سيارات جديدة",
  "سيارات فخمة",
  "سيارات عائلية",
];

// Common property types in Arabic for SEO
const PROPERTY_TYPES = [
  "شقق",
  "منازل",
  "فلل",
  "أراضي",
  "محلات",
  "مكاتب",
  "عقارات",
  "شقق للايجار",
  "شقق للبيع",
  "عقار سكني",
  "عقار تجاري",
];

// Generate dynamic keywords based on listing type and location
const generateKeywords = (
  type: "vehicle" | "property" | "general",
  city?: string,
) => {
  const baseKeywords =
    type === "vehicle"
      ? [...VEHICLE_TYPES, "بيع سيارات", "شراء سيارات"]
      : type === "property"
        ? [...PROPERTY_TYPES, "عقارات للبيع", "عقارات للايجار"]
        : [];

  const locationKeywords = city
    ? [
        ...baseKeywords.map((kw) => `${kw} في ${city}`),
        ...baseKeywords.map((kw) => `${kw} ${city}`),
      ]
    : [];

  const cityKeywords = SYRIAN_CITIES.flatMap((city) =>
    type === "vehicle"
      ? [`سيارات ${city}`, `معارض سيارات ${city}`]
      : [`عقارات ${city}`, `شقق ${city}`, `فلل ${city}`],
  );

  return [
    ...new Set([...baseKeywords, ...locationKeywords, ...cityKeywords]),
  ].join(", ");
};

// Default SEO configuration
export const SEO_CONFIG = {
  title: "سمسار | سوق السيارات والعقارات الأول في سوريا",
  description:
    "منصة سمسار الرائدة في بيع وشراء السيارات والعقارات في سوريا. تصفح الآلاف من إعلانات السيارات المستعملة، الشقق، الفلل، الأراضي والمزيد في جميع أنحاء سوريا",
  keywords: generateKeywords("general"),
  author: "Samsar Team",
  siteName: "سمسار",
  image: `${BASE_URL}/og-image.jpg`,
  twitter: "@samsar_sy",
  locale: "ar_SY",
  alternateUrls: {
    en: `${BASE_URL}/en`,
    ar: `${BASE_URL}/ar`,
  },
};

// SEO component props
interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: "website" | "article" | "product" | "profile" | "book";
  noIndex?: boolean;
  canonical?: string;
  children?: ReactNode;
  listingType?: "vehicle" | "property";
  location?: string;
  price?: string | number;
  year?: string | number;
  area?: string | number;
  openGraph?: {
    type?: string;
    url?: string;
    title?: string;
    description?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
    locale?: string;
    site_name?: string;
  };
}

/**
 * SEO component for setting page metadata
 */
export const SEO: React.FC<SEOProps> = ({
  title: propTitle,
  description: propDescription,
  keywords: propKeywords,
  image = SEO_CONFIG.image,
  type = "website",
  noIndex = false,
  listingType,
  location,
  price,
  year,
  area,
  children,
  ...props
}) => {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || "ar";
  const currentUrl = `${BASE_URL}${pathname}`;

  // Generate dynamic title and description based on listing details
  const getDynamicMetadata = () => {
    if (!listingType) return {};

    if (listingType === "vehicle") {
      const locationText = location ? ` في ${location}` : "";
      const yearText = year ? ` موديل ${year}` : "";
      const priceText = price ? ` بسعر ${price} ل.س` : "";

      return {
        title: `سيارة${locationText}${yearText}${priceText} | سمسار`,
        description: `إعلان سيارة${locationText}${yearText}${priceText}. تصفح المزيد من السيارات المتاحة للبيع في سوريا على منصة سمسار.`,
        keywords: generateKeywords("vehicle", location),
      };
    }

    if (listingType === "property") {
      const locationText = location ? ` في ${location}` : "";
      const areaText = area ? ` مساحة ${area} م²` : "";
      const priceText = price ? ` بسعر ${price} ل.س` : "";

      return {
        title: `عقار${locationText}${areaText}${priceText} | سمسار`,
        description: `إعلان عقار${locationText}${areaText}${priceText}. تصفح المزيد من العقارات المتاحة للبيع أو الإيجار في سوريا على منصة سمسار.`,
        keywords: generateKeywords("property", location),
      };
    }

    return {};
  };

  const dynamicMetadata = getDynamicMetadata();

  const title = propTitle || dynamicMetadata.title || SEO_CONFIG.title;
  const description =
    propDescription || dynamicMetadata.description || SEO_CONFIG.description;
  const keywords =
    propKeywords || dynamicMetadata.keywords || SEO_CONFIG.keywords;
  const ogImage = props.openGraph?.images?.[0]?.url || image;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SEO_CONFIG.author} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta
        property="og:locale"
        content={currentLanguage === "en" ? "en_US" : "ar_AR"}
      />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content={SEO_CONFIG.twitter} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Multilingual Alternate URLs */}
      {Object.entries(SEO_CONFIG.alternateUrls).map(([lang, url]) => (
        <link
          key={lang}
          rel="alternate"
          hrefLang={lang}
          href={`${url}${lang === "ar" ? pathname.replace(/^\/en/, "") : pathname.replace(/^\/ar/, "")}`}
        />
      ))}

      {/* No indexing if specified */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Additional Open Graph tags */}
      {price && (
        <meta property="product:price:amount" content={String(price)} />
      )}
      {price && <meta property="product:price:currency" content="SYP" />}
      {year && <meta property="product:release_date" content={String(year)} />}

      {children}
    </Helmet>
  );
};

/**
 * Default SEO configuration for the app
 */
export const DefaultSEO = () => <SEO {...SEO_CONFIG} />;
