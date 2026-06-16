'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '../../store/useUserStore';
import { ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const login = useUserStore((state) => state.login);
  const router = useRouter();

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
      router.push(redirect || '/');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/50 rotate-45" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-amber-400/30 rotate-12" />
      <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-amber-400/40 rotate-45" />
      <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-orange-500/40 rotate-45" />


      {/* Main Card */}
      <div className="w-full max-w-[500px] bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-12 relative z-10 flex flex-col items-center">

        {!showEmailForm ? (
          <>
            {/* Card Logo: betopia daily */}
            <div className="mb-18 flex flex-col items-center -mt-24 h-14 w-48">
              <img
                src="/mainLogo.png"
                alt="Betopia Logo"
                className="cover"
              />
            </div>

            {/* Text Content */}
            <h1 className="text-[26px] font-bold text-gray-900 mb-4 tracking-tight">Welcome to Betopia Daily</h1>
            <p className="text-base text-gray-500 text-center mb-12 max-w-[320px] leading-relaxed">
              Sign in with your organizational account to continue
            </p>

            {/* SSO Button */}
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full bg-[#FA8B24] hover:bg-[#E87A13] text-white font-semibold text-lg py-4 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <svg viewBox="0 0 88 88" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 12.402l35.687-4.86v34.22H0V12.402zm35.687 33.155v34.406L0 75.14V45.557h35.687zM39.638 6.425L88 0v41.76H39.638V6.425zm0 39.132H88V88L39.638 81.65V45.557z" />
              </svg>
              Sign in with Betopia SSO
            </button>

            {/* Security Footer */}
            <div className="mt-10 flex items-center gap-2 text-gray-400">
              <ShieldCheck size={16} />
              <span className="text-sm font-medium">Secured by Microsoft Entra ID</span>
            </div>
          </>
        ) : (
          <div className="w-full">
            <button
              onClick={() => setShowEmailForm(false)}
              className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors"
            >
              <ArrowLeft size={16} /> Back to SSO
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign in with Email</h2>

            <form onSubmit={handleEmailLogin} className="space-y-6">
              {error && (
                <div className="p-4 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl text-sm font-semibold text-center flex items-center justify-center gap-2">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. your.name@betopiagroup.com"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-900 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-medium placeholder-gray-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-900 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-medium placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-black/10 transition-all transform hover:-translate-y-1 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-4"
              >
                {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} className={isLoading ? "animate-pulse" : "group-hover:translate-x-1 transition-transform"} />
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Page Footer */}
      <div className="mt-12 flex items-center gap-2 text-md font-medium text-gray-500">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
        <span>© 2026 Betopia Daily. All rights reserved.</span>
        <span className="text-gray-300">|</span>
        <span>Version 2.8</span>
      </div>
    </div>
  );
}