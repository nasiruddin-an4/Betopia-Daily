'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 pt-16 pb-12 relative overflow-hidden">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-1 flex flex-col space-y-4">
            <Link href="/" className="inline-block mb-4">
              <img src="/mainLogo.svg" alt="Betopia Daily" className="h-7 w-auto object-contain filter invert brightness-0" style={{ filter: 'brightness(0) invert(1)' }} />
            </Link>

            <h4 className="font-bold text-white text-[15px]">Always Here for You</h4>
            <div className="text-[12px] text-gray-400 leading-relaxed space-y-1 font-medium">
              <p>Call Us: 09611 020 888 (8am-10pm, Everyday)</p>
              <p>Email Us: daily@betopia.com</p>
              <p className="uppercase mt-2">BETOPIA GROUP E-COMMERCE LIMITED</p>
            </div>
          </div>



          {/* Group: Customer Service & My Account */}
          <div className="grid grid-cols-2 gap-4 lg:gap-8 lg:col-span-2">
            {/* Column 3: Customer Service */}
            <div>
              <h4 className="font-bold text-white text-[15px] mb-5">Customer Service</h4>
              <ul className="space-y-3.5">
                <li><Link href="#" className="text-[13px] text-gray-400 font-medium hover:text-[#FA8B24] transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="text-[13px] text-gray-400 font-medium hover:text-[#FA8B24] transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-[13px] text-gray-400 font-medium hover:text-[#FA8B24] transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Column 4: My Account */}
            <div>
              <h4 className="font-bold text-white text-[15px] mb-5">My Account</h4>
              <ul className="space-y-3.5">
                <li><Link href="/orders" className="text-[13px] text-gray-400 font-medium hover:text-[#FA8B24] transition-colors">Order History</Link></li>
                <li><Link href="/profile" className="text-[13px] text-gray-400 font-medium hover:text-[#FA8B24] transition-colors">Personal Info</Link></li>
                <li><Link href="/wishlist" className="text-[13px] text-gray-400 font-medium hover:text-[#FA8B24] transition-colors">Wishlist</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 5: Payment & Social */}
          <div className="lg:col-span-1">
            {/* Pay With */}
            <h4 className="font-bold text-white text-[15px] mb-4">Pay With</h4>
            <div className="flex flex-wrap gap-2 mb-8">
              <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-red-500">MasterCard</span>
              </div>
              <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-blue-600">VISA</span>
              </div>
              <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-orange-500">Discover</span>
              </div>
              <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-blue-400">AMEX</span>
              </div>
              <div className="h-6 w-10 bg-white border border-gray-200 rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-pink-600">bKash</span>
              </div>
            </div>

            {/* Follow Us */}
            <h4 className="font-bold text-white text-[15px] mb-4">Follow Us</h4>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 bg-[#3b5998] text-white rounded flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-[#ff0000] text-white rounded flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white rounded flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] font-medium text-gray-400 text-center md:text-left">
            © {new Date().getFullYear()} Betopia Daily. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[13px] font-medium text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
