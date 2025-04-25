import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserAPI } from "@/api/auth.api";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return t("profile.password_too_short");
    }
    if (!/[A-Z]/.test(password)) {
      return t("profile.password_needs_uppercase");
    }
    if (!/[a-z]/.test(password)) {
      return t("profile.password_needs_lowercase");
    }
    if (!/[0-9]/.test(password)) {
      return t("profile.password_needs_number");
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if new password matches confirm password
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t("profile.password_mismatch"));
      return;
    }

    // Check if new password is same as current password
    if (formData.newPassword === formData.currentPassword) {
      toast.error(t("profile.same_password"));
      return;
    }

    // Validate new password
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      toast.error(passwordError);
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
  ) => (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <div className="relative mt-1">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={id}
          value={value}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
        />
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="space-y-4">
        {renderPasswordInput(
          "currentPassword",
          t("profile.current_password"),
          formData.currentPassword,
          showCurrentPassword,
          setShowCurrentPassword,
        )}

        {renderPasswordInput(
          "newPassword",
          t("profile.new_password"),
          formData.newPassword,
          showNewPassword,
          setShowNewPassword,
        )}

        {renderPasswordInput(
          "confirmPassword",
          t("profile.confirm_password"),
          formData.confirmPassword,
          showConfirmPassword,
          setShowConfirmPassword,
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? t("common.saving") : t("profile.change_password")}
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;
