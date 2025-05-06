import React, { createContext, useCallback, useState } from "react";
import type { Settings, SettingsUpdate } from "@/types/settings";
import { LanguageCode, ThemeType } from "@/types/enums";

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
    notifications: {
      email: true,
      push: true,
      desktop: true,
    },
  },
  security: {
    twoFactorEnabled: false,
    loginNotifications: true,
    securityQuestions: false,
  },
  notifications: {
    email: true,
    push: true,
    desktop: true,
  },
  privacy: {
    showEmail: false,
    showPhone: false,
    showOnlineStatus: true,
    allowMessaging: true,
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
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
