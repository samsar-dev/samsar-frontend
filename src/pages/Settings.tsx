import { lazy, Suspense } from "react";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PreferenceSettings from "@/components/settings/PreferenceSettings";

const SecuritySettingsComponent = lazy(() => import("@/components/settings/SecuritySettings"));
const LanguageSettingsComponent = lazy(() => import("@/components/settings/LanguageSettings"));
const DeleteAccount = lazy(() => import("@/components/settings/DeleteAccount"));
const AccountSettings = lazy(() => import("@/components/settings/AccountSettings"));
import { useSettings } from "@/contexts/SettingsContext";
import { Tab } from "@headlessui/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { SEO } from "@/utils/seo";

import { SettingsAPI } from "@/api/settings.api";
import { LanguageCode, ThemeType } from "@/types/enums";
import type {
  PreferenceSettings as PreferenceSettingsType,
  Settings as AppSettings,
} from "@/types/settings";
import type { PrivacySettings as PrivacySettingsType } from "@/types/common";

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
        // Don't show error message on initial load, just log it
        console.warn("Using default settings due to load error");
        // Set default settings when load fails
        const defaultSettings: AppSettings = {
          notifications: {
            listingUpdates: false,
            newInboxMessages: false,
            loginNotifications: true,
            newsletterSubscribed: false,
          },
          privacy: {
            showEmail: true,
            showPhone: true,
            showOnlineStatus: true,
            allowMessaging: true,
            profileVisibility: "public",
          },
          preferences: {
            language: LanguageCode.AR,
            theme: ThemeType.LIGHT,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          security: {
            loginNotifications: true,
            securityQuestions: false,
            twoFactorEnabled: false,
            autoLogoutTime: 30,
          },
        };
        setLocalSettings(defaultSettings);
        updateSettings(defaultSettings);
      }
    };
    fetchUserSettings();
  }, []);

  // Handle saving settings
  const handleSaveSettings = async () => {
    if (!localSettings) return;

    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });

    let settingsToSave: AppSettings;
    try {
      // Create a complete settings object with all required fields
      settingsToSave = {
        ...localSettings,
        notifications: {
          listingUpdates: localSettings.notifications?.listingUpdates ?? false,
          newInboxMessages: localSettings.notifications?.newInboxMessages ?? false,
          loginNotifications: localSettings.notifications?.loginNotifications ?? true,
          ...localSettings.notifications,
        },
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
          autoLogoutTime: localSettings.security?.autoLogoutTime ?? 30,
        },
      };

      const response = await SettingsAPI.updateSettings(settingsToSave);
      if (!response || response.error) {
        throw new Error(response?.error || "Settings update failed");
      }
      
      // Ensure we have valid response data
      if (response.data) {
        // Update with server response to ensure consistency
        updateSettings(response.data);
        setLocalSettings(response.data);
      }

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
      console.error("Settings being sent:", JSON.stringify(settingsToSave, null, 2));
      const errorMessage = error instanceof Error ? error.message : "Save failed";
      setSaveStatus({ type: "error", message: `${t("saveError")}: ${errorMessage}` });
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

  const handleSecurityUpdate = (securitySettings: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        ...securitySettings,
      },
    }));
  };

  const handleLanguageUpdate = (languageSettings: any) => {
    const newSettings = {
      preferences: {
        ...localSettings.preferences,
        language: languageSettings.interfaceLanguage || localSettings.preferences?.language || LanguageCode.EN,
      },
    };
    setLocalSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handlePrivacyUpdate = (updates: Partial<SettingsState["privacy"]>) => {
    console.log('Settings: Privacy updates received', updates);
    setLocalSettings((prev) => {
      const newSettings = {
        ...prev,
        privacy: {
          profileVisibility: updates.profileVisibility ?? prev.privacy?.profileVisibility ?? "public",
          showOnlineStatus:
            updates.showOnlineStatus ?? prev.privacy?.showOnlineStatus ?? true,
          showPhone: updates.showPhone ?? prev.privacy?.showPhone ?? true,
          showEmail: updates.showEmail ?? prev.privacy?.showEmail ?? true,
          allowMessaging:
            updates.allowMessaging ?? prev.privacy?.allowMessaging ?? true,
        },
      };
      console.log('Settings: New settings after privacy update', newSettings);
      return newSettings;
    });
  };

  // Define the tabs for the settings page
  const tabs = [
    { name: t("preferences"), icon: "⚙️" },
    { name: t("notifications.title"), icon: "🔔" },
    { name: t("security.title"), icon: "🔐" },
    { name: t("account.title"), icon: "👤" },
    { name: t("account.deleteAccount"), icon: "🗑️" },
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
                    className="overflow-x-auto pb-1"
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
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 dark:from-gray-800 pointer-events-none"></div>
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
                <Tab.Panel className="p-6">
                  <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 rounded"></div>}>
                    <SecuritySettingsComponent
                      settings={settings?.security || {}}
                      onUpdate={handleSecurityUpdate}
                      isRTL={isRTL}
                    />
                  </Suspense>
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

                {/* Account Panel */}
                <Tab.Panel className="p-6">
                  <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 rounded"></div>}>
                    <AccountSettings
                      settings={{
                        profileVisibility: localSettings?.privacy?.profileVisibility || "public",
                        showOnlineStatus: localSettings?.privacy?.showOnlineStatus ?? true,
                        showPhone: localSettings?.privacy?.showPhone ?? true,
                        showEmail: localSettings?.privacy?.showEmail ?? true,
                        allowMessaging: localSettings?.privacy?.allowMessaging ?? true,
                      }}
                      onUpdate={handlePrivacyUpdate}
                      isRTL={isRTL}
                    />
                  </Suspense>
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

                {/* Delete Account Panel */}
                <Tab.Panel className="p-6">
                  <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 rounded"></div>}>
                    <DeleteAccount />
                  </Suspense>
                  
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