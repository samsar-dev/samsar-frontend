import { useTranslation } from "react-i18next";
import { LanguageCode, ThemeType } from "@/types/enums";
import type { PreferenceSettings as PreferenceSettingsType } from "@/types/settings";

const SUPPORTED_LANGUAGES = [
  { code: LanguageCode.EN, label: "English" },
  { code: LanguageCode.AR, label: "العربية" },
];

const SUPPORTED_THEMES = [
  { value: ThemeType.LIGHT, label: "Light" },
  { value: ThemeType.DARK, label: "Dark" },
  { value: ThemeType.SYSTEM, label: "System" },
];

interface Props {
  settings: PreferenceSettingsType;
  onUpdate: (settings: PreferenceSettingsType) => void;
  isRTL?: boolean;
}

const defaultSettings: PreferenceSettingsType = {
  language: LanguageCode.EN,
  theme: ThemeType.SYSTEM,
  timezone: "UTC",
};

function PreferenceSettings({
  settings = defaultSettings,
  onUpdate,
  isRTL = false,
}: Props) {
  const { t } = useTranslation("settings");
  const currentSettings = { ...defaultSettings, ...settings };

  const handleChange = (key: keyof PreferenceSettingsType, value: any) => {
    const newSettings = {
      ...currentSettings,
      [key]: value,
    };

    // If language is changed, update i18n and save to localStorage
    if (key === "language") {
      // Convert to lowercase for storage and i18n
      const langCode = value === LanguageCode.AR ? "AR" : "en";
      localStorage.setItem("language", langCode);
      import("i18next").then((i18n) => {
        i18n.changeLanguage(langCode);
      });
    }

    onUpdate(newSettings);
  };

  const timezones = ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"];

  return (
    <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`}>
      <div>
        <h3 className="text-lg font-medium">{t("language")}</h3>
        <select
          value={currentSettings.language}
          onChange={(e) =>
            handleChange("language", e.target.value as LanguageCode)
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-lg font-medium">{t("themes.title")}</h3>
        <select
          value={currentSettings.theme}
          onChange={(e) => handleChange("theme", e.target.value as ThemeType)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {SUPPORTED_THEMES.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {t(`themes.${theme.value.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-lg font-medium">{t("timezone")}</h3>
        <select
          value={currentSettings.timezone}
          onChange={(e) => handleChange("timezone", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {timezones.map((timezone) => (
            <option key={timezone} value={timezone}>
              {timezone}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default PreferenceSettings;
