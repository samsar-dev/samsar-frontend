import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

interface PriceConverterProps {
  price: number;
  className?: string;
  showMonthly?: boolean;
  exchangeRate?: number;
}

const EXCHANGE_RATE = 14000;

const PriceConverter: React.FC<PriceConverterProps> = ({
  price,
  className = '',
  showMonthly = false,
  exchangeRate = EXCHANGE_RATE,
}) => {
  const { t } = useTranslation();
  const formattedUSD = formatPrice(price);
  const formattedSYP = `${Math.round(price * exchangeRate).toLocaleString('en-US')} SYP`;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <span className="text-blue-600 dark:text-blue-400">
        {formattedSYP}
        {showMonthly && (
          <span className="text-gray-500 dark:text-gray-400">/mo</span>
        )}
      </span>
      <span
        className="text-gray-500 dark:text-gray-400"
        title={t('common.showInUSD')}
      >
        {formattedUSD}
        {showMonthly && (
          <span className="text-gray-500 dark:text-gray-400">/mo</span>
        )}
      </span>
    </div>
  );
};

export { PriceConverter, formatPrice, formatCurrency };
