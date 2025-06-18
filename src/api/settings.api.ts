import type { Settings } from "@/types";
import type { AuthUser } from "@/types/auth.types";
import type {
  APIResponse,
  AppSettingsData,
  NotificationSettings,
  PrivacySettings,
} from "@/types/common";
import type { RequestConfig } from "./apiClient";
import apiClient from "./apiClient";

const DEFAULT_SETTINGS: AppSettingsData = {
  notifications: {
    email: true,
    push: true,
    messages: true,
    listings: true,
    system: true,
    desktop: true,
  },
  security: {
    twoFactorEnabled: false,
    loginNotifications: true,
  },
  privacy: {
    profileVisibility: "public",
    showPhone: false,
    showOnlineStatus: true,
    allowMessagesFrom: "everyone",
    allowMessaging: true,
  },
  preferences: {
    language: "en",
    theme: "light",
    currency: "USD",
  },
};

export class SettingsAPI {
  private static readonly BASE_PATH = "/users/settings";

  static async getSettings(): Promise<APIResponse<AuthUser>> {
    const response = await apiClient.get(`${this.BASE_PATH}`);
    return response.data;
  }

  static async updateNotificationSettings(
    settings: NotificationSettings
  ): Promise<APIResponse<NotificationSettings>> {
    const response = await apiClient.patch(
      `${this.BASE_PATH}/notifications`,
      settings
    );
    return response.data;
  }

  static async updatePrivacySettings(
    settings: Settings
  ): Promise<APIResponse<PrivacySettings>> {
    const response = await apiClient.post(
      `${this.BASE_PATH}`,
      { notifications: settings.notifications, privacy: settings.privacy },
      {
        requiresAuth: true, // Add this to ensure auth token is sent
      } as RequestConfig
    );
    // const response = await axios.post(
    //   `${this.BASE_PATH}`,
    //   { notifications: settings.notifications, privacy: settings.privacy },
    //   {
    //     withCredentials: true,
    //   }
    // );
    console.log("response", response.data);
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
