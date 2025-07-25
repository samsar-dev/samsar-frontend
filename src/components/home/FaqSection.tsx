import React from 'react';
import { useTranslation } from 'react-i18next';

const faqs = [
  {
    question: 'home:faq.how_to_list',
    questionAr: 'كيف يمكنني إضافة إعلان على سمسار؟',
    answer: 'home:faq.how_to_list_answer',
    answerAr: 'انقر على زر \'أضف إعلان\' في الأعلى، املأ التفاصيل المطلوبة، وأضف الصور ثم انشر إعلانك. سنقوم بمراجعته والتأكيد خلال 24 ساعة.',
  },
  {
    question: 'home:faq.payment_methods',
    questionAr: 'ما هي طرق الدفع المتاحة؟',
    answer: 'home:faq.payment_methods_answer',
    answerAr: 'نقبل الدفع عبر البطاقات البنكية، المحافظ الإلكترونية، والتحويلات البنكية. جميع المعاملات مؤمنة بنسبة 100%.',
  },
  {
    question: 'home:faq.verification',
    questionAr: 'كيف يتم التحقق من صحة الإعلانات؟',
    answer: 'home:faq.verification_answer',
    answerAr: 'يخضع كل إعلان لمراجعة من قبل فريقنا للتأكد من دقة المعلومات والتأكد من هوية المعلن.',
  },
  {
    question: 'home:faq.contact_support',
    questionAr: 'كيف يمكنني التواصل مع خدمة العملاء؟',
    answer: 'home:faq.contact_support_answer',
    answerAr: 'يمكنك التواصل معنا عبر الدردشة المباشرة، البريد الإلكتروني، أو الاتصال بنا على الرقم 123456789. نحن متواجدون على مدار الساعة.',
  },
];

const FaqSection: React.FC = () => {
  const { t } = useTranslation('home');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('home:faq.title', 'أسئلة شائعة')}
      </h3>
      <div className="space-y-4">
        {faqs.map((item, index) => (
          <details
            key={index}
            className="group border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
          >
            <summary className="flex justify-between items-center font-medium text-gray-900 dark:text-white cursor-pointer list-none">
              <span>{t(item.question, item.questionAr)}</span>
              <span className="text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </summary>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {t(item.answer, item.answerAr)}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
};

export default FaqSection;
