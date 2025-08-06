import type { Settings } from "@/types/settings";
import type { APIResponse } from "@/types/common";
import { LanguageCode, ThemeType } from "@/types/enums";

export interface PreferenceSettingsType {
  language: LanguageCode;
  theme: ThemeType;
  timezone: string;
}

export class SettingsAPI {
  // Mock implementation for development
  static async getSettings(): Promise<APIResponse<Settings>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return mock data
    return {
      status: 200,
      success: true,
      error: null,
      data: {
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
          language: LanguageCode.EN,
          theme: ThemeType.LIGHT,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        security: {
          loginNotifications: true,
          securityQuestions: false,
          twoFactorEnabled: false,
          autoLogoutTime: 30,
        },
      },
      message: "Settings loaded successfully",
    };
  }

  static async updateSettings(
    settings: Partial<Settings>,
  ): Promise<APIResponse<Settings>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return the updated settings
    return {
      status: 200,
      success: true,
      error: null,
      data: settings as Settings,
      message: "Settings updated successfully",
    };
  }

  static async updatePrivacySettings(
    settings: Settings["privacy"],
  ): Promise<APIResponse<Settings>> {
    return this.updateSettings({ privacy: settings });
  }
}

export default SettingsAPI;
