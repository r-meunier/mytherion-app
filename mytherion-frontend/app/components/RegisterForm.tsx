"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser, clearError, resendVerification } from "../store/authSlice";

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

  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

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
      // Show success message instead of redirecting
      setRegistrationSuccess(true);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendMessage('');

    try {
      await dispatch(resendVerification(formData.email)).unwrap();
      setResendMessage('✓ Verification email sent! Check your inbox.');
    } catch (error: any) {
      setResendMessage(`✗ ${error || 'Failed to send email. Please try again.'}`);
    } finally {
      setResending(false);
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

  // Show success message after registration
  if (registrationSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="p-8 glass rounded-2xl shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                <span className="material-symbols-outlined text-green-400 text-[40px]">mail</span>
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-4">Check Your Email!</h2>
            <p className="text-slate-300 mb-2">
              We've sent a verification email to:
            </p>
            <p className="text-white font-semibold mb-6">{formData.email}</p>
            <p className="text-slate-400 text-sm mb-6">
              Click the link in the email to verify your account and complete registration.
              The link will expire in 24 hours.
            </p>
            <div className="glass border border-secondary/30 rounded-xl p-4 mb-6">
              <p className="text-secondary text-sm">
                <strong>Note:</strong> You must verify your email before you can log in.
              </p>
            </div>

            {/* Resend verification section */}
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3">
                Didn't receive the email?
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full px-4 py-2 glass border border-white/10 text-slate-200 font-medium rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
              {resendMessage && (
                <p className={`mt-2 text-sm ${resendMessage.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                  {resendMessage}
                </p>
              )}
            </div>

            <Link
              href="/login"
              className="inline-block w-full px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="mt-1 text-sm text-red-400">
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Username Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="username"
            className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
          >
            Chronicler Name
          </label>
          <div className="relative">
             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">person_book</span>
            <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full bg-black/30 border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-0 focus:outline-none input-glow transition-all ${
                validationErrors.username ? 'border-red-500/50' : ''
                }`}
                placeholder="e.g. Alistair Thorne"
                disabled={isLoading}
            />
          </div>
          {validationErrors.username && (
            <p className="mt-1 text-sm text-red-400">
              {validationErrors.username}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
          >
            Secret Phrase
          </label>
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
            <p className="mt-1 text-sm text-red-400">
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1"
          >
            Confirm Secret Phrase
          </label>
           <div className="relative">
             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">verified_user</span>
            <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full bg-black/30 border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:ring-0 focus:outline-none input-glow transition-all ${
                validationErrors.confirmPassword ? 'border-red-500/50' : ''
                }`}
                placeholder="••••••••"
                disabled={isLoading}
            />
           </div>
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* API Error Display */}
        {error && (
          <div className="p-3 glass border border-red-500/50 rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-red-400 text-[20px]">error</span>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-cosmic py-4 rounded-xl text-white font-bold uppercase tracking-[0.2em] text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Initiate Journey"}
        </button>

        {/* Login Link */}
        <div className="mt-10 text-center">
             <Link
                href="/login"
                className="text-slate-400 hover:text-white text-sm transition-colors border-b border-transparent hover:border-primary pb-0.5"
            >
                Already a Chronicler? <span className="text-primary font-semibold">Login</span>
            </Link>
        </div>
      </form>
    </div>
  );
}
