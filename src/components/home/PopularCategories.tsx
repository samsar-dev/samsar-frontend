import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageFallback from '@/components/media/ImageFallback';

const PopularCategories = () => {
  const { t } = useTranslation();



  const categories = [
    {
      id: 'cars',
      title: t('home:categories.cars', 'سيارات'),
      description: t('home:categories.cars_desc', 'أحدث الموديلات والماركات'),
      image: 'https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/vehicles-cars-bmw.webp',
      srcSet: 'https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/vehicles-cars-bmw.webp 300w, https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/vehicles-cars-bmw.webp 450w, https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/vehicles-cars-bmw.webp 600w',
      href: '/listings?category=vehicles&subCategory=CAR',
      alt: t('home:categories.cars', 'سيارات'),
      width: 300,
      height: 184,
    },
    {
      id: 'real_estate',
      title: t('home:categories.real_estate', 'عقارات'),
      description: t('home:categories.real_estate_desc', 'شقق، فلل، محلات تجارية'),
      image: 'https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/realestate-building.webp',
      srcSet: 'https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/realestate-building.webp 300w, https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/realestate-building.webp 450w, https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/realestate-building.webp 600w',
      href: '/listings?category=real_estate',
      alt: t('home:categories.real_estate', 'عقارات'),
      width: 300,
      height: 184,
    },
    {
      id: 'motorcycles',
      title: t('home:categories.motorcycles', 'دراجات نارية'),
      description: t('home:categories.motorcycles_desc', 'أحدث الموديلات بأسعار منافسة'),
      image: 'https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/vehicles-motorcycle.webp',
      srcSet: 'https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/vehicles-motorcycle.webp 300w, https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/vehicles-motorcycle.webp 450w, https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/vehicles-motorcycle.webp 600w',
      href: '/listings?category=vehicles&subCategory=MOTORCYCLE',
      alt: t('home:categories.motorcycles', 'دراجات نارية'),
      width: 300,
      height: 184,
    },
    {
      id: 'commercial',
      title: t('home:categories.commercial', 'تجاري'),
      description: t('home:categories.commercial_desc', 'محلات ومكاتب تجارية'),
      image: 'https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/property-office.webp',
      srcSet: 'https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/property-office.webp 300w, https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/property-office.webp 450w, https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/property-office.webp 600w',
      href: '/listings?category=real_estate&subCategory=COMMERCIAL',
      alt: t('home:categories.commercial', 'تجاري'),
      width: 300,
      height: 184,
    },
    {
      id: 'trucks',
      title: t('home:categories.trucks', 'شاحنات'),
      description: t('home:categories.trucks_desc', 'شاحنات ثقيلة وخفيفة'),
      image: 'https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/realestate-building.webp',
      srcSet: 'https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/realestate-building.webp 300w, https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/realestate-building.webp 450w, https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories/realestate-building.webp 600w',
      href: '/listings?category=vehicles&subCategory=TRUCK',
      alt: t('home:categories.trucks', 'شاحنات'),
      width: 300,
      height: 184,
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
                    srcSet={category.srcSet}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 332px"
                    alt={category.alt}
                    className="w-full h-full object-cover"
                    width={300}
                    height={184}
                    quality={75}
                    loading="lazy"
                    decoding="async"
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
