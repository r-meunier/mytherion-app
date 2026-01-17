"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser, clearError } from "../store/authSlice";

export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: {
      email?: string;
      username?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    // Username validation
    if (!formData.username) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (formData.username.length > 32) {
      errors.username = "Username must be at most 32 characters";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (formData.password.length > 72) {
      errors.password = "Password must be at most 72 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    dispatch(clearError());

    const result = await dispatch(
      registerUser({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      router.push("/");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-purple-200 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/40 border border-purple-500/30 rounded-lg text-purple-100 placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all"
            placeholder="you@example.com"
            disabled={isLoading}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-400">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Username Field */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-purple-200 mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/40 border border-purple-500/30 rounded-lg text-purple-100 placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all"
            placeholder="johndoe"
            disabled={isLoading}
          />
          {validationErrors.username && (
            <p className="mt-1 text-sm text-red-400">
              {validationErrors.username}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-purple-200 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/40 border border-purple-500/30 rounded-lg text-purple-100 placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all"
            placeholder="••••••••"
            disabled={isLoading}
          />
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-400">
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-purple-200 mb-2"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/40 border border-purple-500/30 rounded-lg text-purple-100 placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all"
            placeholder="••••••••"
            disabled={isLoading}
          />
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* API Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Register"}
        </button>

        {/* Login Link */}
        <p className="text-center text-purple-300/80 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
