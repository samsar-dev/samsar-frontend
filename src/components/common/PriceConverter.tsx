import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PriceConverterProps {
  price: number;
  className?: string;
  showMonthly?: boolean;
}

// Current exchange rate (this should ideally come from an API in production)
const EXCHANGE_RATE = 14000; // 1 USD = 14,000 SYP (approximate rate, should be updated regularly)

// Debounce delay in milliseconds
const HOVER_DEBOUNCE_DELAY = 150;

export const PriceConverter: React.FC<PriceConverterProps> = ({
  price,
  className = '',
  showMonthly = false,
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clear any pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Memoize the formatted prices to prevent unnecessary recalculations
  const { usdDisplay, sypDisplay } = useMemo(() => {
    const formatNumber = (num: number) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const usdFormatted = `$${formatNumber(price)}${showMonthly ? '/mo' : ''}`;
    const sypFormatted = `${formatNumber(Math.round(price * EXCHANGE_RATE))} ${t('currency.syp')}`;
    
    return {
      usdDisplay: usdFormatted,
      sypDisplay: sypFormatted
    };
  }, [price, showMonthly, t]);

  // Memoize the tooltip text
  const tooltipText = useMemo(() => (
    isHovered ? t('common.showInUSD') : t('common.showInSYP')
  ), [isHovered, t]);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, HOVER_DEBOUNCE_DELAY);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, HOVER_DEBOUNCE_DELAY);
  }, []);

  // Handle mouse move to detect when we're still hovering over the element
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Check if we're still within bounds to prevent flickering at edges
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const isInside = 
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom;
      
      if (isInside && !isHovered) {
        hoverTimeoutRef.current = setTimeout(() => {
          setIsHovered(true);
        }, 50);
      } else if (!isInside && isHovered) {
        hoverTimeoutRef.current = setTimeout(() => {
          setIsHovered(false);
        }, 100);
      }
    }
  }, [isHovered]);

  // Use a single container with a more reliable hover area
  return (
    <div 
      ref={containerRef}
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      title={tooltipText}
      style={{
        minWidth: 'max-content',
        padding: '0 2px', // Add some padding to increase hover area
      }}
    >
      <div 
        className={`transition-all duration-300 ease-out transform ${
          isHovered ? 'opacity-0 scale-95 absolute' : 'opacity-100 scale-100'
        }`}
        style={{
          transitionProperty: 'opacity, transform',
          willChange: 'opacity, transform',
          pointerEvents: 'none', // Prevent this element from interfering with hover
        }}
      >
        {usdDisplay}
      </div>
      <div 
        className={`transition-all duration-300 ease-out transform ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105 absolute'
        }`}
        style={{
          transitionProperty: 'opacity, transform',
          willChange: 'opacity, transform',
          pointerEvents: 'none', // Prevent this element from interfering with hover
        }}
      >
        {sypDisplay}
      </div>
    </div>
  );
};

export default PriceConverter;
