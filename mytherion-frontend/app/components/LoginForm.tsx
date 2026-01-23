"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, clearError } from "../store/authSlice";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
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

    const result = await dispatch(loginUser(formData));
    
    if (loginUser.fulfilled.match(result)) {
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
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
          >
            Email Address
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">mail</span>
            <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-black/30 border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-0 focus:outline-none input-glow transition-all ${
                validationErrors.email ? 'border-red-500/50' : ''
                }`}
                placeholder="scribe@mytherion.com"
                disabled={isLoading}
            />
          </div>
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
            <div className="flex justify-between items-end mb-1">
                <label
                    htmlFor="password"
                    className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
                >
                    Secret Phrase
                </label>
            </div>
          <div className="relative">
             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">key</span>
            <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-black/30 border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-0 focus:outline-none input-glow transition-all ${
                validationErrors.password ? 'border-red-500/50' : ''
                }`}
                placeholder="••••••••"
                disabled={isLoading}
            />
          </div>
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
          )}
        </div>

        {/* API Error Display */}
        {error && (
          <div className="p-3 glass border border-red-500/50 rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-red-400 text-[20px]">error</span>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-cosmic py-4 rounded-xl text-white font-bold uppercase tracking-[0.2em] text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Authenticating..." : "Resume Journey"}
        </button>

        {/* Register Link */}
        <div className="mt-6 text-center space-y-4">
            <a href="#" className="block text-slate-500 hover:text-slate-300 text-xs transition-colors">
                Forgot Secret Phrase?
            </a>
            <div className="pt-4 border-t border-white/5">
                <Link
                    href="/register"
                    className="text-slate-400 hover:text-white text-sm transition-colors border-b border-transparent hover:border-primary pb-0.5"
                >
                    New Chronicler? <span className="text-primary font-semibold">Register</span>
                </Link>
            </div>
        </div>
      </form>
    </div>
  );
}

