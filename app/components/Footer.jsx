'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Send, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/">
              <img src="/mainLogo.png" alt="Betopia Daily" className="h-16 w-auto" />
            </Link>

            <div className="space-y-2">
              <h4 className="text-gray-900 font-bold text-lg italic">Internal Employee Store</h4>
              <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs">
                Premium groceries and daily essentials exclusive to Betopia Group employees.
              </p>
            </div>

            <div className="flex items-center gap-5 text-gray-400 pt-2">
              <a href="#" className="hover:text-blue-600 transition-all transform hover:scale-110"><Globe size={20} strokeWidth={2.5} /></a>
              <a href="#" className="hover:text-blue-400 transition-all transform hover:scale-110"><Send size={20} strokeWidth={2.5} /></a>
            </div>
          </div>

          {/* Links Section 1 */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-gray-900 mb-6 text-sm">Get to Know Us</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-500 hover:text-red-600 text-sm font-semibold transition-colors">Blogs</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-red-600 text-sm font-semibold transition-colors">About</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-red-600 text-sm font-semibold transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Links Section 2 */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-gray-900 mb-6 text-sm">Customer Service</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-500 hover:text-red-600 text-sm font-semibold transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-red-600 text-sm font-semibold transition-colors">Terms and Conditions</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-red-600 text-sm font-semibold transition-colors">Shipping and Return Policy</Link></li>
            </ul>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-4">
            <h4 className="font-bold text-gray-900 mb-6 text-sm">Company Details</h4>
            <ul className="space-y-4">
              <li className="text-sm font-medium text-gray-500 flex flex-col gap-1">
                <span className="text-gray-500">Helpline: <span className="text-gray-900 font-bold">09611 020 888</span></span>
                <span className="text-gray-500">Email: <span className="text-gray-900 font-bold">daily@betopia.com</span></span>
                <span className="text-gray-500 mt-2 leading-relaxed">
                  Address: Hakim plaza, 22B Sonargaon road, Dhaka 1205P9VR+9R Dhaka, Bangladesh
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>


    </footer>
  );
}
