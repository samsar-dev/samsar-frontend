import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("auth");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t("enterEmail"));
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error(t("invalidEmail"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/send-password-change-verification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (response.ok) {
        toast.success(t("resetLinkSent"));
        navigate("/password-reset-verification", { state: { email } });
      } else {
        const data = await response.json();
        toast.error(data.error?.message || t("resetLinkError"));
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(t("resetLinkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>

        <h2 className="mt-8 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {t("troubleLoggingIn")}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w">
          {t("enterEmailForLink")}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              {t("emailAddress")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              placeholder={t("emailPhoneUsername")}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-[#0095F6] px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#1877F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0095F6] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("sending") : t("sendLoginLink")}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">{t("or")}</span>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-sm font-semibold text-[#0095F6] hover:text-[#1877F2]"
            >
              {t("createNewAccount")}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-sm font-semibold text-[#0095F6] hover:text-[#1877F2] border border-gray-300 rounded-md py-3"
          >
            {t("backToLogin")}
          </button>
        </div>
      </div>
    </div>
  );
}
