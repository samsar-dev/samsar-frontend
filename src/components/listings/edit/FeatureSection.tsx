import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";

interface FeatureSectionProps {
  title: string;
  features: string[];
}

const FeatureSection = ({ title, features }: FeatureSectionProps) => {
  const { t } = useTranslation(['features', 'common', 'listings']);
  
  // Function to get the translation key for a feature
  const getFeatureTranslationKey = (feature: string) => {
    // First try to find the feature in the features namespace
    const sections = ['safety', 'airbags', 'security', 'camera', 'technology', 
                     'lighting', 'comfort', 'convenience', 'exterior', 'property'];
    
    for (const section of sections) {
      const translation = t(`features:${section}.${feature}`, { returnObjects: true });
      if (typeof translation === 'string' && translation !== `${section}.${feature}`) {
        return `features:${section}.${feature}`;
      }
    }
    
    // If not found in features, try in listings namespace
    const listingTranslation = t(`listings:${feature}`, { returnObjects: true });
    if (typeof listingTranslation === 'string' && listingTranslation !== feature) {
      return `listings:${feature}`;
    }
    
    // If no translation found, return the original feature name
    return feature;
  };

  // Get the title translation with fallback
  const translatedTitle = t(`listings:${title}`, { defaultValue: title });

  return (
    <div className="space-y-2 mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-6">
        {translatedTitle}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => {
          const translationKey = getFeatureTranslationKey(feature);
          const [ns, key] = translationKey.includes(':') 
            ? translationKey.split(':') 
            : [undefined, translationKey];
          
          const translatedFeature = ns 
            ? t(key, { ns }) 
            : t(key, { ns: 'features' });
          
          return (
            <div key={feature} className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {translatedFeature === key ? feature : translatedFeature}
              </p>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureSection;
