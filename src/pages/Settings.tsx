import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import PreferenceSettings from "@/components/settings/PreferenceSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import DeleteAccount from "@/components/settings/DeleteAccount";
import { Tab } from "@headlessui/react";
// import SecuritySettings from "@/components/settings/SecuritySettings";

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
  const [debouncedToggles, setDebouncedToggles] = useState(settings);
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedToggles(settings);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [settings]);

  useEffect(() => {
    const sendUpdateSettingsToServer = async () => {
      try {
        const response = await SettingsAPI.updatePrivacySettings(settings);
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

  // Define the tabs for the settings page
  const tabs = [
    { name: t("preferences"), icon: "⚙️" },
    { name: t("notifications.title"), icon: "🔔" },
    // { name: t("security.title"), icon: "🔐" },
    { name: t("privacy.title"), icon: "🔒" },
    { name: t("connectedAccounts.title"), icon: "🔗" },
    { name: t("account.title"), icon: "👤" },
  ];

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isRTL ? "rtl" : "ltr"} bg-gray-50 dark:bg-gray-900`}
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t("settingsDescription")}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800">
          <Tab.Group>
            <Tab.List className="flex border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `flex-1 py-4 px-1 text-center focus:outline-none ${
                      selected
                        ? "border-b-2 border-indigo-500 font-medium text-indigo-600 dark:text-white"
                        : "text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600"
                    }`
                  }
                >
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.name}</span>
                  </div>
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              {/* Preferences Panel */}
              <Tab.Panel className="p-6">
                <PreferenceSettings
                  settings={settings?.preferences || {}}
                  onUpdate={handlePreferenceUpdate}
                  isRTL={isRTL}
                />
              </Tab.Panel>

              {/* Notifications Panel */}
              <Tab.Panel className="p-6">
                <NotificationSettings
                  notifications={settings.notifications}
                  onUpdate={(notifications) =>
                    updateSettings({ notifications })
                  }
                />
              </Tab.Panel>

              {/* Security Panel */}
              {/* <Tab.Panel className="p-6">
                <SecuritySettings
                  settings={settings?.security || {}}
                  onUpdate={handleSecurityUpdate}
                  isRTL={isRTL}
                />
              </Tab.Panel> */}

              {/* Privacy Panel */}
              <Tab.Panel className="p-6">
                <div className="space-y-6">
                  {/* Profile Visibility */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">
                      {t("privacy.profileVisibility")}
                    </h3>
                    <div className="pl-4">
                      <div className="flex items-center space-x-4">
                        <select
                          value={
                            settings?.privacy?.profileVisibility ?? "public"
                          }
                          onChange={(e) =>
                            handlePrivacyUpdate({
                              profileVisibility: e.target.value as
                                | "public"
                                | "private",
                            })
                          }
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="public">{t("privacy.public")}</option>
                          <option value="private">
                            {t("privacy.private")}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Show Online Status */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pl-4">
                      <span className="text-gray-600">
                        {t("privacy.showOnlineStatus")}
                      </span>
                      <Toggle
                        checked={settings?.privacy?.showOnlineStatus ?? true}
                        onChange={(checked: boolean) =>
                          handlePrivacyUpdate({ showOnlineStatus: checked })
                        }
                        label=""
                      />
                    </div>
                  </div>

                  {/* Show Phone Number */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pl-4">
                      <span className="text-gray-600">
                        {t("privacy.showPhoneNumber")}
                      </span>
                      <Toggle
                        checked={settings?.privacy?.showPhone ?? true}
                        onChange={(checked: boolean) =>
                          handlePrivacyUpdate({ showPhone: checked })
                        }
                        label=""
                      />
                    </div>
                  </div>

                  {/* Show Email */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pl-4">
                      <span className="text-gray-600">
                        {t("privacy.showEmail")}
                      </span>
                      <Toggle
                        checked={settings?.privacy?.showEmail ?? true}
                        onChange={(checked: boolean) =>
                          handlePrivacyUpdate({ showEmail: checked })
                        }
                        label=""
                      />
                    </div>
                  </div>

                  {/* Allow Direct Messaging */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pl-4">
                      <span className="text-gray-600">
                        {t("privacy.allowDirectMessaging")}
                      </span>
                      <Toggle
                        checked={settings?.privacy?.allowMessaging ?? true}
                        onChange={(checked: boolean) =>
                          handlePrivacyUpdate({ allowMessaging: checked })
                        }
                        label=""
                      />
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              {/* Connected Accounts Panel */}
              <Tab.Panel className="p-6">
                <div className="space-y-4">
                  {/* Google */}
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
                        G
                      </div>
                      <span className="font-medium">
                        {t("connectedAccounts.google")}
                      </span>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      {t("connectedAccounts.connect")}
                    </button>
                  </div>

                  {/* Facebook */}
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        f
                      </div>
                      <span className="font-medium">
                        {t("connectedAccounts.facebook")}
                      </span>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      {t("connectedAccounts.connect")}
                    </button>
                  </div>

                  {/* Twitter */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white">
                        t
                      </div>
                      <span className="font-medium">
                        {t("connectedAccounts.twitter")}
                      </span>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      {t("connectedAccounts.connect")}
                    </button>
                  </div>
                </div>
              </Tab.Panel>

              {/* Account Panel */}
              <Tab.Panel className="p-6">
                <DeleteAccount />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}

export default Settings;
