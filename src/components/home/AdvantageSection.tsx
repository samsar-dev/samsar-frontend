import React from 'react';
import { useTranslation } from 'react-i18next';

const advantages = [
  {
    icon: '💸',
    title: 'home:advantage.commission_free.title',
    titleAr: 'بيع وشراء بدون عمولة',
    description: 'home:advantage.commission_free.description',
    descriptionAr: 'تواصل مباشر مع البائع أو المشتري بدون أي وسيط أو تكاليف إضافية',
    color: 'from-blue-500 to-sky-600',
  },
  {
    icon: '🛡️',
    title: 'home:advantage.verified.title',
    titleAr: 'عروض موثقة',
    description: 'home:advantage.verified.description',
    descriptionAr: 'جميع الإعلانات خاضعة للتدقيق والتحقق من صحتها',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: '🚀',
    title: 'home:advantage.fast.title',
    titleAr: 'تجربة سلسة',
    description: 'home:advantage.fast.description',
    descriptionAr: 'تصفح سريع وسهل مع واجهة بسيطة وبديهية',
    color: 'from-purple-500 to-fuchsia-600',
  },
];

const AdvantageSection: React.FC = () => {
  const { t } = useTranslation('home');

  return (
    <div className="space-y-6">
      {advantages.map((item, index) => (
        <div
          key={index}
          className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div
            className={`absolute -inset-0.5 bg-gradient-to-r ${item.color} rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300`}
          ></div>
          <div className="relative flex items-start space-x-4 rtl:space-x-reverse">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-2xl">
              {item.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t(item.title, item.titleAr)}
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                {t(item.description, item.descriptionAr)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdvantageSection;
