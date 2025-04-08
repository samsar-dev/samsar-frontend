import type { ThemeMode } from "./common";
import { LanguageCode, ThemeType } from "./enums";

export interface Theme {
  mode: ThemeMode;
  primary: string;
  secondary: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  desktop: boolean;
  enabledTypes?: string[];
}

export interface PreferenceSettings {
  language: import("./enums").LanguageCode;
  theme: import("./enums").ThemeType;
  timezone: string;
  notifications: NotificationPreferences;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  securityQuestions: boolean;
  twoFactorMethod?: string;
  autoLogoutTime?: number;
  connectedAccounts: string[];
  loginActivity: Array<{
    date: string;
    device: string;
    location: string;
  }>;
}

export interface Settings {
  preferences: PreferenceSettings;
  security: SecuritySettings;
  notifications: NotificationPreferences;
  privacy: {
    showEmail: boolean;
    showOnlineStatus: boolean;
    allowMessaging: boolean;
    profileVisibility?: "public" | "private";
  };
}

export interface SettingsUpdate {
  preferences?: Partial<PreferenceSettings>;
  security?: Partial<SecuritySettings>;
  notifications?: Partial<NotificationPreferences>;
  privacy?: Partial<{
    showEmail: boolean;
    showOnlineStatus: boolean;
    allowMessaging: boolean;
  }>;
}

export interface LoginActivity {
  device?: string;
  location?: string;
  time?: string;
  ip?: string;
}

export type TwoFactorMethod = "email" | "sms" | "authenticator";

export interface NotificationEmailSettings {
  enabled: boolean;
  types: string[];
  frequency: "daily" | "weekly" | "never";
}

export interface NotificationPushSettings {
  enabled: boolean;
  types: string[];
}

export interface LocationSettings {
  defaultLocation?: {
    city: string;
    state?: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  searchRadius?: number;
  preferredUnits?: "km" | "mi";
}

export interface UserSettings extends Settings {
  privacy: {
    showEmail: boolean;
    showOnlineStatus: boolean;
    allowMessaging: boolean;
  };
  notifications: NotificationPreferences;
}

export interface AppSettings {
  security: SecuritySettings;
  notifications: NotificationPreferences;
  privacy: {
    showEmail: boolean;
    showOnlineStatus: boolean;
    allowMessaging: boolean;
  };
  preferences: PreferenceSettings;
}

export interface SettingsUpdateInput {
  notifications?: Partial<NotificationPreferences>;
  privacy?: Partial<{
    showEmail: boolean;
    showOnlineStatus: boolean;
    allowMessaging: boolean;
  }>;
  security?: Partial<SecuritySettings>;
  preferences?: Partial<PreferenceSettings>;
}
