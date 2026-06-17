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
  Package,
  Users,
  Mic,
  ArrowRight,
  Tag,
  LayoutGrid,
  Truck,
  BadgePercent,
  Headphones,
  Phone,
  Flame,
  Zap,
  ClipboardList,
  Info,
  Shield,
  MapPin,
  RotateCcw,
} from "lucide-react";
import CartSidebar from "../../components/CartSidebar";
import LoginModal from "./LoginModal";

export default function Navbar() {
  const pathname = usePathname();
  const { items } = useCartStore();
  const { user, isAuthenticated, logout, isAdmin } = useUserStore();
  const { isCartOpen, openCart, closeCart, isLoginModalOpen, openLoginModal, closeLoginModal } = useSidebarStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const userIsAdmin = isAdmin();

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

  const profileMenuItems = [
    { icon: <Package size={18} />, label: "Order History", href: "/orders" },
    { icon: <User size={18} />, label: "Personal Info", href: "/profile" },
    { icon: <Heart size={18} />, label: "Wishlist", href: "/wishlist" },
  ];

  return (
    <>
      <nav className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Tier */}
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Logo & Main Nav */}
            <div className="flex items-center shrink-0 gap-8">
              <Link href="/" className="flex items-center h-10 w-auto">
                <img src="/mainLogo.svg" alt="Betopia Daily" className="h-7 w-auto" />
              </Link>
              <Link href="/shop" className="hidden md:flex items-center gap-2 text-gray-800 font-bold hover:text-brand-bright-orange transition-colors">
                <LayoutGrid size={16} />
                Shop
              </Link>
            </div>

            {/* Search - Central */}
            <div className="hidden md:flex flex-1 max-w-3xl relative mx-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for groceries, fish, meat..."
                className="w-full bg-white border border-gray-200 rounded-md py-2.5 pl-10 pr-16 text-sm font-medium transition-all outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                <Mic size={16} className="text-[#0D9488] cursor-pointer hover:text-teal-700" />
                <ArrowRight size={16} className="text-[#0D9488] cursor-pointer hover:text-teal-700" />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Mobile Search Toggle (Moved to Sidebar) */}

              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  {/* Cart Toggle Button */}
                  <button
                    onClick={openCart}
                    id="cart-trigger"
                    className="p-2 text-gray-700 hover:text-[#0D9488] transition-all relative flex items-center"
                  >
                    <ShoppingCart size={22} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                  {/* User Profile Button - Icon + First Name with Dropdown */}
                  <div className="relative hidden md:block" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-bright-orange/10 border border-brand-bright-orange/20 flex items-center justify-center text-brand-bright-orange font-bold text-sm">
                        {user.first_name?.[0] || user.name?.[0] || 'U'}
                      </div>
                      <span className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                        {user.first_name || user.name?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
                        {/* User Info Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/80">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-bright-orange/10 border border-brand-bright-orange/20 flex items-center justify-center text-brand-bright-orange font-bold text-base">
                              {user.first_name?.[0] || user.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">
                                {user.name || user.first_name || 'User'}
                              </p>
                              <p className="text-[11px] text-gray-500 truncate">
                                ID: {user.employee_id || user.erp_employee_id || '—'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1.5">
                          {profileMenuItems.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-red-500">{item.icon}</span>
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 py-1.5">
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={18} />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Cart Toggle Button for Unauthenticated */}
                  <button
                    onClick={openCart}
                    id="cart-trigger-unauth"
                    className="p-2 text-gray-700 hover:text-[#0D9488] transition-all relative flex items-center"
                  >
                    <ShoppingCart size={22} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <div className="hidden sm:flex items-center">
                    <button onClick={openLoginModal} className="bg-brand-bright-orange hover:bg-brand-coral text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors">
                      Login
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>



        {/* Mobile Menu Sidebar */}
        <div className={`md:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          
          {/* Sidebar */}
          <div className={`absolute top-0 right-0 h-full w-4/5 max-w-[320px] bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <span className="text-xl font-bold text-gray-900">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            {/* Mobile User Info */}
            {user && (
              <div className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-bright-orange/10 border border-brand-bright-orange/20 flex items-center justify-center text-brand-bright-orange font-bold text-lg">
                    {user.first_name?.[0] || user.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base truncate">
                      {user.name || user.first_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      ID: {user.employee_id || user.erp_employee_id || '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Mobile Search */}
              <div className="relative w-full mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for groceries..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-12 text-sm font-medium transition-all outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                  <Mic size={16} className="text-[#0D9488]" />
                </div>
              </div>
              <Link href="/" className="font-medium text-gray-700 hover:text-[#0D9488] transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <button onClick={() => { setIsMenuOpen(false); openCart(); }} className="font-medium text-gray-700 hover:text-[#0D9488] text-left transition-colors">View Cart</button>
              
              {user && (
                <>
                  {profileMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="font-medium text-gray-700 hover:text-[#0D9488] flex items-center gap-3 transition-colors"
                    >
                      <span className="text-brand-bright-orange">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="font-medium text-red-600 mt-auto pt-6 border-t border-gray-100 flex items-center gap-2 hover:text-red-700 transition-colors">
                    <LogOut size={18} /> Sign Out
                  </button>
                </>
              )}
              {!user && (
                <button onClick={() => { setIsMenuOpen(false); openLoginModal(); }} className="font-medium text-gray-700 hover:text-[#0D9488] text-left transition-colors">Login</button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <CartSidebar isOpen={isCartOpen} onClose={closeCart} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
