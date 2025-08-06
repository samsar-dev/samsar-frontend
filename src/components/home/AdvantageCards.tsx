import React from "react";
import { useTranslation } from "react-i18next";
import FAQ from "./FAQ";

interface AdvantageCardProps {
  icon: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  color: string;
}

const AdvantageCard: React.FC<AdvantageCardProps> = ({
  icon,
  title,
  titleAr,
  description,
  descriptionAr,
  color,
}) => {
  const { t } = useTranslation();

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300`}
      ></div>
      <div className="relative flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-2xl">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            <span className="hidden" aria-hidden="true">
              {titleAr}
            </span>
            {t(title, titleAr)}
          </h3>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            <span className="hidden" aria-hidden="true">
              {descriptionAr}
            </span>
            {t(description, descriptionAr)}
          </p>
        </div>
      </div>
    </div>
  );
};

const AdvantageCards: React.FC = () => {
  const { t } = useTranslation();

  const advantages = [
    {
      icon: "🔍",
      title: "home:advantage.real_time.title",
      titleAr: "عروض حصرية",
      description: "home:advantage.real_time.description",
      descriptionAr: "وصول حصري لأحدث العروض قبل غيرك مع تحديثات فورية",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: "🛡️",
      title: "home:advantage.verified.title",
      titleAr: "عروض موثقة",
      description: "home:advantage.verified.description",
      descriptionAr: "جميع الإعلانات خاضعة للتدقيق والتحقق من صحتها",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: "🚀",
      title: "home:advantage.fast.title",
      titleAr: "تجربة سلسة",
      description: "home:advantage.fast.description",
      descriptionAr: "تصفح سريع وسهل مع واجهة بسيطة وبديهية",
      color: "from-purple-500 to-fuchsia-600",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 w-full">
      <div className="w-full max-w-none lg:max-w-7xl lg:mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            <span className="hidden" aria-hidden="true">
              ميزات سمسار الفريدة
            </span>
            {t("home:advantage.title", "ميزات سمسار الفريدة")}
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 px-2">
            <span className="hidden" aria-hidden="true">
              اكتشف لماذا يختار آلاف العملاء منصة سمسار
            </span>
            {t(
              "home:advantage.subtitle",
              "اكتشف لماذا يختار آلاف العملاء منصة سمسار",
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full px-0 sm:px-2">
          <div className="space-y-6">
            {advantages.map((item, index) => (
              <AdvantageCard key={index} {...item} />
            ))}
          </div>
          <div className="sm:col-span-2">
            <FAQ />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvantageCards;
