import { useCallback } from "react";
import type { SecuritySettings as SecuritySettingsType } from "@/types/settings";

interface Props {
  settings: SecuritySettingsType;
  onUpdate: (settings: SecuritySettingsType) => void;
  isRTL: boolean;
}

function SecuritySettings({ settings, onUpdate, isRTL }: Props) {
  const handleSecurityChange = useCallback(
    (key: keyof SecuritySettingsType, value: any) => {
      onUpdate({
        ...settings,
        [key]: value,
      });
    },
    [settings, onUpdate],
  );

  const handleConnectedAccountToggle = useCallback(
    (accountId: string) => {
      const isConnected = settings.connectedAccounts.includes(accountId);
      const connectedAccounts = isConnected
        ? settings.connectedAccounts.filter((id) => id !== accountId)
        : [...settings.connectedAccounts, accountId];

      handleSecurityChange("connectedAccounts", connectedAccounts);
    },
    [settings.connectedAccounts, handleSecurityChange],
  );

  return (
    <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`}>
      <div>
        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="twoFactorEnabled"
                type="checkbox"
                checked={settings.twoFactorEnabled}
                onChange={(e) =>
                  handleSecurityChange("twoFactorEnabled", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
              <label
                htmlFor="twoFactorEnabled"
                className="font-medium text-gray-700"
              >
                Enable Two-Factor Authentication
              </label>
              <p className="text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>

          {settings.twoFactorEnabled && (
            <div>
              <label
                htmlFor="twoFactorMethod"
                className="block text-sm font-medium text-gray-700"
              >
                Authentication Method
              </label>
              <select
                id="twoFactorMethod"
                value={settings.twoFactorMethod}
                onChange={(e) =>
                  handleSecurityChange("twoFactorMethod", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="email">Email</option>
                <option value="authenticator">Authenticator App</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Login Notifications</h3>
        <div className="mt-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="loginNotifications"
                type="checkbox"
                checked={settings.loginNotifications}
                onChange={(e) =>
                  handleSecurityChange("loginNotifications", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
              <label
                htmlFor="loginNotifications"
                className="font-medium text-gray-700"
              >
                Enable Login Notifications
              </label>
              <p className="text-gray-500">
                Get notified when someone logs into your account
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Auto Logout</h3>
        <div className="mt-4">
          <label
            htmlFor="autoLogoutTime"
            className="block text-sm font-medium text-gray-700"
          >
            Auto Logout Time (hours)
          </label>
          <input
            type="number"
            id="autoLogoutTime"
            value={settings.autoLogoutTime}
            onChange={(e) =>
              handleSecurityChange(
                "autoLogoutTime",
                parseInt(e.target.value, 10),
              )
            }
            min="1"
            max="72"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Connected Accounts</h3>
        <div className="mt-4 space-y-4">
          {["google", "facebook", "twitter"].map((provider) => (
            <div key={provider} className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id={`connected-${provider}`}
                  type="checkbox"
                  checked={settings.connectedAccounts.includes(provider)}
                  onChange={() => handleConnectedAccountToggle(provider)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
                <label
                  htmlFor={`connected-${provider}`}
                  className="font-medium text-gray-700"
                >
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </label>
                <p className="text-gray-500">Connect your {provider} account</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Recent Login Activity</h3>
        <div className="mt-4">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className={`px-3 py-3.5 text-${isRTL ? "right" : "left"} text-sm font-semibold text-gray-900`}
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className={`px-3 py-3.5 text-${isRTL ? "right" : "left"} text-sm font-semibold text-gray-900`}
                  >
                    Device
                  </th>
                  <th
                    scope="col"
                    className={`px-3 py-3.5 text-${isRTL ? "right" : "left"} text-sm font-semibold text-gray-900`}
                  >
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {settings.loginActivity.map((activity, index) => (
                  <tr key={index}>
                    <td
                      className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-${isRTL ? "right" : "left"}`}
                    >
                      {activity.date}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-${isRTL ? "right" : "left"}`}
                    >
                      {activity.device}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-${isRTL ? "right" : "left"}`}
                    >
                      {activity.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecuritySettings;
