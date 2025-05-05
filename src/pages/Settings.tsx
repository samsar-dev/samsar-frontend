import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import PreferenceSettings from "@/components/settings/PreferenceSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";

import type {
  PreferenceSettings as PreferenceSettingsType,
  SecuritySettings as SecuritySettingsType,
  NotificationPreferences,
} from "@/types/settings";

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
    showEmail: boolean;
    allowMessaging: boolean;
  };
}

function Settings() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const isRTL = i18n.language === "ar";

  const handlePreferenceUpdate = (preferences: PreferenceSettingsType) => {
    updateSettings({ preferences });
  };

  const handleSecurityUpdate = (security: SecuritySettingsType) => {
    updateSettings({ security });
  };

  const handleNotificationToggle = (
    key: 'email' | 'push' | 'desktop' | 'message' | 'listing' | 'system',
    checked: boolean,
  ) => {
    if (key === 'email' || key === 'push' || key === 'desktop') {
      updateSettings({
        notifications: {
          ...settings?.notifications,
          [key]: checked,
        },
      });
    } else {
      updateSettings({
        notifications: {
          ...settings?.notifications,
          enabledTypes: checked
            ? [...(settings?.notifications?.enabledTypes || []), key]
            : settings?.notifications?.enabledTypes?.filter(
                (type) => type !== key
              ) || [],
        },
      });
    }
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
          <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
          <p className="mt-2 text-gray-600">
            {t("settings.settingsDescription")}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("settings.preferences")}
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
              {t("settings.notifications")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t("settings.messageNotifications")}</span>
                <Toggle
                  checked={
                    settings?.notifications?.enabledTypes?.includes(
                      "message",
                    ) ?? false
                  }
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("message", checked)
                  }
                  label={t("settings.messageNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.listingNotifications")}</span>
                <Toggle
                  checked={
                    settings?.notifications?.enabledTypes?.includes(
                      "listing",
                    ) ?? false
                  }
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("listing", checked)
                  }
                  label={t("settings.listingNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.systemNotifications")}</span>
                <Toggle
                  checked={
                    settings?.notifications?.enabledTypes?.includes("system") ??
                    false
                  }
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("system", checked)
                  }
                  label={t("settings.systemNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.emailNotifications")}</span>
                <Toggle
                  checked={settings?.notifications?.email ?? false}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("email", checked)
                  }
                  label={t("settings.emailNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.pushNotifications")}</span>
                <Toggle
                  checked={settings?.notifications?.push ?? false}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("push", checked)
                  }
                  label={t("settings.pushNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.desktopNotifications")}</span>
                <Toggle
                  checked={settings?.notifications?.desktop ?? false}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("desktop", checked)
                  }
                  label={t("settings.desktopNotifications")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("settings.security")}
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
              {t("settings.privacy")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t("settings.profileVisibility")}</span>
                <select
                  value={settings?.privacy?.profileVisibility ?? "public"}
                  onChange={(e) =>
                    handlePrivacyUpdate({
                      profileVisibility: e.target.value as "public" | "private",
                    })
                  }
                  className="form-select"
                >
                  <option value="public">{t("settings.public")}</option>
                  <option value="private">{t("settings.private")}</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.showOnlineStatus")}</span>
                <Toggle
                  checked={settings?.privacy?.showOnlineStatus ?? false}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ showOnlineStatus: checked })
                  }
                  label={t("settings.showOnlineStatus")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.showEmail")}</span>
                <Toggle
                  checked={settings?.privacy?.showEmail ?? false}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ showEmail: checked })
                  }
                  label={t("settings.showEmail")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.allowMessaging")}</span>
                <Toggle
                  checked={settings?.privacy?.allowMessaging ?? false}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ allowMessaging: checked })
                  }
                  label={t("settings.allowMessaging")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("settings.delete_account")}
            </h2>
            {/* <DeleteAccount /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
