import type { APIResponse, PaginatedData } from "./api";
import type { Listing } from "./listings";

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  phone?: string;
  bio?: string;
  profilePicture?: string;
  location?: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;

  allowMessaging?: boolean;
  listingNotifications?: boolean;
  messageNotifications?: boolean;
  showEmail?: boolean;
  showOnlineStatus?: boolean;
  showPhoneNumber?: boolean;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  website?: string;
  social?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    github?: string;
  };
  listings?: string[];
  followers?: string[];
  following?: string[];
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  bio?: string;
  profilePicture?: File;
  currentPassword?: string;
  newPassword?: string;
}

export type UserAPIResponse = APIResponse<User>;
export type UserProfileResponse = APIResponse<UserProfile>;
export type UserUpdateResponse = APIResponse<User>;
export type UserListingsResponse = APIResponse<PaginatedData<Listing>>;
