import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { NotificationPreferences } from "@/types/settings";

interface Props {
  notifications: NotificationPreferences;
  onUpdate: (notifications: NotificationPreferences) => void;
}

const NotificationSettings: FC<Props> = ({ notifications, onUpdate }) => {
  const { t } = useTranslation();

  const handleNotificationChange = (key: keyof NotificationPreferences) => {
    onUpdate({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {t("notifications.title")}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t("notifications.description")}
        </p>
      </div>

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
              {t("notifications.email")}
            </label>
            <p className="text-gray-500">
              {t("notifications.emailDescription")}
            </p>
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
              {t("notifications.push")}
            </label>
            <p className="text-gray-500">
              {t("notifications.pushDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
