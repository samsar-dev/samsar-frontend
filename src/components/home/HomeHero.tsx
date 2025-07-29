import React, { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCar, FaHome } from 'react-icons/fa';
import { ListingCategory } from '@/types/enums';

 

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

  return (
    <>
      {/* Ultra-optimized Critical CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
                    .hero-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 40vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            width: 100%;
            direction: rtl;
            isolation: isolate;
          }
          .hero-content {
            text-align: center;
            color: white;
            position: relative;
            z-index: auto;
          }
          .hero-title {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            color: white;
            margin: 0 0 1rem;
            animation: titleSlide 0.8s ease-out 0.2s both;
          }
          @keyframes titleSlide {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hero-subtitle {
            font-size: clamp(1.1rem, 2.5vw, 1.5rem);
            color: rgba(255, 255, 255, 0.9);
            margin: 0 0 2rem;
            animation: subtitleSlide 0.8s ease-out 0.4s both;
          }
          @keyframes subtitleSlide {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hero-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            animation: buttonsSlide 0.8s ease-out 0.6s both;
          }
          @keyframes buttonsSlide {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hero-button {
            padding: 0.75rem 2rem;
            border: 2px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }
          .hero-button:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
          }
          .hero-button-active {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.8);
          }
          @media (max-width: 768px) {
            .hero-container { min-height: 50vh; }
            .hero-buttons { flex-direction: column; align-items: center; }
          }
        `
      }} />
      
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            {t('home:hero.title')}
          </h1>
          <p className="hero-subtitle">
            {t('home:hero.subtitle')}
          </p>
          <div className="hero-buttons">
            <button
              onClick={() => onCategoryChange(ListingCategory.VEHICLES)}
              className={`hero-button ${
                selectedCategory === ListingCategory.VEHICLES
                  ? 'hero-button-active'
                  : ''
              }`}
            >
              <FaCar />
              {t('home:vehicle_section.title')}
            </button>
            <button
              onClick={() => onCategoryChange(ListingCategory.REAL_ESTATE)}
              className={`hero-button ${
                selectedCategory === ListingCategory.REAL_ESTATE
                  ? 'hero-button-active'
                  : ''
              }`}
            >
              <FaHome />
              {t('home:property_section.title')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

HomeHero.displayName = 'HomeHero';

export default HomeHero;
