import { useTranslation } from "react-i18next";
import ImageFallback from "@/components/media/ImageFallback";

const BASE_IMAGE_URL =
  "https://pub-92a0aba78d194578adc2e95b556f09be.r2.dev/categories";

const getOptimizedImageUrl = (
  imageName: string,
  width: number,
  quality = 75,
) => {
  return `${BASE_IMAGE_URL}/${imageName}?format=webp&width=${width}&quality=${quality}`;
};

const getImageSrcSet = (imageName: string) => {
  const widths = [332, 664, 996]; // 1x, 2x, 3x for a 332px display width
  return widths
    .map((w) => `${getOptimizedImageUrl(imageName, w)} ${w}w`)
    .join(", ");
};

const PopularCategories = () => {
  const { t } = useTranslation();

  const categories = [
    {
      id: "cars",
      title: t("home:categories.cars", "سيارات"),
      description: t("home:categories.cars_desc", "أحدث الموديلات والماركات"),
      imageName: "vehicles-cars-bmw.webp",
      href: "/listings?category=vehicles&subCategory=CAR",
      alt: t("home:categories.cars", "سيارات"),
    },
    {
      id: "real_estate",
      title: t("home:categories.real_estate", "عقارات"),
      description: t(
        "home:categories.real_estate_desc",
        "شقق، فلل، محلات تجارية",
      ),
      imageName: "realestate-building.webp",
      href: "/listings?category=real_estate",
      alt: t("home:categories.real_estate", "عقارات"),
    },
    {
      id: "motorcycles",
      title: t("home:categories.motorcycles", "دراجات نارية"),
      description: t(
        "home:categories.motorcycles_desc",
        "أحدث الموديلات بأسعار منافسة",
      ),
      imageName: "vehicles-motorcycle.webp",
      href: "/listings?category=vehicles&subCategory=MOTORCYCLE",
      alt: t("home:categories.motorcycles", "دراجات نارية"),
    },
    {
      id: "commercial",
      title: t("home:categories.commercial", "تجاري"),
      description: t("home:categories.commercial_desc", "محلات ومكاتب تجارية"),
      imageName: "property-office.webp",
      href: "/listings?category=real_estate&subCategory=COMMERCIAL",
      alt: t("home:categories.commercial", "تجاري"),
    },
  ];

  return (
    <section className="bg-gray-50 dark:bg-gray-900 w-full">
      <div className="w-full px-0 sm:px-2 md:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full px-0 sm:px-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageFallback
                    src={getOptimizedImageUrl(category.imageName, 332)}
                    srcSet={getImageSrcSet(category.imageName)}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 332px"
                    alt={category.alt}
                    className="w-full h-full object-cover"
                    width={332}
                    height={248} // Adjusted aspect ratio
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
                aria-label={t("browse_category", "تصفح {{category}}", {
                  category: category.title,
                })}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
