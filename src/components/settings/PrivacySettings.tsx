import React from "react";
import { FaUserShield } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import type { PrivacySettings as PrivacySettingsType } from "@/types/settings";

interface Props {
  settings: PrivacySettingsType;
  onUpdate: (settings: PrivacySettingsType) => void;
  isRTL: boolean;
}

const PrivacySettings: React.FC<Props> = ({ settings, onUpdate, isRTL }) => {
  const { t } = useTranslation();

  const handleChange = (field: keyof PrivacySettingsType) => (value: any) => {
    onUpdate({
      ...settings,
      [field]: value,
    });
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${isRTL ? "rtl" : "ltr"}`}
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <FaUserShield className={`${isRTL ? "ml-2" : "mr-2"}`} />
        {t("privacy_settings")}
      </h2>

      {/* Profile Visibility */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">{t("profile_visibility")}</h3>
        <select
          value={settings.profileVisibility}
          onChange={(e) =>
            handleChange("profileVisibility")(
              e.target.value as PrivacySettingsType["profileVisibility"],
            )
          }
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="public">{t("public")}</option>
          <option value="private">{t("private")}</option>
          <option value="contacts">{t("contacts")}</option>
        </select>
      </div>

      {/* Show Email */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span>{t("show_email")}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showEmail}
              onChange={(e) => handleChange("showEmail")(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Show Phone */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span>{t("show_phone")}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showPhone}
              onChange={(e) => handleChange("showPhone")(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Allow Messaging */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span>{t("allow_messaging")}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowMessaging}
              onChange={(e) => handleChange("allowMessaging")(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
