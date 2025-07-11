import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-secondary dark:bg-surface-secondary-dark border-t border-border-primary dark:border-border-primary-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              {t("footer.quick_links", "Quick Links")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                  aria-label={t("footer.about_marketplace", "About Marketplace")}
                  tabIndex={0}
                >
                  {t("footer.about_marketplace", "About Marketplace")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                  aria-label={t("footer.contact_us", "Contact Us")}
                  tabIndex={0}
                >
                  {t("footer.contact_us", "Contact Us")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              {t("footer.privacy", "Privacy")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                  aria-label={t("footer.privacy_policy.title", "Privacy Policy")}
                  tabIndex={0}
                >
                  {t("footer.privacy_policy.title", "Privacy Policy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                >
                  {t("footer.terms.title", "Terms of Service")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              {t("footer.categories", "Categories")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/vehicles"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                >
                  {t("navigation.vehicles", "Vehicles")}
                </Link>
              </li>
              <li>
                <Link
                  to="/real-estate"
                  className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                >
                  {t("navigation.real_estate", "Real Estate")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
              {t("footer.contact_us", "Contact Us")}
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                aria-label="Facebook"
                role="link"
                tabIndex={0}
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                aria-label="Twitter"
                role="link"
                tabIndex={0}
              >
                <FaTwitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                aria-label="Instagram"
                role="link"
                tabIndex={0}
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-text-secondary dark:text-text-secondary-dark hover:text-accent-blue dark:hover:text-accent-blue-dark"
                aria-label="LinkedIn"
                role="link"
                tabIndex={0}
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border-primary dark:border-border-primary-dark">
          <p className="text-center text-text-muted dark:text-text-muted-dark">
            &copy; {currentYear} Samsar.{" "}
            {t("footer.all_rights_reserved", "All rights reserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
