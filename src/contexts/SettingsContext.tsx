import { LanguageCode, ThemeType } from "@/types/enums";
import type { Settings, SettingsUpdate } from "@/types/settings";
import { createContext, useCallback, useContext, useState } from "react";

export interface SettingsContextType {
  settings: Settings;
  pendingChanges: Partial<Settings>;
  updateSettings: (update: SettingsUpdate) => void;
  applySettings: () => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  preferences: {
    language: LanguageCode.AR,
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
  // Load settings from localStorage if available
  const savedSettings = localStorage.getItem('settings');
  const initialSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [pendingChanges, setPendingChanges] = useState<Partial<Settings>>({});

  const updateSettings = useCallback((update: SettingsUpdate) => {
    setPendingChanges(prev => ({
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

  const applySettings = useCallback(() => {
    // Get the current language from settings
    const currentLanguage = settings.preferences.language;
    
    // Apply the pending changes
    const newSettings = {
      ...settings,
      ...pendingChanges,
      preferences: {
        ...settings.preferences,
        ...pendingChanges.preferences,
      },
      security: {
        ...settings.security,
        ...pendingChanges.security,
      },
      notifications: {
        ...settings.notifications,
        ...pendingChanges.notifications,
      },
      privacy: {
        ...settings.privacy,
        ...pendingChanges.privacy,
      },
    };
    
    // Save settings to localStorage
    localStorage.setItem('settings', JSON.stringify(newSettings));
    
    setSettings(newSettings);
    
    // Update language if it changed
    const newLanguage = newSettings.preferences.language;
    if (currentLanguage !== newLanguage) {
      const langCode = newLanguage === LanguageCode.AR ? 'ar' : 'en';
      localStorage.setItem('language', langCode);
      document.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    }
    
    setPendingChanges({});
  }, [pendingChanges]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, pendingChanges, updateSettings, applySettings, resetSettings }}
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
