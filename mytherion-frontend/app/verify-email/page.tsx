'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch } from '../store/hooks';
import { verifyEmail, clearError } from '../store/authSlice';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    dispatch(verifyEmail(token))
      .unwrap()
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully!');
        setTimeout(() => router.push('/'), 3000);
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error || 'Verification failed. The link may be expired or invalid.');
      });

    // Cleanup: Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [searchParams, dispatch, router]);

  const handleGoToLogin = () => {
    dispatch(clearError());
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md w-full p-8 bg-slate-800/40 backdrop-blur-sm border border-purple-500/30 rounded-lg shadow-xl">
        {status === 'verifying' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-purple-100 mb-6">Verifying Email...</h1>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
            </div>
            <p className="text-purple-300/80">Please wait while we verify your email address.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-green-400 mb-4">✓ Email Verified!</h1>
            <p className="text-purple-200 mb-2">{message}</p>
            <p className="text-purple-300/80 text-sm">Redirecting to home page...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-red-400 mb-4">✗ Verification Failed</h1>
            <p className="text-purple-200 mb-6">{message}</p>
            <button
              onClick={handleGoToLogin}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
