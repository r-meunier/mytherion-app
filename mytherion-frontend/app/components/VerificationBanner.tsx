'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resendVerification } from '../store/authSlice';

export default function VerificationBanner() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  // Don't show banner if user is not logged in or email is already verified
  if (!user || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    setResending(true);
    setMessage('');
    
    try {
      await dispatch(resendVerification(user.email)).unwrap();
      setMessage('✓ Verification email sent! Check your inbox.');
    } catch (error: any) {
      setMessage(`✗ ${error || 'Failed to send email. Please try again.'}`);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-yellow-200 text-sm font-medium">
              Please verify your email address to access all features.
            </p>
          </div>
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-yellow-300 hover:text-yellow-100 text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
          >
            {resending ? 'Sending...' : 'Resend Email'}
          </button>
        </div>
        {message && (
          <p className={`text-center text-sm mt-2 ${message.startsWith('✓') ? 'text-green-300' : 'text-red-300'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
