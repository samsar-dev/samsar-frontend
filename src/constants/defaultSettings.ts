import { LanguageCode, ThemeType } from "@/types/enums";
import type { Settings } from "@/types/settings";

export const defaultSettings: Settings = {
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
