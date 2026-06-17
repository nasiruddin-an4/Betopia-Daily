"use client";

import React, { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { ArrowRight, ShieldCheck, ArrowLeft, X } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const login = useUserStore((state) => state.login);

  if (!isOpen) return null;

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both Email and Password');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <>
      {/* Full Page Backdrop Blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-[200] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl relative flex flex-col items-center overflow-hidden">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          {!showEmailForm ? (
            <div className="w-full flex flex-col items-center px-10 py-10">
              {/* Logo */}
              <div className="mb-6 h-10 flex items-center justify-center">
                <img
                  src="/mainLogo.svg"
                  alt="Betopia Daily"
                  className="h-full w-auto object-contain"
                />
              </div>

              {/* Divider */}
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-orange-300 to-transparent mb-6" />

              {/* Text */}
              <h1 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
              <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                Sign in with your organizational account to continue
              </p>

              {/* SSO Button */}
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full bg-[#FA8B24] hover:bg-[#E87A13] text-white font-semibold text-base py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <svg viewBox="0 0 88 88" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 12.402l35.687-4.86v34.22H0V12.402zm35.687 33.155v34.406L0 75.14V45.557h35.687zM39.638 6.425L88 0v41.76H39.638V6.425zm0 39.132H88V88L39.638 81.65V45.557z" />
                </svg>
                Sign in with Betopia SSO
              </button>

              {/* Security Footer */}
              <div className="mt-8 flex items-center gap-2 text-gray-400">
                <ShieldCheck size={14} />
                <span className="text-xs font-medium">Secured by Microsoft Entra ID</span>
              </div>
            </div>
          ) : (
            <div className="w-full px-10 py-10">
              {/* Back Button */}
              <button
                onClick={() => { setShowEmailForm(false); setError(''); }}
                className="mb-6 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 font-medium text-sm transition-colors"
              >
                <ArrowLeft size={15} /> Back
              </button>

              {/* Logo small */}
              <div className="mb-5 h-7 flex items-center">
                <img
                  src="/mainLogo.svg"
                  alt="Betopia Daily"
                  className="h-full w-auto object-contain"
                />
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-1">Sign in with Email</h2>
              <p className="text-sm text-gray-400 mb-6">Enter your credentials below</p>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-sm font-semibold text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.name@betopiagroup.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-all outline-none font-medium placeholder-gray-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-all outline-none font-medium placeholder-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-2"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                  <ArrowRight size={16} className={isLoading ? "animate-pulse" : "group-hover:translate-x-1 transition-transform"} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
