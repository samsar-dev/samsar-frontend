import React from "react";
import { useTranslation } from "react-i18next";
import { LanguageCode } from "@/types/enums";

interface Props {
  settings: {
    language: LanguageCode;
  };
  onUpdate: (settings: { language: LanguageCode }) => void;
  isRTL: boolean;
}

const LanguageSettings: React.FC<Props> = ({ settings, onUpdate, isRTL }) => {
  const { t } = useTranslation();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value as LanguageCode;
    onUpdate({ language: newLang });
    localStorage.setItem("language", newLang);
    document.dir = newLang === LanguageCode.AR ? "rtl" : "ltr";
  };

  return (
    <div className={`space-y-4 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="flex flex-col">
        <label
          htmlFor="language"
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {t("settings.language")}
        </label>
        <select
          id="language"
          value={settings.language}
          onChange={handleLanguageChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600"
        >
          <option value={LanguageCode.EN}>{t("common.english")}</option>
          <option value={LanguageCode.AR}>{t("common.arabic")}</option>
        </select>
      </div>
    </div>
  );
};

export default LanguageSettings;
