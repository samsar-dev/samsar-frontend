import type { FormEvent, ChangeEvent } from "react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";

interface RegisterFormData {
   name: string;
   email: string;
   password: string;
   confirmPassword: string;
}

const Register: React.FC = () => {
   const navigate = useNavigate();
   const { register, error: authError, clearError } = useAuth();

   const [formData, setFormData] = useState<RegisterFormData>({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
   });
   const [loading, setLoading] = useState(false);

   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      if (authError) clearError();
   };

   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      if (formData.password !== formData.confirmPassword) {
         toast.error("Passwords do not match");
         setLoading(false);
         return;
      }

      // Validate password requirements
      const passwordRegex =
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
         toast.error(
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
         );
         setLoading(false);
         return;
      }

      try {
         await register(formData.email, formData.password, formData.name);
         navigate("/");
      } catch (error: any) {
         console.error("Registration error:", error);
         toast.error(error.message || "Failed to register");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
         <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Create an Account
         </h2>

         {authError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
               {authError.message}
            </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
               </label>
               <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  disabled={loading}
               />
            </div>

            <div>
               <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Email
               </label>
               <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  disabled={loading}
               />
            </div>

            <div>
               <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Password
               </label>
               <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  disabled={loading}
                  minLength={8}
               />
               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters and contain at least
                  one uppercase letter, one lowercase letter, and one number.
               </p>
            </div>

            <div>
               <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
               </label>
               <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  disabled={loading}
                  minLength={8}
               />
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50"
            >
               {loading ? "Creating Account..." : "Create Account"}
            </button>
         </form>

         <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
               to="/login"
               className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
               Login here
            </Link>
         </p>
      </div>
   );
};

export default Register;
