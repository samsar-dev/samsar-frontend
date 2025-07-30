import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageFallback from '@/components/media/ImageFallback';

const PopularCategories = () => {
  const { t } = useTranslation();

  // Helper function to generate Cloudflare-optimized image URLs for R2
  const getImageSrcSet = (baseUrl: string) => {
    if (!baseUrl) return '';
    const [url] = baseUrl.split('?');
    
    // Aggressive optimization for actual display size (332x248)
    const sizes = [332, 498, 664]; // 1x, 1.5x, 2x for responsive
    
    return sizes.map(size => 
      `${url}?width=${size}&height=${Math.floor(size * 0.75)}&format=webp&quality=60&fit=crop&compression=strong ${size}w`
    ).join(', ');
  };

  const getOptimizedImageUrl = (baseUrl: string, width: number = 332) => {
    if (!baseUrl) return '';
    const [url] = baseUrl.split('?');
    
    // Ultra-aggressive compression for 332x248 display
    const height = Math.floor(width * 0.75);
    return `${url}?width=${width}&height=${height}&format=webp&quality=60&fit=crop&compression=strong`;
  };

  const categories = [
    {
      id: 'cars',
      title: t('home:categories.cars', 'سيارات'),
      description: t('home:categories.cars_desc', 'أحدث الموديلات والماركات'),
      image: getOptimizedImageUrl('https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/bmw-8327255_1920.jpg'),
      srcSet: getImageSrcSet('https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/bmw-8327255_1920.jpg'),
      href: '/listings?category=vehicles&subCategory=CAR',
      alt: t('home:categories.cars', 'سيارات'),
    },
    {
      id: 'real_estate',
      title: t('home:categories.real_estate', 'عقارات'),
      description: t('home:categories.real_estate_desc', 'شقق، فلل، محلات تجارية'),
      image: getOptimizedImageUrl('https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/building-8078604_1920.jpg'),
      srcSet: getImageSrcSet('https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/building-8078604_1920.jpg'),
      href: '/listings?category=real_estate',
      alt: t('home:categories.real_estate', 'عقارات'),
    },
    {
      id: 'motorcycles',
      title: t('home:categories.motorcycles', 'دراجات نارية'),
      description: t('home:categories.motorcycles_desc', 'أحدث الموديلات بأسعار منافسة'),
      image: getOptimizedImageUrl('https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/motorcycle.png'),
      srcSet: getImageSrcSet('https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/motorcycle.png'),
      href: '/listings?category=vehicles&subCategory=MOTORCYCLE',
      alt: t('home:categories.motorcycles', 'دراجات نارية'),
    },
    {
      id: 'commercial',
      title: t('home:categories.commercial', 'تجاري'),
      description: t('home:categories.commercial_desc', 'محلات ومكاتب تجارية'),
      image: getOptimizedImageUrl('https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/office-1094826_1920.jpg'),
      srcSet: getImageSrcSet('https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/office-1094826_1920.jpg'),
      href: '/listings?category=real_estate&subCategory=COMMERCIAL',
      alt: t('home:categories.commercial', 'تجاري'),
    },
  ];

  return (
    <section className="mt-16 bg-gray-50 dark:bg-gray-900 py-12 w-full">
      <div className="w-full px-0 sm:px-2 md:px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 px-2">
          <span className="hidden" aria-hidden="true">
            تصفح الفئات الأكثر طلباً
          </span>
          <span>
            {t("home:popular_categories", "تصفح الفئات الأكثر طلباً")}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full px-0 sm:px-2">
          {categories.map((category) => (
            <div key={category.id} className="group relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:scale-105">
              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageFallback
                    src={category.image}
                    srcSet={getImageSrcSet(category.image)}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 332px"
                    alt={category.alt}
                    className="w-full h-full object-cover"
                    width={332}
                    height={248}
                    quality={75} // Optimize quality for WebP
                    loading="lazy"
                    decoding="async"
                    fallbackText={category.title}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-bold">
                  <span className="sr-only">{category.title}</span>
                  {category.title}
                </h3>
                <p className="text-sm opacity-90">
                  <span className="sr-only">{category.description}</span>
                  {category.description}
                </p>
              </div>
              <a
                href={category.href}
                className="absolute inset-0 z-0"
                aria-label={t('browse_category', 'تصفح {{category}}', { category: category.title })}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
