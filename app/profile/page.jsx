'use client';

import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { useOrderStore } from '../../store/useOrderStore';
import { 
  User, 
  Package, 
  Settings, 
  Lock, 
  MapPin, 
  Bell, 
  CreditCard, 
  Search, 
  Filter, 
  ChevronDown, 
  Mail, 
  Phone,
  Edit2,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated } = useUserStore();
  const { orders } = useOrderStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'settings', 'password', 'orders', etc.

  useEffect(() => {
    setMounted(true);
  }, []);

  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const toggleOrder = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  if (!mounted || !user) return null;

  const tabs = [
    { id: 'settings', label: 'Account settings', icon: Settings },
    { id: 'password', label: 'Manage password', icon: Lock },
    { id: 'orders', label: 'Order history', icon: Package },
    { id: 'payment', label: 'Payment methods', icon: CreditCard },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'notifications', label: 'Notification', icon: Bell },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/20">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row md:items-end justify-between -mt-16 gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-amber-50 flex items-center justify-center text-amber-600 text-4xl font-bold shadow-xl overflow-hidden">
                   {user.name[0]}
                </div>
                <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-500 hover:text-amber-600 transition-colors">
                   <Edit2 size={16} />
                </button>
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{user.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm font-medium text-gray-500">
                   <div className="flex items-center gap-1.5">
                      <Mail size={16} />
                      {user.email || 'user@betopiagroup.com'}
                   </div>
                   <div className="flex items-center gap-1.5">
                      <Phone size={16} />
                      +880 1234-567890
                   </div>
                </div>
              </div>
            </div>
            <div className="pb-2 flex justify-center">
               <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all">
                  <MoreVertical size={20} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex flex-wrap gap-1 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-amber-50 text-amber-600 shadow-sm border border-amber-100/50' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 p-8 min-h-[500px]">
        {activeTab === 'orders' ? (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order history</h2>
                <p className="text-sm font-medium text-gray-400 mt-1">Here you can manage your orders and track their status</p>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search for Order ID or Product"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                <Filter size={18} /> Filters
              </button>
            </div>

            {/* Orders Table-style List */}
            <div className="overflow-x-auto -mx-8 px-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-4">Order ID</th>
                    <th className="pb-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="pb-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Items</th>
                    <th className="pb-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Total amount</th>
                    <th className="pb-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="pb-4 pt-2 text-xs font-bold text-gray-400 uppercase tracking-widest text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                          <Package size={32} />
                        </div>
                        <p className="text-gray-500 font-bold">No orders found</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const isExpanded = expandedOrders.has(order.order_id);
                      return (
                      <React.Fragment key={order.order_id}>
                        <tr 
                          onClick={() => toggleOrder(order.order_id)}
                          className={`group hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50/50' : ''}`}
                        >
                          <td className="py-6 pl-4 font-bold text-gray-900">
                             <div className="flex items-center gap-3">
                                <div className={`p-1 rounded border border-transparent group-hover:border-gray-200 transition-all ${isExpanded ? 'rotate-180 bg-white border-gray-200' : ''}`}>
                                   <ChevronDown size={14} className="text-gray-400" />
                                </div>
                                {order.order_number}
                             </div>
                          </td>
                          <td className="py-6 text-sm font-medium text-gray-500">
                             {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-6 text-sm font-bold text-gray-900">
                             {order.items.length}
                          </td>
                          <td className="py-6 text-sm font-bold text-gray-900">
                             ৳ {order.total_amount.toLocaleString()}
                          </td>
                          <td className="py-6 text-center">
                             <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                               order.status === 'Delivered' 
                                 ? 'bg-green-50 text-green-600 border-green-100' 
                                 : 'bg-amber-50 text-amber-600 border-amber-100'
                             }`}>
                               {order.status}
                             </span>
                          </td>
                          <td className="py-6 text-right pr-4">
                             <button className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-amber-500 hover:text-amber-600 transition-all">
                               Details
                             </button>
                          </td>
                        </tr>
                        {/* Expanded details view */}
                        {isExpanded && (
                          <tr className="bg-gray-50/30 animate-in slide-in-from-top-2 duration-300">
                            <td colSpan="6" className="p-0">
                              <div className="px-12 py-8 grid grid-cols-2 md:grid-cols-5 gap-8 border-l-4 border-amber-500 ml-4 mb-6 mt-2 bg-white rounded-2xl shadow-inner mx-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shipping address</h4>
                                    <p className="text-xs font-bold text-gray-800 leading-relaxed">{order.delivery_address}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Billing address</h4>
                                    <p className="text-xs font-bold text-gray-800">Same as shipping address</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shipping method</h4>
                                    <p className="text-xs font-bold text-gray-800">{order.shipping_method || 'Standard Delivery'}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment method</h4>
                                    <p className="text-xs font-bold text-gray-800">{order.payment_method}</p>
                                </div>
                                <div className="flex flex-col justify-between">
                                    <div>
                                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tracking number</h4>
                                      <p className="text-xs font-bold text-amber-600 flex items-center gap-1 group/track cursor-pointer">
                                        TRK-{order.order_id.slice(0,8).toUpperCase()}
                                        <ExternalLink size={10} className="group-hover/track:translate-x-0.5 group-hover/track:-translate-y-0.5 transition-transform" />
                                      </p>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                       <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"><MoreVertical size={16} /></button>
                                    </div>
                                </div>
                                
                                {/* Items mini-list inside expansion */}
                                <div className="col-span-full pt-6 border-t border-gray-100">
                                   <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Ordered Items</h4>
                                   <div className="flex flex-wrap gap-4">
                                      {order.items.map((item, idx) => (
                                         <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 pr-4 rounded-xl border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-lg p-1 border border-gray-100">
                                               <img src={item.product.image_url} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                               <p className="text-[10px] font-bold text-gray-800 truncate max-w-[120px]">{item.product.name}</p>
                                               <p className="text-[9px] font-bold text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'address' ? (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                   <MapPin size={100} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Primary Office</span>
                    <button className="text-amber-600 hover:text-amber-700 font-bold text-sm">Edit</button>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-amber-500 shrink-0">
                       <MapPin size={24} />
                    </div>
                    <div>
                       <p className="font-bold text-gray-900 text-lg mb-1">{user.name}</p>
                       <p className="text-gray-500 font-medium leading-relaxed max-w-xs">{user.delivery_address}</p>
                       <p className="text-gray-400 text-sm mt-4 font-bold tracking-tighter italic">Source: Betopia ERP System</p>
                    </div>
                  </div>
                </div>
              </div>

              <button className="border-2 border-dashed border-gray-100 rounded-[2rem] p-8 flex flex-col items-center justify-center text-gray-400 hover:border-amber-200 hover:text-amber-500 transition-all group">
                 <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-amber-50 transition-colors">
                    <Package size={24} />
                 </div>
                 <span className="font-bold text-sm">Add Temporary Address</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                <Settings size={40} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">{tabs.find(t => t.id === activeTab)?.label}</h3>
             <p className="text-gray-500 font-medium max-w-xs">This section is currently under maintenance. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
