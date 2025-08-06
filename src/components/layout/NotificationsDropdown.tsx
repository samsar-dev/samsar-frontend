import React, { memo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL: boolean;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = memo(
  ({ isOpen, onClose, isRTL }) => {
    const { t } = useTranslation();
    const { user: _user } = useAuth();

    if (!isOpen) return null;

    return createPortal(
      <div
        className={`fixed top-16 ${isRTL ? "left-0" : "right-0"} w-64 max-w-sm bg-white dark:bg-gray-800 rounded-md shadow-lg z-50`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("navigation.notifications")}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
              aria-label={t("common.close")}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              {t("notifications.empty")}
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );
  },
);

export default NotificationsDropdown;
