import type { Settings } from "@/types/settings";
import type { APIResponse } from "@/types/common";
import type { LanguageCode, ThemeType } from "@/types/enums";
import apiClient from "./apiClient";

export interface PreferenceSettingsType {
  language: LanguageCode;
  theme: ThemeType;
  timezone: string;
}

export class SettingsAPI {
  private static readonly BASE_PATH = "/settings";

  static async getSettings(): Promise<APIResponse<Settings>> {
    const response = await apiClient.get<APIResponse<Settings>>(this.BASE_PATH);
    return response.data;
  }

  static async updateSettings(settings: Partial<Settings>): Promise<APIResponse<Settings>> {
    const response = await apiClient.patch<APIResponse<Settings>>(this.BASE_PATH, settings);
    return response.data;
  }

  static async updatePrivacySettings(settings: Settings['privacy']): Promise<APIResponse<Settings>> {
    return this.updateSettings({ privacy: settings });
  }
}

export default SettingsAPI;