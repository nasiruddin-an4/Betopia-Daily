'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search, Menu, LogOut, Package } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const { user, isAuthenticated, logout } = useUserStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button className="p-2 -ml-2 md:hidden text-gray-500 hover:text-gray-900 transition-colors">
              <Menu size={24} />
            </button>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                B
              </div>
              <span className="font-bold text-2xl tracking-tight text-gray-900 hidden sm:block">
                Betopia<span className="text-blue-600 font-medium">Daily</span>
              </span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-12">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search products, categories..."
                className="w-full bg-gray-50 text-gray-900 border border-gray-200/80 rounded-2xl py-3 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder-gray-400 font-medium outline-none"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-5">
            <Link href="/cart" className="relative p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group">
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full shadow-sm shadow-blue-500/40 transform translate-x-1 -translate-y-1 animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </Link>
            
            <div className="flex items-center gap-4 pl-5 border-l border-gray-200">
              {isAuthenticated && user ? (
                <>
                  <Link href="/orders" className="hidden sm:flex p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all" title="My Orders">
                    <Package size={22} />
                  </Link>
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900">{user.name}</span>
                    <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md mt-0.5">
                      ৳ {user.salary_credit_balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative group/user cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-600 group-hover/user:ring-4 ring-gray-100 transition-all">
                      <User size={20} />
                    </div>
                    {/* Simple Dropdown on hover */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all transform origin-top-right translate-y-2 group-hover/user:translate-y-0 p-2">
                       <Link href="/orders" className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors md:hidden">
                         <Package size={16} /> My Orders
                       </Link>
                       <button onClick={logout} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                         <LogOut size={16} /> Sign Out
                       </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/login" className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-500/30">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

