"use client";

import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../lib/msalConfig";

export default function LoginModal({ isOpen, onClose }) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { instance } = useMsal();

  const handleSSOLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Navigates the current tab to Microsoft's login page.
      // The token is captured in MsalProviderWrapper when the page reloads.
      await instance.loginRedirect(loginRequest);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      if (e.name !== 'BrowserAuthError') {
        setError('Failed to sign in with Microsoft.');
      }
    }
  };

  if (!isOpen) return null;

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

            {error && (
              <div className="w-full mb-4 p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {/* SSO Button */}
            <button
              onClick={handleSSOLogin}
              disabled={isLoading}
              className="w-full bg-[#FA8B24] hover:bg-[#E87A13] text-white font-semibold text-base py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-pulse">Connecting...</span>
              ) : (
                <>
                  <svg viewBox="0 0 88 88" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 12.402l35.687-4.86v34.22H0V12.402zm35.687 33.155v34.406L0 75.14V45.557h35.687zM39.638 6.425L88 0v41.76H39.638V6.425zm0 39.132H88V88L39.638 81.65V45.557z" />
                  </svg>
                  Sign in with Betopia SSO
                </>
              )}
            </button>

            {/* Security Footer */}
            <div className="mt-8 flex items-center gap-2 text-gray-400">
              <ShieldCheck size={14} />
              <span className="text-xs font-medium">Secured by Microsoft Entra ID</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
