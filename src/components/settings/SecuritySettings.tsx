import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { SecuritySettings as SecuritySettingsType } from "@/types/settings";

interface Props {
  settings: Partial<SecuritySettingsType>;
  onUpdate: (settings: SecuritySettingsType) => void;
  isRTL: boolean;
}

// Default settings to handle undefined properties
const defaultSettings: SecuritySettingsType = {
  twoFactorEnabled: false,
  loginNotifications: false,
  securityQuestions: false,
  twoFactorMethod: "email",
  autoLogoutTime: 1440, // 24 hours instead of 24 minutes
  loginActivity: [],
};

function SecuritySettings({ settings = {}, onUpdate, isRTL }: Props) {
  const { t } = useTranslation("settings");

  // Merge provided settings with defaults to ensure no missing properties
  const mergedSettings = { ...defaultSettings, ...settings };

  const handleSecurityChange = useCallback(
    (key: keyof SecuritySettingsType, value: any) => {
      onUpdate({
        ...mergedSettings,
        [key]: value,
      });
    },
    [mergedSettings, onUpdate],
  );

  return (
    <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`}>
      <div>
        <h3 className="text-lg font-medium">{t("security.twoFactorAuth")}</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="twoFactorEnabled"
                type="checkbox"
                checked={mergedSettings.twoFactorEnabled}
                onChange={(e) =>
                  handleSecurityChange("twoFactorEnabled", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
              <label
                htmlFor="twoFactorEnabled"
                className="font-medium text-gray-700"
              >
                {t("security.enableTwoFactorAuth")}
              </label>
              <p className="text-gray-500">
                {t("security.twoFactorDescription")}
              </p>
            </div>
          </div>

          {mergedSettings.twoFactorEnabled && (
            <div>
              <label
                htmlFor="twoFactorMethod"
                className="block text-sm font-medium text-gray-700"
              >
                {t("security.authMethod")}
              </label>
              <select
                id="twoFactorMethod"
                value={mergedSettings.twoFactorMethod || "email"}
                onChange={(e) =>
                  handleSecurityChange("twoFactorMethod", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="email">{t("security.email")}</option>
                <option value="authenticator">
                  {t("security.authenticatorApp")}
                </option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">
          {t("security.loginNotifications")}
        </h3>
        <div className="mt-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="loginNotifications"
                type="checkbox"
                checked={mergedSettings.loginNotifications}
                onChange={(e) =>
                  handleSecurityChange("loginNotifications", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
              <label
                htmlFor="loginNotifications"
                className="font-medium text-gray-700"
              >
                {t("security.enableLoginNotifications")}
              </label>
              <p className="text-gray-500">
                {t("security.loginNotificationsDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">{t("security.autoLogout")}</h3>
        <div className="mt-4">
          <label
            htmlFor="autoLogoutTime"
            className="block text-sm font-medium text-gray-700"
          >
            {t("security.autoLogoutTime")}
          </label>
          <input
            type="number"
            id="autoLogoutTime"
            value={mergedSettings.autoLogoutTime || 1440}
            onChange={(e) =>
              handleSecurityChange(
                "autoLogoutTime",
                parseInt(e.target.value, 10),
              )
            }
            min="1"
            max="1440"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Only render login activity if there's data */}
      {mergedSettings.loginActivity &&
        mergedSettings.loginActivity.length > 0 && (
          <div>
            <h3 className="text-lg font-medium">
              {t("settings.recentLoginActivity")}
            </h3>
            <div className="mt-4">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className={`px-3 py-3.5 text-${isRTL ? "right" : "left"} text-sm font-semibold text-gray-900`}
                      >
                        {t("settings.date")}
                      </th>
                      <th
                        scope="col"
                        className={`px-3 py-3.5 text-${isRTL ? "right" : "left"} text-sm font-semibold text-gray-900`}
                      >
                        {t("settings.device")}
                      </th>
                      <th
                        scope="col"
                        className={`px-3 py-3.5 text-${isRTL ? "right" : "left"} text-sm font-semibold text-gray-900`}
                      >
                        {t("settings.location")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {mergedSettings.loginActivity.map((activity, index) => (
                      <tr key={index}>
                        <td
                          className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-${isRTL ? "right" : "left"}`}
                        >
                          {activity.date}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-${isRTL ? "right" : "left"}`}
                        >
                          {activity.device}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-${isRTL ? "right" : "left"}`}
                        >
                          {activity.location}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default SecuritySettings;
