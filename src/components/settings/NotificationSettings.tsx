import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { NotificationSettings as CanonicalNotificationSettings } from "@/types/settings";

interface Props {
  notifications: CanonicalNotificationSettings;
  onUpdate: (notifications: CanonicalNotificationSettings) => void;
}

const NotificationSettings: FC<Props> = ({ notifications, onUpdate }) => {
  const { t } = useTranslation();

  const handleNotificationChange = (key: keyof CanonicalNotificationSettings) => {
    onUpdate({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="email"
            type="checkbox"
            checked={notifications.email}
            onChange={() => handleNotificationChange("email")}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="email" className="font-medium text-gray-700">
            {t("email_notifications")}
          </label>
          <p className="text-gray-500">{t("receive_updates_via_email")}</p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="push"
            type="checkbox"
            checked={notifications.push}
            onChange={() => handleNotificationChange("push")}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="push" className="font-medium text-gray-700">
            {t("push_notifications")}
          </label>
          <p className="text-gray-500">{t("receive_push_notifications")}</p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="messages"
            type="checkbox"
            checked={notifications.messages}
            onChange={() => handleNotificationChange("messages")}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="messages" className="font-medium text-gray-700">
            {t("message_notifications")}
          </label>
          <p className="text-gray-500">
            {t("get_notified_about_new_messages")}
          </p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="listings"
            type="checkbox"
            checked={notifications.listings}
            onChange={() => handleNotificationChange("listings")}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="listings" className="font-medium text-gray-700">
            {t("listing_notifications")}
          </label>
          <p className="text-gray-500">
            {t("get_notified_about_new_listings")}
          </p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="system"
            type="checkbox"
            checked={notifications.system}
            onChange={() => handleNotificationChange("system")}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="system" className="font-medium text-gray-700">
            {t("system_notifications")}
          </label>
          <p className="text-gray-500">{t("get_notified_about_system_updates")}</p>
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="desktop"
            type="checkbox"
            checked={notifications.desktop}
            onChange={() => handleNotificationChange("desktop")}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="desktop" className="font-medium text-gray-700">
            {t("desktop_notifications")}
          </label>
          <p className="text-gray-500">{t("receive_desktop_notifications")}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
