'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { useUserStore } from '../../store/useUserStore';
import { ShoppingCart, User, LogOut, Search, Menu, X, Heart, ChevronDown, UserCircle, Settings, Wallet } from 'lucide-react';
import ProfileModal from './ProfileModal';

export default function Navbar() {
  const pathname = usePathname();
  const { items, getCartTotal } = useCartStore();
  const { user, logout } = useUserStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dropdownRef = useRef(null);
  const cartCount = items.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user && pathname === '/login') return null;

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 py-3">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl italic shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
              B
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tighter">Betopia<span className="text-red-600"> Daily</span></span>
          </Link>

          {/* Search - Central */}
          <div className="hidden md:flex flex-1 max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for groceries, fish, meat..."
              className="w-full bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium transition-all outline-none"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Link href="/orders" className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all relative">
                  <Heart size={22} />
                </Link>

                <Link href="/cart" className="p-2.5 bg-gray-900 text-white rounded-md transition-all relative hover:scale-105 active:scale-95 flex items-center gap-2 group">
                  <ShoppingCart size={20} />
                  <span className="absolute -top-2 -right-2 bg-white text-red-600 text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-red-600 shadow-sm">
                    {cartCount}
                  </span>
                </Link>

                <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>

                {/* Profile Dropdown Trigger */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {user.name[0]}
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in slide-in-from-top-2 duration-200">
                      <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                        <p className="font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs font-bold text-red-600 mt-1">{user.erp_employee_id}</p>
                      </div>

                      {/* Balance Section - Moved Here */}
                      <div className="p-4 bg-gray-900 mx-2 mt-2 rounded-xl flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <Wallet size={16} className="text-red-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Balance</p>
                            <p className="text-sm font-bold italic">৳ {user.salary_credit_balance.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => { setIsModalOpen(true); setIsProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                        >
                          <UserCircle size={18} />
                          View Profile
                        </button>
                        <Link
                          href="/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                        >
                          <ShoppingCart size={18} />
                          My Orders
                        </Link>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 cursor-not-allowed rounded-xl transition-colors">
                          <Settings size={18} />
                          Settings
                        </button>
                      </div>

                      <div className="p-2 border-t border-gray-50">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/login">
                <button className="bg-gray-900 text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-black transition-all">
                  Sign In
                </button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-4 shadow-xl z-50">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-50 rounded-xl py-3 px-4 text-sm font-medium outline-none"
            />
            <Link href="/shop" className="font-bold text-gray-700 py-2">Shop All</Link>
            <Link href="/orders" className="font-bold text-gray-700 py-2">My Orders</Link>
            <Link href="/demand" className="font-bold text-gray-700 py-2">Demand Schedule</Link>
            {user && (
              <>
                <div className="py-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Balance</span>
                  <span className="font-bold text-gray-900 text-lg">৳ {user.salary_credit_balance.toLocaleString()}</span>
                </div>
                <button
                  onClick={logout}
                  className="font-bold text-red-600 py-2 text-left"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {user && (
        <ProfileModal
          user={user}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </nav>
  );
}

