import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

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
      <AnimatePresence mode="wait">
        {isHovered ? (
          <motion.span
            key="syp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-blue-600 dark:text-blue-400"
          >
            {formattedSYP}
            {showMonthly && (
              <span className="text-gray-500 dark:text-gray-400">/mo</span>
            )}
          </motion.span>
        ) : (
          <motion.span
            key="usd"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {formattedUSD}
            {showMonthly && (
              <span className="text-gray-500 dark:text-gray-400">/mo</span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PriceConverter;
