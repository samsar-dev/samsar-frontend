import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import PreferenceSettings from "@/components/settings/PreferenceSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import DeleteAccount from "@/components/settings/DeleteAccount";

import type {
  PreferenceSettings as PreferenceSettingsType,
  SecuritySettings as SecuritySettingsType,
} from "@/types/settings";
import { SettingsAPI } from "@/api";

interface ToggleProps {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled,
}) => (
  <label className="flex items-center space-x-3 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary disabled:opacity-50"
    />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </label>
);

interface SettingsState {
  notifications?: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private";
    showOnlineStatus: boolean;
    showPhone: boolean;
    showEmail: boolean;
    allowMessaging: boolean;
  };
}

function Settings() {
  const { t, i18n } = useTranslation("settings");
  const { settings, updateSettings } = useSettings();
  // debounce state
  const [debouncedToggles, setDebouncedToggles] = useState(settings);
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedToggles(settings);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [settings]);

  useEffect(() => {
    console.log("settings", settings);
    const sendUpdateSettingsToServer = async () => {
      try {
        const response = await SettingsAPI.updatePrivacySettings(settings);
        console.log("response", response);
        if (response.error) {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error(error);
      }
    };

    sendUpdateSettingsToServer();
  }, [debouncedToggles]);

  const handlePreferenceUpdate = (preferences: PreferenceSettingsType) => {
    updateSettings({ preferences });
  };

  const handleSecurityUpdate = (security: Partial<SecuritySettingsType>) => {
    if (!settings) return;
    updateSettings({
      security: {
        ...settings.security,
        ...security,
      },
    });
  };

  const handlePrivacyUpdate = (updates: Partial<SettingsState["privacy"]>) => {
    updateSettings({ privacy: { ...settings?.privacy, ...updates } });
  };

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isRTL ? "rtl" : "ltr"}`}
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-gray-600">{t("settingsDescription")}</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">{t("preferences")}</h2>
            <PreferenceSettings
              settings={settings?.preferences || {}}
              onUpdate={handlePreferenceUpdate}
              isRTL={isRTL}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("notifications.title")}
            </h2>
            <NotificationSettings
              notifications={
                settings?.notifications || {
                  email: false,
                  push: false,
                  desktop: false,
                }
              }
              onUpdate={(notifications) => updateSettings({ notifications })}
            />
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              🔐 {t("security.title")}
            </h2>
            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {t("security.twoFactorAuth")}
                </h3>
                <div className="flex items-center justify-between pl-4">
                  <span className="text-gray-600">
                    {t("security.twoFactorDescription")}
                  </span>
                  <Toggle
                    checked={settings?.security?.twoFactorEnabled ?? false}
                    onChange={(checked: boolean) =>
                      handleSecurityUpdate({ twoFactorEnabled: checked })
                    }
                    label={t("security.enableTwoFactorAuth")}
                  />
                </div>
              </div>

              {/* Login Notifications */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {t("security.loginNotifications")}
                </h3>
                <div className="flex items-center justify-between pl-4">
                  <span className="text-gray-600">
                    {t("security.loginNotificationsDescription")}
                  </span>
                  <Toggle
                    checked={settings?.security?.loginNotifications ?? false}
                    onChange={(checked: boolean) =>
                      handleSecurityUpdate({ loginNotifications: checked })
                    }
                    label={t("security.enableLoginNotifications")}
                  />
                </div>
              </div>

              {/* Auto Logout */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {t("security.autoLogout")}
                </h3>
                <div className="flex items-center justify-between pl-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">
                      {t("security.autoLogoutTime")}:
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="10080"
                      value={settings?.security?.autoLogoutMinutes ?? 1440}
                      onChange={(e) =>
                        handleSecurityUpdate({
                          autoLogoutMinutes: parseInt(e.target.value),
                        })
                      }
                      className="w-20 rounded-md border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                    <span className="text-gray-600">min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              🔗 {t("connectedAccounts.title")}
            </h2>
            <div className="space-y-6">
              {["google", "facebook", "twitter"].map((provider) => {
                const isConnected =
                  settings?.connectedAccounts?.[provider]?.connected || false;
                const isVisible =
                  settings?.connectedAccounts?.[provider]?.visible || false;
                const connectedAccounts = settings?.connectedAccounts || {};

                return (
                  <div
                    key={provider}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium capitalize">
                          {provider}
                        </span>
                        <span
                          className={`text-sm px-2 py-0.5 rounded-full ${isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                        >
                          {isConnected
                            ? t("connectedAccounts.connected")
                            : t("connectedAccounts.notConnected")}
                        </span>
                      </div>

                      {isConnected ? (
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {t("connectedAccounts.visibleOnProfile")}
                            </span>
                            <Toggle
                              checked={isVisible}
                              onChange={() => {
                                const updatedAccounts = {
                                  ...connectedAccounts,
                                  [provider]: {
                                    ...connectedAccounts[provider],
                                    visible: !isVisible,
                                  },
                                };
                                updateSettings({
                                  connectedAccounts: updatedAccounts,
                                });
                              }}
                              label=""
                            />
                          </div>
                          <button
                            onClick={() => {
                              const updatedAccounts = { ...connectedAccounts };
                              delete updatedAccounts[provider];
                              updateSettings({
                                connectedAccounts: updatedAccounts,
                              });
                            }}
                            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md border border-red-200 transition-colors"
                          >
                            {t("connectedAccounts.disconnect")}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            // Simulate connection
                            const updatedAccounts = {
                              ...connectedAccounts,
                              [provider]: {
                                connected: true,
                                visible: true,
                              },
                            };
                            updateSettings({
                              connectedAccounts: updatedAccounts,
                            });
                          }}
                          className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary-dark transition-colors"
                        >
                          {t("connectedAccounts.connectAccount")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              🔏 {t("privacy.title")}
            </h2>
            <div className="space-y-4">
              {/* Profile Visibility */}
              <div className="flex items-center justify-between">
                <span>{t("privacy.profileVisibility")}:</span>
                <select
                  value={settings?.privacy?.profileVisibility ?? "public"}
                  onChange={(e) =>
                    handlePrivacyUpdate({
                      profileVisibility: e.target.value as "public" | "private",
                    })
                  }
                  className="form-select rounded-md border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                >
                  <option value="public">{t("privacy.public")}</option>
                  <option value="private">{t("privacy.private")}</option>
                </select>
              </div>

              {/* Show Online Status */}
              <div className="flex items-center justify-between">
                <span>{t("privacy.showOnlineStatus")}:</span>
                <Toggle
                  checked={settings?.privacy?.showOnlineStatus ?? false}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ showOnlineStatus: checked })
                  }
                  label={t("privacy.showOnlineStatus")}
                />
              </div>

              {/* Show Phone Number */}
              <div className="flex items-center justify-between">
                <span>{t("privacy.showPhoneNumber")}:</span>
                <Toggle
                  checked={settings?.privacy?.showPhone ?? false}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ showPhone: checked })
                  }
                  label={t("privacy.showPhoneNumber")}
                />
              </div>

              {/* Allow Direct Messaging */}
              <div className="flex items-center justify-between">
                <span>{t("privacy.allowMessaging")}:</span>
                <Toggle
                  checked={settings?.privacy?.allowMessaging ?? false}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ allowMessaging: checked })
                  }
                  label={t("privacy.allowMessaging")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("account.deleteAccount")}
            </h2>
            <DeleteAccount />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
