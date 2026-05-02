'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '../../store/useUserStore';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useUserStore((state) => state.login);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!employeeId || !password) {
      setError('Please enter both Employee ID and Password');
      return;
    }
    
    const success = login(employeeId, password);
    if (success) {
      router.push(redirect || '/');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-3xl flex items-center justify-center text-black font-bold text-4xl shadow-2xl shadow-amber-500/30 mx-auto mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            B
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to Betopia<span className="text-amber-500">Daily</span></h1>
          <p className="text-gray-500 font-medium mt-3">Sign in with your Betopia ERP credentials</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl text-sm font-semibold text-center flex items-center justify-center gap-2">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-gray-700 ml-1">
                Employee ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-9921"
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

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <ShieldCheck size={16} className="text-green-500" /> Secure Login
              </div>
              <a href="#" className="text-sm font-bold text-amber-600 hover:text-amber-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-black/10 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group mt-4"
            >
              Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-10 text-sm font-medium text-gray-400">
          Internal platform for Betopia Group employees only.<br />
          Contact IT support for access issues.
        </p>
      </div>
    </div>
  );
}

