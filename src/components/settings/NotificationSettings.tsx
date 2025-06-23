import type { FC } from "react";
import { useTranslation } from "react-i18next";
import type { NotificationPreferences } from "@/types/settings";

interface Props {
  notifications: NotificationPreferences;
  onUpdate: (notifications: NotificationPreferences) => void;
}

const NotificationSettings: FC<Props> = ({ notifications, onUpdate }) => {
  const { t } = useTranslation("settings");

  const handleNotificationChange = (key: keyof NotificationPreferences) => {
    onUpdate({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          {t("notifications.title")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("notifications.description")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications Section */}
        <div className="space-y-4 bg-white dark:bg-gray-800">
          {/* <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"> */}
          <div className="flex items-center space-x-2">
            {/* <span className="text-gray-600 dark:text-gray-300">📩</span> */}
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("notifications.emailSection")}
              {/* {t("Email Notifications")} */}
            </h3>
          </div>

          <div className="space-y-3">
            {[
              // { id: "generalUpdates", label: t("notifications.generalUpdates") },
              {
                id: "newInboxMessages",
                label: t("notifications.newInboxMessages"),
              },
              // { id: "orderUpdates", label: t("notifications.orderUpdates") },
              {
                id: "listingUpdates",
                label: t("notifications.listingUpdates"),
              },
            ].map(({ id, label }) => (
              <div key={id} className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id={id}
                    type="checkbox"
                    checked={
                      notifications[
                        id as keyof NotificationPreferences
                      ] as boolean
                    }
                    onChange={() =>
                      handleNotificationChange(
                        id as keyof NotificationPreferences
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor={id}
                    className="font-medium text-gray-700 dark:text-gray-300"
                  >
                    {label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t("security.loginNotifications")}
          </h3>
          <div className="mt-4">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="loginNotifications"
                  type="checkbox"
                  checked={notifications.loginNotifications}
                  onChange={(e) =>
                    onUpdate({
                      ...notifications,
                      loginNotifications: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              {/* <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}> */}
              <div className={`ml-3 text-sm`}>
                <label
                  htmlFor="loginNotifications"
                  className="font-medium text-gray-700"
                >
                  {t("security.enableLoginNotifications")}
                </label>
                <p className="text-gray-500">
                  {t("security.loginNotificationsDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Push Notifications Section */}
        {/* <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 dark:text-gray-300">📱</span>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
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
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="pushNotifications"
                  className="font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("notifications.pushNotifications")}
                </label>
              </div>
            </div>
          </div>
        </div> */}

        {/* Newsletter Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t("notifications.newsletter")}
          </h3>
          <div className="mt-4">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="newsletter"
                  type="checkbox"
                  checked={notifications.newsletterSubscribed}
                  onChange={(e) =>
                    onUpdate({
                      ...notifications,
                      newsletterSubscribed: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="newsletter"
                  className="font-medium text-gray-700 dark:text-gray-300"
                >
                  {t("notifications.newsletterDescription")}
                </label>
                <p className="text-gray-500 dark:text-gray-400">
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
