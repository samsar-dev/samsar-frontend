import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserAPI } from "@/api/auth.api";
import { toast } from "sonner";
import { FaEnvelope } from "@react-icons/all-files/fa/FaEnvelope";
import { FaShieldAlt } from "@react-icons/all-files/fa/FaShieldAlt";
import { FaCheckCircle } from "@react-icons/all-files/fa/FaCheckCircle";

import { FaInfoCircle } from "@react-icons/all-files/fa/FaInfoCircle";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";

interface FormData {
  newEmail: string;
  verificationCode: string;
}

const ChangeEmail = () => {
  const { user } = useAuth();
  const { t } = useTranslation("profile");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    newEmail: "",
    verificationCode: "",
  });
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newEmail.trim()) {
      toast.error(t("email_required"));
      return;
    }

    if (!validateEmail(formData.newEmail)) {
      toast.error(t("invalid_email_format"));
      return;
    }

    if (formData.newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      toast.error(t("same_email_error"));
      return;
    }

    setVerificationLoading(true);
    
    try {
      const result = await UserAPI.requestEmailChangeVerification(formData.newEmail);
      
      if (result.success) {
        setVerificationSent(true);
        setPendingEmail(formData.newEmail);
        toast.success(result.message || t("verification_code_sent"));
      } else {
        const errorMessage = getErrorMessage(result.error?.code);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error sending verification:", error);
      toast.error(t("verification_send_failed"));
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.verificationCode.trim()) {
      toast.error(t("verification_code_required"));
      return;
    }

    if (formData.verificationCode.length !== 6) {
      toast.error(t("invalid_verification_code"));
      return;
    }

    setLoading(true);
    
    try {
      const result = await UserAPI.changeEmailWithVerification(formData.verificationCode);
      
      if (result.success) {
        toast.success(result.message || t("email_changed_successfully"));
        
        // Reset form
        setFormData({
          newEmail: "",
          verificationCode: "",
        });
        setVerificationSent(false);
        setPendingEmail("");
        
        // User data will be refreshed automatically on next page load
      } else {
        const errorMessage = getErrorMessage(result.error?.code);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error changing email:", error);
      toast.error(t("email_change_failed"));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode?: string): string => {
    switch (errorCode) {
      case "INVALID_EMAIL":
        return t("invalid_email");
      case "INVALID_EMAIL_FORMAT":
        return t("invalid_email_format");
      case "SAME_EMAIL":
        return t("same_email_error");
      case "EMAIL_ALREADY_EXISTS":
        return t("email_already_exists");
      case "EMAIL_SEND_FAILED":
        return t("email_send_failed");
      case "INVALID_CODE":
        return t("invalid_verification_code");
      case "CODE_EXPIRED":
        return t("verification_code_expired");
      case "NO_PENDING_EMAIL":
        return t("no_pending_email_change");
      case "SERVER_ERROR":
        return t("server_error");
      default:
        return t("unexpected_error");
    }
  };

  const handleStartOver = () => {
    setVerificationSent(false);
    setPendingEmail("");
    setFormData({
      newEmail: "",
      verificationCode: "",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <FaEnvelope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("change_email")}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("change_email_description")}
          </p>
        </div>
      </div>

      {/* Current Email Display */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
          <FaInfoCircle className="w-4 h-4" />
          {t("current_email")}
        </div>
        <div className="font-medium text-gray-900 dark:text-white">
          {user?.email}
        </div>
      </div>

      {!verificationSent ? (
        /* Step 1: Enter New Email */
        <form onSubmit={handleSendVerification} className="space-y-4">
          <div>
            <label
              htmlFor="newEmail"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t("new_email")}
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                id="newEmail"
                name="newEmail"
                value={formData.newEmail}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={t("enter_new_email")}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={verificationLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {verificationLoading ? (
              <>
                <LoadingSpinner size="sm" />
                {t("sending_verification")}
              </>
            ) : (
              <>
                <FaShieldAlt className="w-4 h-4" />
                {t("send_verification_code")}
              </>
            )}
          </button>
        </form>
      ) : (
        /* Step 2: Enter Verification Code */
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
              <FaCheckCircle className="w-4 h-4" />
              <span className="font-medium">{t("verification_code_sent")}</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t("verification_code_sent_to", { email: pendingEmail })}
            </p>
          </div>

          <form onSubmit={handleChangeEmail} className="space-y-4">
            <div>
              <label
                htmlFor="verificationCode"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t("verification_code")}
              </label>
              <div className="relative">
                <FaShieldAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("enter_6_digit_code")}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleStartOver}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {t("start_over")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {t("changing_email")}
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-4 h-4" />
                    {t("change_email")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-2">
          <FaInfoCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">{t("security_notice")}</p>
            <p>{t("email_change_security_notice")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail;
