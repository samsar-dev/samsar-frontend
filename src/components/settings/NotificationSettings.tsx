import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { NotificationPreferences } from "@/types/settings";

interface Props {
  notifications: NotificationPreferences;
  onUpdate: (notifications: NotificationPreferences) => void;
}

const NotificationSettings: FC<Props> = ({ notifications, onUpdate }) => {
  const { t } = useTranslation('settings');

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

      <div className="space-y-6">
        {/* Email Notifications Section */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">📩</span>
            <h3 className="text-base font-medium text-gray-900">
              {t("notifications.emailSection")}
            </h3>
          </div>
          
          <div className="space-y-3 pl-6">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="generalUpdates"
                  type="checkbox"
                  checked={notifications.generalUpdates}
                  onChange={() => handleNotificationChange("generalUpdates")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="generalUpdates" className="font-medium text-gray-700">
                  {t("notifications.generalUpdates")}
                </label>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="newInboxMessages"
                  type="checkbox"
                  checked={notifications.newInboxMessages}
                  onChange={() => handleNotificationChange("newInboxMessages")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="newInboxMessages" className="font-medium text-gray-700">
                  {t("notifications.newInboxMessages")}
                </label>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="orderUpdates"
                  type="checkbox"
                  checked={notifications.orderUpdates}
                  onChange={() => handleNotificationChange("orderUpdates")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="orderUpdates" className="font-medium text-gray-700">
                  {t("notifications.orderUpdates")}
                </label>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="listingUpdates"
                  type="checkbox"
                  checked={notifications.listingUpdates}
                  onChange={() => handleNotificationChange("listingUpdates")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="listingUpdates" className="font-medium text-gray-700">
                  {t("notifications.listingUpdates")}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Push Notifications Section */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">📱</span>
            <h3 className="text-base font-medium text-gray-900">
              {t("notifications.pushSection")}
            </h3>
          </div>
          
          <div className="pl-6">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="pushNotifications"
                  type="checkbox"
                  checked={notifications.pushNotifications}
                  onChange={() => handleNotificationChange("pushNotifications")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="pushNotifications" className="font-medium text-gray-700">
                  {t("notifications.pushNotifications")}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">📰</span>
            <h3 className="text-base font-medium text-gray-900">
              {t("notifications.newsletter")}
            </h3>
          </div>
          
          <div className="pl-6">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="newsletter"
                  type="checkbox"
                  checked={notifications.newsletter}
                  onChange={() => handleNotificationChange("newsletter")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="newsletter" className="font-medium text-gray-700">
                  {t("notifications.newsletterDescription")}
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  {t("notifications.newsletterDisclaimer")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
