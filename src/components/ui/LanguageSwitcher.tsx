import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
    document.dir = language === "ar" ? "rtl" : "ltr";
  };

  return (
    <div className="flex space-x-2 rtl:space-x-reverse">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-3 py-1 rounded transition-colors ${
          i18n.language === "en"
            ? "bg-primary text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        {t("common.english")}
      </button>
      <button
        onClick={() => changeLanguage("ar")}
        className={`px-3 py-1 rounded transition-colors ${
          i18n.language === "ar"
            ? "bg-primary text-white"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        {t("common.arabic")}
      </button>
    </div>
  );
};

export default LanguageSwitcher;
