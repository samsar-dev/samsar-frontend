import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserAPI } from "@/api/auth.api";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaLock, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

const ChangePassword = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isValid: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password strength when new password changes
    if (name === "newPassword") {
      const strength = evaluatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const evaluatePasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;
    
    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push(t("profile.password_too_short"));
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push(t("profile.password_needs_uppercase"));
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push(t("profile.password_needs_lowercase"));
    }
    
    // Number check
    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push(t("profile.password_needs_number"));
    }
    
    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push(t("profile.password_needs_special"));
    }
    
    return {
      score,
      feedback,
      isValid: score >= 4 && password.length >= 8,
    };
  };

  const getStrengthColor = (score: number): string => {
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (score: number): string => {
    if (score <= 1) return t("profile.password_strength.weak");
    if (score <= 2) return t("profile.password_strength.fair");
    if (score <= 3) return t("profile.password_strength.good");
    if (score <= 4) return t("profile.password_strength.strong");
    return t("profile.password_strength.excellent");
  };

  const validateForm = (): string | null => {
    // Check if new password matches confirm password
    if (formData.newPassword !== formData.confirmPassword) {
      return t("profile.password_mismatch");
    }

    // Check if new password is same as current password
    if (formData.newPassword === formData.currentPassword) {
      return t("profile.same_password");
    }

    // Check password strength
    if (!passwordStrength.isValid) {
      return t("profile.password_not_strong");
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("currentPassword", formData.currentPassword);
      formDataToSend.append("password", formData.newPassword); // Changed to match backend expectation

      const response = await UserAPI.updateProfile(formDataToSend);

      // More detailed logging and error handling
      console.log("Password Update Response:", response);

      if (response.success) {
        toast.success(t("profile.password_updated"));
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength({
          score: 0,
          feedback: [],
          isValid: false,
        });
      } else {
        // Log the specific error from the API
        console.error("Password Update Error:", response.error);
        const errorMessage =
          typeof response.error === "object" && response.error !== null
            ? response.error.message
            : typeof response.error === "string"
              ? response.error
              : t("profile.update_error");
        toast.error(errorMessage);
        throw new Error(errorMessage); // Throw error to prevent clearing form
      }
    } catch (error) {
      console.error("Password Update Catch Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : t("profile.update_error");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    id: string,
    label: string,
    value: string,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void,
    icon: React.ReactNode
  ) => (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {icon}
        <span className="ml-2">{label}</span>
      </label>
      <div className="relative mt-1">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={id}
          value={value}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaLock className="text-gray-400" />
        </div>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
        >
          {showPassword ? (
            <FaEyeSlash className="h-5 w-5" />
          ) : (
            <FaEye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <FaShieldAlt className="mr-2 text-blue-500" />
          {t("profile.security_settings")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("profile.password_description")}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          {renderPasswordInput(
            "currentPassword",
            t("profile.current_password"),
            formData.currentPassword,
            showCurrentPassword,
            setShowCurrentPassword,
            <FaLock className="text-gray-500" />
          )}

          {renderPasswordInput(
            "newPassword",
            t("profile.new_password"),
            formData.newPassword,
            showNewPassword,
            setShowNewPassword,
            <FaLock className="text-gray-500" />
          )}

          {/* Password strength indicator */}
          {formData.newPassword && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t("profile.password_strength.label")}:
                </span>
                <span className={`text-xs font-medium ${passwordStrength.isValid ? 'text-green-500' : 'text-gray-500'}`}>
                  {getStrengthText(passwordStrength.score)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${getStrengthColor(passwordStrength.score)} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                ></div>
              </div>
              
              {/* Password requirements */}
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("profile.password_requirements")}:
                </p>
                <ul className="space-y-1 text-xs">
                  <li className={`flex items-center ${formData.newPassword.length >= 8 ? 'text-green-500' : 'text-gray-500'}`}>
                    {formData.newPassword.length >= 8 ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                    {t("profile.req_min_length")}
                  </li>
                  <li className={`flex items-center ${/[A-Z]/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-500'}`}>
                    {/[A-Z]/.test(formData.newPassword) ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                    {t("profile.req_uppercase")}
                  </li>
                  <li className={`flex items-center ${/[a-z]/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-500'}`}>
                    {/[a-z]/.test(formData.newPassword) ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                    {t("profile.req_lowercase")}
                  </li>
                  <li className={`flex items-center ${/[0-9]/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-500'}`}>
                    {/[0-9]/.test(formData.newPassword) ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                    {t("profile.req_number")}
                  </li>
                  <li className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-500'}`}>
                    {/[^A-Za-z0-9]/.test(formData.newPassword) ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                    {t("profile.req_special")}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {renderPasswordInput(
            "confirmPassword",
            t("profile.confirm_password"),
            formData.confirmPassword,
            showConfirmPassword,
            setShowConfirmPassword,
            <FaLock className="text-gray-500" />
          )}
          
          {/* Password match indicator */}
          {formData.newPassword && formData.confirmPassword && (
            <div className="flex items-center mt-1">
              {formData.newPassword === formData.confirmPassword ? (
                <span className="text-xs text-green-500 flex items-center">
                  <FaCheckCircle className="mr-1" />
                  {t("profile.passwords_match")}
                </span>
              ) : (
                <span className="text-xs text-red-500 flex items-center">
                  <FaTimesCircle className="mr-1" />
                  {t("profile.passwords_dont_match")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Security tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex">
            <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {t("profile.security_tips")}
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <p>{t("profile.tip_unique")}</p>
                <p>{t("profile.tip_manager")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {t("common.saving")}
              </span>
            ) : (
              t("profile.change_password")
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
