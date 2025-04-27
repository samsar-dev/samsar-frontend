import { useTranslation } from "react-i18next";

interface FeatureSectionProps {
    title: string;
    features: string[];
  }
  
  const FeatureSection = ({ title, features }: FeatureSectionProps) => {
    const { t } = useTranslation();
    return (
      <div className="space-y-2 mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-6">
          {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature} className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">{feature}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {t("yes")}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  export default FeatureSection;
  