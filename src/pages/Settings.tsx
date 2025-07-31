import DeleteAccount from "@/components/settings/DeleteAccount";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PreferenceSettings from "@/components/settings/PreferenceSettings";
import { useSettings } from "@/contexts/SettingsContext";
import { Tab } from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
 
import { SEO } from "@/utils/seo";

// import SecuritySettings from "@/components/settings/SecuritySettings";

import { SettingsAPI } from "@/api/settings.api";
import { LanguageCode, ThemeType } from "@/types/enums";
import type {
  PreferenceSettings as PreferenceSettingsType,
  Settings as AppSettings,
} from "@/types/settings";

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
  const [isSaving, setIsSaving] = useState(false);

  // SEO Meta Tags
  const pageTitle = t("settings.meta_title", "الإعدادات - سمسار");
  const pageDescription = t(
    "settings.meta_description",
    "إدارة إعدادات حسابك الشخصي على منصة سمسار",
  );
  const pageKeywords = t(
    "settings.meta_keywords",
    "الإعدادات, الحساب, التفضيلات, الإشعارات, الأمان, سمسار",
  );
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [localSettings, setLocalSettings] = useState<AppSettings>({
    ...settings,
    preferences: settings?.preferences || {
      language: LanguageCode.AR,
      theme: ThemeType.LIGHT,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    security: settings?.security || {
      loginNotifications: true,
      securityQuestions: false,
    },
    notifications: settings?.notifications || {
      newInboxMessages: true,
      listingUpdates: true,
      loginNotifications: true,
    },
    privacy: settings?.privacy || {
      showPhone: true,
      showEmail: true,
      showOnlineStatus: true,
      allowMessaging: true,
      profileVisibility: "public" as const,
    },
  });
  const isRTL = i18n.language === "ar";

  const tabListRef = useRef<HTMLDivElement>(null);

  // Load settings on component mount
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await SettingsAPI.getSettings();
        if (response.status === 200) {
          const userSettings = response.data;
          if (userSettings) {
            const newSettings: AppSettings = {
              ...localSettings,
              notifications: {
                listingUpdates: Boolean(userSettings.notifications?.listingUpdates),
                newInboxMessages: Boolean(userSettings.notifications?.newInboxMessages),
                loginNotifications: Boolean(userSettings.notifications?.loginNotifications),
                newsletterSubscribed: Boolean(
                  userSettings.notifications?.newsletterSubscribed,
                ),
              },
              privacy: {
                showEmail: Boolean(userSettings.privacy?.showEmail),
                showPhone: Boolean(userSettings.privacy?.showPhone),
                showOnlineStatus: Boolean(userSettings.privacy?.showOnlineStatus),
                allowMessaging: Boolean(userSettings.privacy?.allowMessaging),
                profileVisibility: userSettings.privacy?.profileVisibility || "public",
              },
              preferences: localSettings?.preferences || {
                language: LanguageCode.AR, // Default to Arabic
                theme: ThemeType.LIGHT,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
              security: localSettings?.security || {
                loginNotifications: true,
                securityQuestions: false,
              },
            };
            setLocalSettings(newSettings);
            updateSettings(newSettings);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        setSaveStatus({ type: "error", message: "Failed to load settings" });
      }
    };
    fetchUserSettings();
  }, []);

  // Handle saving settings
  const handleSaveSettings = async () => {
    if (!localSettings) return;

    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    try {
      // Create a complete settings object with all required fields
      const settingsToSave: AppSettings = {
        ...localSettings,
        privacy: {
          showEmail: localSettings.privacy?.showEmail ?? true,
          showPhone: localSettings.privacy?.showPhone ?? true,
          showOnlineStatus: localSettings.privacy?.showOnlineStatus ?? true,
          allowMessaging: localSettings.privacy?.allowMessaging ?? true,
          profileVisibility: localSettings.privacy?.profileVisibility ?? "public",
        },
        preferences: {
          language: localSettings.preferences?.language || LanguageCode.AR,
          theme: localSettings.preferences?.theme || ThemeType.LIGHT,
          timezone:
            localSettings.preferences?.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        security: {
          loginNotifications:
            localSettings.security?.loginNotifications ?? true,
          securityQuestions: localSettings.security?.securityQuestions ?? false,
          twoFactorEnabled: localSettings.security?.twoFactorEnabled ?? false,
          autoLogoutTime: localSettings.security?.autoLogoutTime,
        },
      };

      const response = await SettingsAPI.updatePrivacySettings({
        showPhone: localSettings.privacy?.showPhone ?? true,
        showEmail: localSettings.privacy?.showEmail ?? true,
        showOnlineStatus: localSettings.privacy?.showOnlineStatus ?? true,
        allowMessaging: localSettings.privacy?.allowMessaging ?? true,
        profileVisibility: localSettings.privacy?.profileVisibility ?? "public",
      });
      if (response.error) {
        throw new Error(response.error);
      }

      // Update the settings in the context with the complete settings object
      updateSettings({
        ...settingsToSave,
        preferences: {
          language: settingsToSave.preferences.language,
          theme: settingsToSave.preferences.theme || ThemeType.LIGHT,
          timezone:
            settingsToSave.preferences.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        security: {
          loginNotifications:
            settingsToSave.security?.loginNotifications ?? true,
          securityQuestions:
            settingsToSave.security?.securityQuestions ?? false,
          ...settingsToSave.security,
        },
      });

      // Apply language change after successful save
      if (localSettings.preferences?.language) {
        const langCode =
          localSettings.preferences.language === LanguageCode.AR ? "ar" : "en";
        i18n.changeLanguage(langCode);
        localStorage.setItem("language", langCode);
        document.dir = langCode === "ar" ? "rtl" : "ltr";
      }

      setSaveStatus({ type: "success", message: t("saveSuccess") });
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus({ type: "error", message: t("saveError") });
    } finally {
      setIsSaving(false);

      // Clear success message after 3 seconds
      if (saveStatus.type === "success") {
        setTimeout(() => {
          setSaveStatus({ type: null, message: "" });
        }, 3000);
      }
    }
  };

  const handlePreferenceUpdate = (preferences: PreferenceSettingsType) => {
    if (!localSettings) return;
    const newSettings: AppSettings = {
      ...localSettings,
      preferences,
      // Ensure all required fields are present
      privacy: localSettings.privacy || {
        profileVisibility: "public",
        showOnlineStatus: true,
        showPhone: false,
        showEmail: false,
        allowMessaging: true,
      },
      notifications: localSettings.notifications || {
        listingUpdates: false,
        newInboxMessages: false,
        loginNotifications: false,
      },
      security: localSettings.security || {
        loginNotifications: true,
        securityQuestions: false,
        twoFactorEnabled: false,
        autoLogoutTime: 30,
      },
    };
    setLocalSettings(newSettings);
  };

  // Security settings functionality can be implemented here when needed

  const handlePrivacyUpdate = (updates: Partial<SettingsState["privacy"]>) => {
    setLocalSettings((prev) => ({
      ...prev,
      privacy: {
        profileVisibility: updates.profileVisibility
          ? updates.profileVisibility === "private"
            ? "private"
            : "public"
          : prev.privacy?.profileVisibility || "public",
        showOnlineStatus:
          updates.showOnlineStatus ?? prev.privacy?.showOnlineStatus ?? true,
        showPhone: updates.showPhone ?? prev.privacy?.showPhone ?? false,
        showEmail: updates.showEmail ?? prev.privacy?.showEmail ?? false,
        allowMessaging:
          updates.allowMessaging ?? prev.privacy?.allowMessaging ?? true,
      },
    }));
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
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
      />
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
              <div className="relative">
                <div className="relative">
                  {/* Left scroll indicator - removed as per user request */}
                  <div
                    ref={tabListRef}
                    className="overflow-x-auto pb-1 scrollbar-hide tab-scroll-container"
                  >
                    <Tab.List className="flex space-x-1 w-max min-w-full border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-2">
                      {tabs.map((tab) => (
                        <Tab
                          key={tab.name}
                          className={({ selected }) =>
                            `flex-shrink-0 py-3 px-4 text-center focus:outline-none transition-colors duration-200 ${
                              selected
                                ? "border-b-2 border-indigo-500 font-medium text-indigo-600 dark:text-white"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                            }`
                          }
                        >
                          <div className="flex flex-col items-center justify-center space-y-1 min-w-[70px]">
                            <span className="text-xl">{tab.icon}</span>
                            <span className="text-xs sm:text-sm whitespace-nowrap">
                              {tab.name}
                            </span>
                          </div>
                        </Tab>
                      ))}
                    </Tab.List>
                  </div>
                  {/* Right scroll indicator - removed as per user request */}
                </div>
                {/* Fade effect on the right side for mobile */}
                <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-gray-50 to-transparent dark:from-gray-800 pointer-events-none"></div>
              </div>

              <Tab.Panels>
                {/* Preferences Panel */}
                <Tab.Panel className="p-6">
                  <PreferenceSettings
                    settings={
                      localSettings?.preferences || {
                        language: LanguageCode.AR,
                        theme: ThemeType.LIGHT,
                        timezone:
                          Intl.DateTimeFormat().resolvedOptions().timeZone,
                      }
                    }
                    onUpdate={handlePreferenceUpdate}
                    isRTL={isRTL}
                  />
                  <div className="mt-6 flex justify-between items-center">
                    {saveStatus.type && (
                      <div
                        className={`text-sm ${saveStatus.type === "success" ? "text-green-600" : "text-red-600"}`}
                      >
                        {saveStatus.message}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        isSaving
                          ? "bg-green-400"
                          : "bg-green-600 hover:bg-green-700"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                    >
                      {isSaving ? t("saving") : t("save")}
                    </button>
                  </div>
                </Tab.Panel>

                {/* Notifications Panel */}
                <Tab.Panel className="p-6">
                  <NotificationSettings
                    notifications={
                      localSettings?.notifications || {
                        newInboxMessages: true,
                        listingUpdates: true,
                        loginNotifications: true,
                        newsletterSubscribed: false,
                        email: true,
                        push: true,
                        message: true,
                        generalUpdates: true,
                        orderUpdates: true,
                        enabledTypes: ["message", "listing"],
                      }
                    }
                    onUpdate={(notifications) => {
                      const newSettings = { ...localSettings, notifications };
                      setLocalSettings(newSettings);
                    }}
                  />
                  <div className="mt-6 flex justify-between items-center">
                    {saveStatus.type && (
                      <div
                        className={`text-sm ${saveStatus.type === "success" ? "text-green-600" : "text-red-600"}`}
                      >
                        {saveStatus.message}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        isSaving
                          ? "bg-green-400"
                          : "bg-green-600 hover:bg-green-700"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                    >
                      {isSaving ? t("saving") : t("save")}
                    </button>
                  </div>
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
                            <option value="public">
                              {t("privacy.public")}
                            </option>
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
                          checked={
                            localSettings?.privacy?.showOnlineStatus ?? true
                          }
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
                          checked={localSettings?.privacy?.showPhone ?? false}
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
                          checked={localSettings?.privacy?.showEmail ?? false}
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
                          checked={
                            localSettings?.privacy?.allowMessaging ?? true
                          }
                          onChange={(checked: boolean) =>
                            handlePrivacyUpdate({ allowMessaging: checked })
                          }
                          label=""
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                      {saveStatus.type && (
                        <div
                          className={`text-sm ${saveStatus.type === "success" ? "text-green-600" : "text-red-600"}`}
                        >
                          {saveStatus.message}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          isSaving
                            ? "bg-green-400"
                            : "bg-green-600 hover:bg-green-700"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                      >
                        {isSaving ? t("saving") : t("save")}
                      </button>
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
    </>
  );
}

export default Settings;