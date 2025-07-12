import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer: React.FC = () => {
  const { t } = useTranslation("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-secondary dark:bg-surface-secondary-dark border-t border-border-primary dark:border-border-primary-dark">
      <div className="container mx-auto px-4 py-8">
        {/* SEO Rich Text - Only visible to search engines */}
        <div className="sr-only">
          <h2>
            <span aria-hidden="true" className="hidden">منصة سمسار | سوق السيارات والعقارات الأول في سوريا</span>
            <span lang="ar" className="inline">{t('seo_title', 'Simsar | The First Car and Real Estate Market in Syria')}</span>
          </h2>
          <p>
            <span aria-hidden="true" className="hidden">بيع وشراء سيارات، عقارات، دراجات نارية، ومحلات تجارية في سوريا | إعلانات موثوقة ومجانية</span>
            <span lang="ar" className="inline">{t('seo_description', 'Buy and sell cars, real estate, motorcycles, and commercial properties in Syria | Trusted and free ads')}</span>
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              <span aria-hidden="true" className="hidden">روابط سريعة</span>
              <span lang="ar" className="inline">{t('quick_links', 'روابط سريعة')}</span>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                  aria-label={t("about_marketplace", "عن السوق")}
                  tabIndex={0}
                >
                <span aria-hidden="true" className="hidden">عن السوق</span>
                <span lang="ar" className="inline">{t('links.about', 'عن السوق')}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                  aria-label={t("contact_us", "Contact Us")}
                  tabIndex={0}
                >
                <span aria-hidden="true" className="hidden">اتصل بنا</span>
                <span lang="ar" className="inline">{t('contact_us', 'اتصل بنا')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              <span aria-hidden="true" className="hidden">الخصوصية</span>
              <span lang="ar" className="inline">{t('privacy', 'الخصوصية')}</span>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                  aria-label={t("privacy_policy.title", "Privacy Policy")}
                  tabIndex={0}
                >
                  <span aria-hidden="true" className="hidden">سياسة الخصوصية</span>
                  <span lang="ar" className="inline">{t('privacy_policy.title', 'سياسة الخصوصية')}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                >
                <span aria-hidden="true" className="hidden">شروط الخدمة</span>
                <span lang="ar" className="inline">{t('terms_of_service', 'شروط الخدمة')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              <span aria-hidden="true" className="hidden">الأقسام</span>
              <span lang="ar" className="inline">{t('categories', 'الأقسام')}</span>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/vehicles"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                >
                <span aria-hidden="true" className="hidden">المركبات</span>
                <span lang="ar" className="inline">{t('vehicles', 'المركبات')}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/real-estate"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                >
                <span aria-hidden="true" className="hidden">العقارات</span>
                <span lang="ar" className="inline">{t('real_estate', 'العقارات')}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              <span aria-hidden="true" className="hidden">اتصل بنا</span>
              <span lang="ar" className="inline">{t('follow_us', 'اتصل بنا')}</span>
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                aria-label="Facebook"
                role="link"
                tabIndex={0}
              >
                <span aria-hidden="true" className="hidden">فيسبوك</span>
                <span lang="ar" className="inline"><FaFacebook className="w-6 h-6 inline" /></span>
              </a>
              <a
                href="#"
                className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                aria-label="Twitter"
                role="link"
                tabIndex={0}
              >
                <span aria-hidden="true" className="hidden">تويتر</span>
                <span lang="ar" className="inline"><FaTwitter className="w-6 h-6 inline" /></span>
              </a>
              <a
                href="#"
                className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                aria-label="Instagram"
                role="link"
                tabIndex={0}
              >
                <span aria-hidden="true" className="hidden">انستغرام</span>
                <span lang="ar" className="inline"><FaInstagram className="w-6 h-6 inline" /></span>
              </a>
              <a
                href="#"
                className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                aria-label="LinkedIn"
                role="link"
                tabIndex={0}
              >
                <span aria-hidden="true" className="hidden">لينكد إن</span>
                <span lang="ar" className="inline"><FaLinkedin className="w-6 h-6 inline" /></span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border-primary dark:border-border-primary-dark pt-6 mt-8">
          <div className="text-center text-sm text-text-secondary dark:text-text-secondary-dark">
            <p className="mb-2">
              {currentYear} &copy; <span aria-hidden="true" className="hidden">منصة سمسار. جميع الحقوق محفوظة.</span>
              <span lang="ar" className="inline">{t('copyright', 'منصة سمسار. جميع الحقوق محفوظة.')}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span aria-hidden="true" className="hidden">منصة سمسار - بيع وشراء سيارات، عقارات، دراجات نارية، ومحلات تجارية في سوريا | إعلانات موثوقة ومجانية</span>
              <span lang="ar" className="inline">{t('seo_text', 'Simsar - Buy and sell cars, real estate, motorcycles, and commercial properties in Syria | Trusted and free ads')}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
