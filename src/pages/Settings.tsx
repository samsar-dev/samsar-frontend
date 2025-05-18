import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import PreferenceSettings from "@/components/settings/PreferenceSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import DeleteAccount from "@/components/settings/DeleteAccount";

import type {
  PreferenceSettings as PreferenceSettingsType,
  SecuritySettings as SecuritySettingsType,
  NotificationPreferences,
} from "@/types/settings";
import { te } from "date-fns/locale";
import { SettingsAPI } from "@/api";

interface ToggleProps {
  checked: boolean;
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
  notifications: {
    enabledTypes: string[];
    emailNotifications: boolean;
    pushNotifications: boolean;
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
  const { t, i18n } = useTranslation('settings');
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
        if (!response.ok) {
          throw new Error("Failed to update settings");
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

  const handleSecurityUpdate = (security: SecuritySettingsType) => {
    updateSettings({ security });
  };

  const handleNotificationToggle = (
    key: "email" | "push" | "desktop" | "message" | "listing" | "system",
    checked: boolean,
  ) => {
    updateSettings({
      notifications: {
        ...settings?.notifications,
        [key]: checked,
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
          <p className="mt-2 text-gray-600">
            {t("settingsDescription")}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("preferences")}
            </h2>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t("notifications.messageNotifications")}</span>
                <Toggle
                  checked={settings?.notifications?.message ?? false}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("message", checked)
                  }
                  label={t("notifications.messageNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("notifications.listingNotifications")}</span>
                <Toggle
                  checked={settings?.notifications?.listing ?? false}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("listing", checked)
                  }
                  label={t("notifications.listingNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("notifications.systemNotifications")}</span>
                <Toggle
                  checked={settings?.notifications?.system ?? false}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("system", checked)
                  }
                  label={t("notifications.systemNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("notifications.email")}</span>
                <Toggle
                  checked={settings?.notifications?.email ?? false}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("email", checked)
                  }
                  label={t("notifications.email")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("notifications.push")}</span>
                <Toggle
                  checked={settings?.notifications?.push ?? false}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("push", checked)
                  }
                  label={t("notifications.push")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("notifications.desktopNotifications")}</span>
                <Toggle
                  checked={settings?.notifications?.desktop ?? false}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("desktop", checked)
                  }
                  label={t("notifications.desktopNotifications")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("security.title")}
            </h2>
            <SecuritySettings
              settings={settings?.security || {}}
              onUpdate={handleSecurityUpdate}
              isRTL={isRTL}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("privacy.title")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t("privacy.profileVisibility")}</span>
                <select
                  value={settings?.privacy?.profileVisibility ?? "public"}
                  onChange={(e) =>
                    handlePrivacyUpdate({
                      profileVisibility: e.target.value as "public" | "private",
                    })
                  }
                  className="form-select"
                >
                  <option value="public">{t("privacy.public")}</option>
                  <option value="private">{t("privacy.private")}</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("privacy.showOnlineStatus")}</span>
                <Toggle
                  checked={settings?.privacy?.showOnlineStatus ?? false}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ showOnlineStatus: checked })
                  }
                  label={t("privacy.showOnlineStatus")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("privacy.showEmail")}</span>
                <Toggle
                  checked={settings?.privacy?.showEmail ?? false}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ showEmail: checked })
                  }
                  label={t("privacy.showEmail")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("Show Phone Numer")}</span>
                <Toggle
                  checked={settings?.privacy?.showPhone ?? false}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ showPhone: checked })
                  }
                  label={t("Show Phone Numer")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("privacy.allowMessaging")}</span>
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
