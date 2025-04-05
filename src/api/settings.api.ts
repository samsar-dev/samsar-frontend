import apiClient from "./apiClient";
import type {
  APIResponse,
  AppSettingsData,
  NotificationSettings,
  PrivacySettings,
} from "@/types/common";

const DEFAULT_SETTINGS: AppSettingsData = {
  notifications: {
    email: true,
    push: true,
    messages: true,
    listings: true,
  },
  security: {
    twoFactorEnabled: false,
    loginNotifications: true,
  },
  privacy: {
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    showOnlineStatus: true,
    allowMessagesFrom: "everyone",
  },
  preferences: {
    language: "en",
    theme: "light",
    currency: "USD",
  },
};

export class SettingsAPI {
  private static readonly BASE_PATH = "/settings";

  static async getSettings(): Promise<APIResponse<AppSettingsData>> {
    const response = await apiClient.get(`${this.BASE_PATH}`);
    return response.data;
  }

  static async updateNotificationSettings(
    settings: NotificationSettings,
  ): Promise<APIResponse<NotificationSettings>> {
    const response = await apiClient.patch(
      `${this.BASE_PATH}/notifications`,
      settings,
    );
    return response.data;
  }

  static async updatePrivacySettings(
    settings: PrivacySettings,
  ): Promise<APIResponse<PrivacySettings>> {
    const response = await apiClient.patch(
      `${this.BASE_PATH}/privacy`,
      settings,
    );
    return response.data;
  }

  static async getNotificationPreferences(): Promise<
    APIResponse<NotificationSettings>
  > {
    const response = await apiClient.get(`${this.BASE_PATH}/notifications`);
    return response.data;
  }

  static async getPrivacySettings(): Promise<APIResponse<PrivacySettings>> {
    const response = await apiClient.get(`${this.BASE_PATH}/privacy`);
    return response.data;
  }
}

export { DEFAULT_SETTINGS };
