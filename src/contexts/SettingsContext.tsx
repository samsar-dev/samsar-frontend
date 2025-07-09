import { LanguageCode, ThemeType } from "@/types/enums";
import type { Settings, SettingsUpdate } from "@/types/settings";
import { createContext, useCallback, useContext, useState } from "react";

export interface SettingsContextType {
  settings: Settings;
  updateSettings: (update: SettingsUpdate) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  preferences: {
    language: LanguageCode.EN,
    theme: ThemeType.LIGHT,
    timezone: "UTC",
  },
  security: {
    twoFactorEnabled: false,
    loginNotifications: true,
    securityQuestions: false,
  },
  notifications: {
    listingUpdates: true,
    newInboxMessages: true,
    loginNotifications: true,
  },
  privacy: {
    showEmail: false,
    showPhone: false,
    showOnlineStatus: true,
    allowMessaging: true,
    profileVisibility: "public",
  },
};

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = useCallback((update: SettingsUpdate) => {
    setSettings((prev) => ({
      ...prev,
      ...update,
      preferences: {
        ...prev.preferences,
        ...update.preferences,
      },
      security: {
        ...prev.security,
        ...update.security,
      },
      notifications: {
        ...prev.notifications,
        ...update.notifications,
      },
      privacy: {
        ...prev.privacy,
        ...update.privacy,
      },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
