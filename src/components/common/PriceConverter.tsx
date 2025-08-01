import { useState } from "react";
import { useTranslation } from "react-i18next";
import { lazy, Suspense } from "react";

// Lazy load framer-motion components
const MotionSpan = lazy(() => 
  import('framer-motion').then(mod => ({ default: mod.motion.span }))
);
const AnimatePresence = lazy(() => 
  import('framer-motion').then(mod => ({ default: mod.AnimatePresence }))
);

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

interface PriceConverterProps {
  price: number;
  className?: string;
  showMonthly?: boolean;
  exchangeRate?: number;
}

// Current exchange rate (this should ideally come from an API in production)
const EXCHANGE_RATE = 14000; // 1 USD = 14,000 SYP (approximate rate, should be updated regularly)

export const PriceConverter: React.FC<PriceConverterProps> = ({
  price,
  className = "",
  showMonthly = false,
  exchangeRate = EXCHANGE_RATE, // Default exchange rate: 1 USD = 14,000 SYP
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  // Format prices using the original formatting functions
  const formattedUSD = formatPrice(price);
  const formattedSYP =
    Math.round(price * exchangeRate).toLocaleString("en-US") + " SYP";

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={isHovered ? t("common.showInUSD") : t("common.showInSYP")}
    >
      <Suspense fallback={
        <span className={isHovered ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"}>
          {isHovered ? formattedSYP : formattedUSD}
          {showMonthly && (
            <span className="text-xs ml-1">{t("common.monthly")}</span>
          )}
        </span>
      }>
        <AnimatePresence mode="wait">
          {isHovered ? (
            <MotionSpan
              key="syp"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-blue-700 dark:text-blue-300"
            >
              {formattedSYP}
              {showMonthly && (
                <span className="text-xs ml-1">{t("common.monthly")}</span>
              )}
            </MotionSpan>
          ) : (
            <MotionSpan
              key="usd"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-gray-900 dark:text-gray-100"
            >
              {formattedUSD}
              {showMonthly && (
                <span className="text-xs ml-1">{t("common.monthly")}</span>
              )}
            </MotionSpan>
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default PriceConverter;