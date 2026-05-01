'use client';

import React from 'react';
import { X, User, Briefcase, Mail, Phone, MapPin, Wallet, ShieldCheck } from 'lucide-react';

export default function ProfileModal({ user, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-red-600 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold border border-white/30">
              {user.name[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
              <p className="text-red-100 font-medium text-sm uppercase tracking-widest">{user.erp_employee_id}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <Briefcase size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</p>
                <p className="font-bold text-gray-900">{user.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                <p className="font-bold text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Point</p>
                <p className="font-bold text-gray-900">{user.delivery_address}</p>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Salary Credit</p>
                <p className="text-xl font-bold text-gray-900">৳ {user.salary_credit_balance.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">
              Active
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <ShieldCheck size={14} className="text-green-500" /> Verified Betopia Employee Profile
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
           <button 
            onClick={onClose}
            className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all active:scale-95"
           >
             Close Profile
           </button>
        </div>
      </div>
    </div>
  );
}

