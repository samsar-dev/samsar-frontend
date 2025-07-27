import React from 'react';
import { useTranslation } from 'react-i18next';

interface FAQItemProps {
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
  answerFallback: string;
}

const FAQItem: React.FC<FAQItemProps> = ({
  question,
  questionAr,
  answer,
  answerAr,
  answerFallback,
}) => {
  const { t } = useTranslation();

  return (
    <details className="group border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
      <summary className="flex justify-between items-center font-medium text-gray-900 dark:text-white cursor-pointer list-none">
        <span>
          <span className="hidden" aria-hidden="true">{questionAr}</span>
          {t(question, questionAr)}
        </span>
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
        <span className="hidden" aria-hidden="true">{answerAr}</span>
        {t(answer, answerAr) || answerFallback}
      </p>
    </details>
  );
};

const FAQ: React.FC = () => {
  const { t } = useTranslation();

  const faqItems = [
    {
      question: "home:faq.how_to_list",
      questionAr: "كيف يمكنني إضافة إعلان على سمسار؟",
      answer: "home:faq.how_to_list_answer",
      answerAr: "انقر على زر 'أضف إعلان' في الأعلى، املأ التفاصيل المطلوبة، وأضف الصور ثم انشر إعلانك. سنقوم بمراجعته والتأكيد خلال 24 ساعة.",
      answerFallback: "انقر على زر 'أضف إعلان' في الأعلى، املأ التفاصيل المطلوبة، وأضف الصور ثم انشر إعلانك. سنقوم بمراجعته والتأكيد خلال 24 ساعة.",
    },
    {
      question: "home:faq.payment_methods",
      questionAr: "ما هي طرق الدفع المتاحة؟",
      answer: "home:faq.payment_methods_answer",
      answerAr: "نقبل الدفع عبر البطاقات البنكية، المحافظ الإلكترونية، والتحويلات البنكية. جميع المعاملات مؤمنة بنسبة 100%.",
      answerFallback: "نقبل الدفع عبر البطاقات البنكية، المحافظ الإلكترونية، والتحويلات البنكية. جميع المعاملات مؤمنة بنسبة 100%.",
    },
    {
      question: "home:faq.verification",
      questionAr: "كيف يتم التحقق من صحة الإعلانات؟",
      answer: "home:faq.verification_answer",
      answerAr: "يخضع كل إعلان لمراجعة من قبل فريقنا للتأكد من دقة المعلومات والتأكد من هوية المعلن.",
      answerFallback: "يخضع كل إعلان لمراجعة من قبل فريقنا للتأكد من دقة المعلومات والتأكد من هوية المعلن.",
    },
    {
      question: "home:faq.contact_support",
      questionAr: "كيف يمكنني التواصل مع خدمة العملاء؟",
      answer: "home:faq.contact_support_answer",
      answerAr: "يمكنك التواصل معنا عبر الدردشة المباشرة، البريد الإلكتروني، أو الاتصال بنا على الرقم 123456789. نحن متواجدون على مدار الساعة.",
      answerFallback: "يمكنك التواصل معنا عبر الدردشة المباشرة، البريد الإلكتروني، أو الاتصال بنا على الرقم 123456789. نحن متواجدون على مدار الساعة.",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        <span className="hidden" aria-hidden="true">
          أسئلة شائعة
        </span>
        {t("home:faq.title", "أسئلة شائعة")}
      </h3>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <FAQItem key={index} {...item} />
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200">
          <span className="hidden" aria-hidden="true">
            هل تحتاج إلى مساعدة؟
          </span>
          <span>{t("home:help.title", "هل تحتاج إلى مساعدة؟")}</span>
        </h4>
        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
          <span className="hidden" aria-hidden="true">
            فريق الدعم لدينا متاح على مدار الساعة للإجابة على
            استفساراتك.
          </span>
          <span>
            {t(
              "home:help.description",
              "فريق الدعم لدينا متاح على مدار الساعة للإجابة على استفساراتك.",
            )}
          </span>
        </p>
        <button className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <span className="hidden" aria-hidden="true">
            تواصل مع الدعم
          </span>
          <span>{t("home:help.contact_button", "تواصل مع الدعم")}</span>
        </button>

        {/* Social Sharing Buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t("share_with_friends", "شارك مع الأصدقاء")}:
          </p>
          <div className="flex space-x-3 rtl:space-x-reverse">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              aria-label={t("share_on_facebook", "مشاركة على فيسبوك")}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(t('meta_title', 'سمسار | سوق السيارات والعقارات الأول في سوريا'))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-blue-400 text-white hover:bg-blue-500 transition-colors"
              aria-label={t("share_on_twitter", "مشاركة على تويتر")}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              href={`whatsapp://send?text=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
              aria-label={t("share_on_whatsapp", "مشاركة على واتساب")}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.963-.94 1.16-.173.199-.347.222-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.136-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.345m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.55 4.142 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.723 1.467h.005c6.554 0 11.89-5.335 11.89-11.893 0-3.18-1.26-6.19-3.548-8.465" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
