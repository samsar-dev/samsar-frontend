import type { ThemeMode } from "./common";
import type { LanguageCode, ThemeType } from "./enums";

export interface Theme {
  mode: ThemeMode;
  primary: string;
  secondary: string;
}

export interface NotificationPreferences {
  // Email Notifications
  generalUpdates?: boolean;
  newInboxMessages: boolean;
  orderUpdates?: boolean;
  listingUpdates: boolean;
  loginNotifications: boolean;
  // Push Notifications
  pushNotifications?: boolean;

  // Newsletter
  newsletterSubscribed?: boolean;

  // Legacy fields (keep for backward compatibility)
  email?: boolean;
  push?: boolean;
  message?: boolean;
  enabledTypes?: Array<"message" | "listing">;
}

export interface PreferenceSettings {
  language: LanguageCode;
  theme: ThemeType;
  timezone: string;
}

export interface ConnectedAccount {
  connected: boolean;
  visible: boolean;
  email?: string;
  name?: string;
  avatar?: string;
}

export interface ConnectedAccounts {
  [key: string]: ConnectedAccount;
}

export interface SecuritySettings {
  twoFactorEnabled?: boolean;
  loginNotifications: boolean;
  securityQuestions: boolean;
  twoFactorMethod?: string;
  autoLogoutTime?: number;
  autoLogoutMinutes?: number;
  connectedAccounts?: ConnectedAccounts;
  loginActivity?: Array<{
    date: string;
    device: string;
    location: string;
  }>;
}

export interface Settings {
  preferences: PreferenceSettings;
  security: SecuritySettings;
  notifications: NotificationPreferences;
  connectedAccounts?: ConnectedAccounts;
  privacy: {
    showPhone: boolean;
    showEmail: boolean;
    showOnlineStatus: boolean;
    allowMessaging: boolean;
    profileVisibility: "public" | "private";
  };
}

export interface SettingsUpdate {
  preferences?: Partial<PreferenceSettings>;
  security?: Partial<SecuritySettings>;
  notifications?: Partial<NotificationPreferences>;
  connectedAccounts?: ConnectedAccounts;
  privacy?: Partial<{
    showPhone: boolean;
    showEmail: boolean;
    showOnlineStatus: boolean;
    allowMessaging: boolean;
    profileVisibility: "public" | "private";
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

export interface UserSettings extends Omit<Settings, "privacy"> {
  privacy: {
    showPhone: boolean;
    showOnlineStatus: boolean;
    allowMessaging: boolean;
    profileVisibility?: "public" | "private";
  };
  notifications: NotificationPreferences;
}

export interface AppSettings {
  security: SecuritySettings;
  notifications: NotificationPreferences;
  privacy: {
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
