import { useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ACTIVE_API_URL } from "@/config";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { FaCheckCircle } from "@react-icons/all-files/fa/FaCheckCircle";
import { FaExclamationTriangle } from "@react-icons/all-files/fa/FaExclamationTriangle";
import { FaEnvelope } from "@react-icons/all-files/fa/FaEnvelope";
import { FaLock } from "@react-icons/all-files/fa/FaLock";

const VerifyCode = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // If no email was passed, redirect to login
    if (!email) {
      toast.error("Email information missing. Please try again.");
      navigate("/login");
    }
  }, [email, navigate]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const response = await fetch(`${ACTIVE_API_URL}/auth/verify-email/code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: verificationCode,
          email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        toast.success("Email verified successfully!");
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(
          data.error?.message ||
            "Failed to verify email. Please check your code and try again.",
        );
      }
    } catch (err) {
      console.error("Error verifying email:", err);
      setError("Server error. Please try again later.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email information missing. Please try again.");
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

      if (response.ok && data.success) {
        toast.success("Verification code has been resent to your email");
      } else {
        toast.error(
          data.error?.message || "Failed to resend verification code",
        );
      }
    } catch (err) {
      console.error("Error resending verification:", err);
      toast.error("Server error. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-center">
            <FaCheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
              Email Verified Successfully!
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Your email has been verified. You can now log in to your account.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/login")}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <FaEnvelope className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            We've sent a verification code to{" "}
            <span className="font-medium">{email}</span>. Please enter the code
            below to verify your email address.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
            <div className="flex">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleVerifyCode} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="verification-code"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Verification Code
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="verification-code"
                name="verification-code"
                type="text"
                autoComplete="one-time-code"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter 6-digit code"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={verifying}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend Code"}
            </button>
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate("/login")}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
