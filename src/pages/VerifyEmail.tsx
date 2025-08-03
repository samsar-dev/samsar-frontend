import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ACTIVE_API_URL } from "@/config";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FaCheckCircle } from "@react-icons/all-files/fa/FaCheckCircle";
import { FaExclamationTriangle } from "@react-icons/all-files/fa/FaExclamationTriangle";
import { FaEnvelope } from "@react-icons/all-files/fa/FaEnvelope";

const VerifyEmail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        setError(t("auth.verification.missing_token"));
        return;
      }

      try {
        const response = await fetch(
          `${ACTIVE_API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        const data = await response.json();

        if (response.status === 200 && data.success) {
          setSuccess(true);
          setError("");
          toast.success(t("auth.verification.success"));
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          // Handle specific error messages
          const errorMessage =
            data.error?.message || t("auth.verification.failed");
          setError(errorMessage);
          toast.error(errorMessage);

          // If the token is invalid or expired, show the resend form
          if (
            data.error?.code === "INVALID_TOKEN" ||
            data.error?.code === "TOKEN_EXPIRED"
          ) {
            setEmail("");
          }
        }
      } catch (err) {
        console.error("Error verifying email:", err);
        const errorMsg = t("auth.verification.server_error");
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, navigate, t]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t("auth.verification.email_required"));
      return;
    }

    setResending(true);

    try {
      const response = await fetch(
        `${ACTIVE_API_URL}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(t("auth.verification.resent"));
        setEmail("");
      } else {
        toast.error(
          data.error?.message || t("auth.verification.resend_failed"),
        );
      }
    } catch (err) {
      console.error("Error resending verification:", err);
      toast.error(t("auth.verification.server_error"));
    } finally {
      setResending(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("auth.verification.verifying")}
            </h2>
            <div className="mt-4 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {success ? (
          <div className="text-center">
            <FaCheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              {t("auth.verification.success_title")}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {t("auth.verification.success_message")}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/login")}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("auth.login")}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              {t("auth.verification.failed_title")}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("auth.verification.resend_title")}
              </h3>
              <form
                onSubmit={handleResendVerification}
                className="mt-4 space-y-4"
              >
                <div>
                  <label htmlFor="email" className="sr-only">
                    {t("auth.email")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={t("auth.email")}
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {resending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        {t("auth.verification.resending")}
                      </>
                    ) : (
                      t("auth.verification.resend")
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate("/login")}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t("auth.back_to_login")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
