import React, { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCar, FaHome } from 'react-icons/fa';
import { ListingCategory } from '@/types/enums';

// SEO and Performance Optimizations
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "سمسار",
  url: "https://samsar.app",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://samsar.app/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  inLanguage: "ar_AR",
  description:
    "منصة سمسار الرائدة في بيع وشراء السيارات والعقارات في سوريا. تصفح الآلاف من إعلانات السيارات المستعملة، الشقق، الفلل، الأراضي والمزيد في جميع أنحاء سوريا",
};

const websiteData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Samsar",
  image: "https://samsar.sa/logo.png",
  "@id": "",
  url: window.location.origin,
  telephone: "+963 11 123 4567",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Damascus, Syria",
    addressLocality: "Damascus",
    addressRegion: "Damascus",
    postalCode: "",
    addressCountry: "SY",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 33.5138,
    longitude: 36.2765,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    opens: "09:00",
    closes: "18:00",
  },
  sameAs: [
    "https://www.facebook.com/samsarsyria",
    "https://www.instagram.com/samsarsyria",
    "https://twitter.com/samsarsyria",
  ],
};

interface HomeHeroProps {
  selectedCategory: ListingCategory;
  onCategoryChange: (category: ListingCategory) => void;
}

const HomeHero: React.FC<HomeHeroProps> = memo(({ selectedCategory, onCategoryChange }) => {
  const { t } = useTranslation(['home']);

  const animationRef = useRef<number>();
  const headerRef = useRef<HTMLHeadingElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Only run this effect once on initial mount
    if (hasAnimatedRef.current || !headerRef.current) return;
    
    const headerText = headerRef.current;
    
    // Clean up any existing animations
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Schedule the animation for the next frame
    animationRef.current = requestAnimationFrame(() => {
      // Add the animate class to trigger the CSS animation
      headerText.classList.add('animate');
      hasAnimatedRef.current = true;
    });
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Preload resources in a separate effect
  useEffect(() => {
    // Preload critical CSS
    const criticalCSS = document.createElement('link');
    criticalCSS.rel = 'stylesheet';
    criticalCSS.href = '/css/hero-critical.css';
    document.head.appendChild(criticalCSS);

    // Preload hero image
    const heroImage = document.createElement('link');
    heroImage.rel = 'preload';
    heroImage.as = 'image';
    heroImage.href = '/images/hero-bg.jpg';
    document.head.appendChild(heroImage);

    // Preload font
    const font = new FontFace('Tajawal', 'url(/fonts/Tajawal-Regular.woff2) format("woff2")', {
      display: 'swap',
      weight: '400 900'
    });
    
    font.load().then(loadedFont => {
      document.fonts.add(loadedFont);
    }).catch(console.error);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <title>سمسار | سوق السيارات والعقارات الأول في سوريا</title>
      <meta name="keywords" content="عقارات سوريا, سيارات للبيع, شقق للايجار, فلل فاخرة, أراضي سكنية, محلات تجارية, سوق السيارات, سوق العقارات, عقارات دمشق, عقارات حلب, سيارات مستعملة, شقق للبيع, شقق مفروشة, مكاتب إدارية, شقق فندقية, دراجات نارية, شاحنات, باصات, قطع غيار, سمسار" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />

      {/* Critical CSS Inlined for LCP */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-header {
            position: relative;
            background: #1e40af;
            color: white;
            padding: 2rem 0;
            width: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .hero-content {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 80rem;
            margin-left: auto;
            margin-right: auto;
            padding-left: 1rem;
            padding-right: 1rem;
            text-align: center;
          }
          .hero-title {
            font-size: 1.875rem;
            line-height: 1.2;
            font-weight: 700;
            margin: 0 0 1rem;
            letter-spacing: -0.025em;
          }
          .hero-subtitle {
            margin: 1rem 0 0;
            font-size: 1rem;
            line-height: 1.5;
            color: rgba(219, 234, 254, 0.9);
            max-width: 48rem;
            margin-left: auto;
            margin-right: auto;
          }
          .hero-buttons {
            margin-top: 2rem;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
          }
          .hero-button {
            padding: 0.75rem 1.5rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .hero-button-active {
            background: white;
            color: #1e3a8a;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          .hero-button-inactive {
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }
          .hero-button-inactive:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          @media (min-width: 640px) {
            .hero-header { padding: 2.5rem 0; }
            .hero-title { font-size: 2.25rem; }
            .hero-subtitle { font-size: 1.125rem; }
          }
          @media (min-width: 768px) {
            .hero-header { padding: 4rem 0; }
            .hero-title { font-size: 3rem; }
          }
        `
      }} />
      
      <header className="hero-header" id="main-header">
        <div className="hero-content">
          <h1 
            ref={headerRef}
            id="main-heading"
            className="hero-title"
            data-lcp-text
          >
            {selectedCategory === ListingCategory.VEHICLES
              ? "أفضل السيارات في سوريا"
              : "أفضل العقارات في سوريا"}
          </h1>
          
          <p 
            className="hero-subtitle"
            data-lcp-text
          >
            {selectedCategory === ListingCategory.VEHICLES
              ? "اكتشف أحدث السيارات الجديدة والمستعملة بأسعار تنافسية من مالكين موثوقين"
              : "اكتشف أفضل العروض العقارية من شقق، فلل، وأراضي للبيع أو الإيجار"}
          </p>

          {/* Category Buttons */}
          <div className="hero-buttons">
            <button
              onClick={() => onCategoryChange(ListingCategory.VEHICLES)}
              className={`hero-button ${
                selectedCategory === ListingCategory.VEHICLES
                  ? "hero-button-active"
                  : "hero-button-inactive"
              }`}
            >
              <FaCar />
              {t("home:vehicle_section.title")}
            </button>
            <button
              onClick={() => onCategoryChange(ListingCategory.REAL_ESTATE)}
              className={`hero-button ${
                selectedCategory === ListingCategory.REAL_ESTATE
                  ? "hero-button-active"
                  : "hero-button-inactive"
              }`}
            >
              <FaHome />
              {t("home:property_section.title")}
            </button>
          </div>
        </div>
      </header>
    </>
  );
});

HomeHero.displayName = 'HomeHero';

export default HomeHero;
