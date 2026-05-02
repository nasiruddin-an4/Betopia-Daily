"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "../../store/useCartStore";
import { useUserStore } from "../../store/useUserStore";
import { useSidebarStore } from "../../store/useSidebarStore";
import {
  ShoppingCart,
  User,
  LogOut,
  Search,
  Menu,
  X,
  Heart,
  ChevronDown,
  UserCircle,
  Settings,
  Wallet,
} from "lucide-react";
import CartSidebar from "../../components/CartSidebar";

export default function Navbar() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const { user, isAuthenticated, logout } = useUserStore();
  const { isCartOpen, openCart, closeCart } = useSidebarStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

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

  // Don't show full navbar on login page if not logged in
  if (!user && pathname === "/login") return null;

  return (
    <>
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black font-bold text-xl italic shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                B
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tighter">
                Betopia<span className="text-amber-500"> Daily</span>
              </span>
            </Link>

            {/* Search - Central */}
            <div className="hidden md:flex flex-1 max-w-xl relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search
                  size={18}
                  className="text-gray-400 group-focus-within:text-amber-500 transition-colors"
                />
              </div>
              <input
                type="text"
                placeholder="Search for groceries, fish, meat..."
                className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-500/20 focus:bg-white rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium transition-all outline-none"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Cart Toggle Button - Always Visible */}
              <button
                onClick={openCart}
                id="cart-trigger"
                className="p-2.5 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all relative flex items-center gap-2 group"
              >
                <ShoppingCart
                  size={22}
                  className="group-hover:scale-110 transition-transform"
                />

                {cartCount > 0 && (
                  <span className="absolute -top-0 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block"></div>

              {isAuthenticated && user ? (
                <>
                  {/* Profile Dropdown Trigger */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                        {user.name[0]}
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in slide-in-from-top-2 duration-200">
                        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Signed in as
                          </p>
                          <p className="font-bold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs font-bold text-amber-600 mt-1">
                            {user.erp_employee_id}
                          </p>
                        </div>

                        {/* Balance Section */}
                        <div className="p-3">
                          <div className="flex items-center justify-between bg-amber-50/50 rounded-xl p-3 border border-amber-100/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                <Wallet size={16} className="text-amber-500" />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                  Balance
                                </p>
                                <p className="text-sm font-bold italic">
                                  ৳ {user.salary_credit_balance.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />
                          </div>
                        </div>

                        <div className="p-2">
                          <Link
                            href="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                          >
                            <UserCircle size={18} />
                            My Profile
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                          >
                            <Package size={18} />
                            My Orders
                          </Link>
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
                  <button className="bg-amber-600 text-white font-bold py-2.5 px-6 rounded-md text-sm hover:bg-black transition-all">
                    Sign In
                  </button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-4 shadow-xl z-50 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="font-bold text-gray-700 py-2 hover:text-red-600 transition-colors"
              >
                Home
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  openCart();
                }}
                className="font-bold text-gray-700 py-2 hover:text-red-600 transition-colors text-left"
              >
                View Cart
              </button>
              {user && (
                <>
                  <Link
                    href="/profile"
                    className="font-bold text-gray-700 py-2 hover:text-amber-500 transition-colors"
                  >
                    My Orders
                  </Link>
                  <div className="py-2 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                      Balance
                    </span>
                    <span className="font-bold text-gray-900 text-lg">
                      ৳ {user.salary_credit_balance.toLocaleString()}
                    </span>
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


      </nav>
      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
    </>
  );
}
