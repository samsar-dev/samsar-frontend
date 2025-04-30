import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const { login, error: authError, clearError, retryAfter } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (retryAfter) {
      const interval = setInterval(() => {
        const seconds = Math.max(
          0,
          Math.ceil((new Date(retryAfter).getTime() - Date.now()) / 1000),
        );
        setCooldown(seconds > 0 ? seconds : null);
        if (seconds <= 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCooldown(null);
    }
  }, [retryAfter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t("auth.enterBothEmailAndPassword"));
      return;
    }

    setLoading(true);
    clearError();

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/");
        toast.success(t("auth.successfullyLoggedIn"));
      }
      // If not successful, error will be shown by the AuthContext error state
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      clearError();
      setter(e.target.value);
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={handleInputChange(setEmail)}
                disabled={loading}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Password"
                value={password}
                onChange={handleInputChange(setPassword)}
                disabled={loading}
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

          {authError?.code === "INVALID_CREDENTIALS" && (
            <div className="text-red-500 text-sm text-center">
              Incorrect email or password.
            </div>
          )}
          {authError?.code === "EMAIL_NOT_VERIFIED" && (
            <div className="text-red-500 text-sm text-center">
              Please verify your email before logging in.
            </div>
          )}
          {authError?.code === "ACCOUNT_DISABLED" && (
            <div className="text-red-500 text-sm text-center">
              Your account has been disabled. Contact support.
            </div>
          )}
          {authError?.code === "RATE_LIMIT" && (
            <div className="text-red-500 text-sm text-center">
              {authError.message}
              {cooldown && (
                <span> Please wait {cooldown}s before trying again.</span>
              )}
            </div>
          )}
          {authError &&
            ![
              "INVALID_CREDENTIALS",
              "EMAIL_NOT_VERIFIED",
              "ACCOUNT_DISABLED",
              "RATE_LIMIT",
            ].includes(authError.code) && (
              <div className="text-red-500 text-sm text-center">
                {authError.message}
              </div>
            )}

          <div>
            <button
              type="submit"
              disabled={loading || !!cooldown}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading || cooldown ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {cooldown
                ? `Please wait ${cooldown}s`
                : loading
                  ? "Signing in..."
                  : "Sign in"}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-sm">
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
