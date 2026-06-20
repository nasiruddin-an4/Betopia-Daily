'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  ExternalLink,
  Briefcase,
  Building2,
  Wallet,
  Heart,
  RotateCcw,
  Home,
  CheckCircle2,
  ChevronRight,
  LogOut,
  FileText,
  ArrowRight,
  X,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const getImageUrl = (url) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const host = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.betopiadaily.shop/api/v1/').split('/api')[0];
  return `${host}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function ProfilePage() {
  const { user, isAuthenticated, accessToken, updateUser } = useUserStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  const handleSavePhone = async () => {
    if (!editPhone.trim()) {
      alert("Please enter a valid phone number");
      return;
    }

    setIsSavingPhone(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.betopiadaily.shop/api/v1/'}profile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          email: user.email,
          user_type: user.user_type || 'employee',
          company: user.company || '',
          employee_id: user.employee_id ? parseInt(user.employee_id) : null,
          company_address: user.company_address || '',
          avatar: user.avatar || '',
          phone: editPhone,
          access_token: accessToken
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedProfile = data.data || data;
        updateUser({ phone: updatedProfile.phone || editPhone });
        setIsEditingPhone(false);
      } else {
        const errText = await res.text();
        console.error('Phone update failed:', res.status, errText);
        alert(`Failed to update phone number: ${errText}`);
      }
    } catch (error) {
      console.error('Error updating phone:', error);
      alert('An error occurred while saving.');
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    updateUser({ avatar: previewUrl });
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('email', user.email);
      formData.append('user_type', user.user_type || 'employee');
      formData.append('company', user.company || '');
      if (user.employee_id) formData.append('employee_id', user.employee_id);
      formData.append('company_address', user.company_address || '');
      formData.append('phone', user.phone || '');
      formData.append('access_token', accessToken);
      formData.append('avatar', file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.betopiadaily.shop/api/v1/'}profile/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      if (res.ok) {
        // Fetch the updated profile via GET to retrieve the true remote avatar URL
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.betopiadaily.shop/api/v1/'}profile/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          const profiles = Array.isArray(profileJson) ? profileJson
            : profileJson?.data ? (Array.isArray(profileJson.data) ? profileJson.data : [profileJson.data])
              : profileJson?.results ? profileJson.results
                : [profileJson];

          const profileData = profiles.find(p => p.email === user.email) || profiles[0] || null;
          if (profileData && profileData.avatar) {
            updateUser({ avatar: profileData.avatar });
          } else {
            updateUser({ avatar: previewUrl });
          }
        } else {
          updateUser({ avatar: previewUrl });
        }
      } else {
        const errText = await res.text();
        console.error('Avatar upload failed:', res.status, errText);
        alert(`Failed to upload profile image. ${res.status}: ${errText}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('An error occurred while uploading.');
    } finally {
      setIsUploading(false);
    }
  };
  const { orders, fetchOrders } = useOrderStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [eligibility, setEligibility] = useState(null);
  const [loadingElig, setLoadingElig] = useState(false);

  useEffect(() => {
    async function fetchEligibility() {
      if (!accessToken || !isAuthenticated) return;
      setLoadingElig(true);
      try {
        const res = await fetch(`/api/erp/advance-salary/eligibility/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          }
        });
        if (res.ok) {
          const data = await res.json();
          setEligibility(data.eligibility || data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingElig(false);
      }
    }
    if (activeTab === 'overview' || activeTab === 'information') {
      fetchEligibility();
    }
  }, [activeTab, accessToken, isAuthenticated]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && accessToken) {
      fetchOrders(accessToken);
    }
  }, [mounted, isAuthenticated, accessToken, fetchOrders]);

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

  const sidebarMenu = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span className="w-5 flex justify-center text-gray-400">
          <FileText size={14} />
        </span>
        <span className="text-xs font-bold text-gray-500">{label}</span>
      </div>
      <span className="text-xs font-bold text-gray-900 text-right max-w-[50%]">{value}</span>
    </div>
  );

  return (
    <div className="container mx-auto px-4 space-y-8">

      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        {/* Abstract background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-amber-50/50 to-white opacity-80"></div>
        <div className="absolute top-0 right-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, orange 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#FA8B24]/10 to-amber-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center gap-8">

          {/* User Profile Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative group shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="w-28 h-28 rounded-full border-4 border-white bg-white flex items-center justify-center text-[#FA8B24] text-4xl font-black shadow-lg overflow-hidden relative">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className={`w-full h-full object-cover ${isUploading ? 'opacity-50' : ''}`} />
                ) : (
                  <span className={isUploading ? 'opacity-50' : ''}>{user.name[0]}</span>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                    <div className="w-6 h-6 border-2 border-[#FA8B24] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-100 text-gray-500 hover:text-[#FA8B24] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Edit2 size={14} />
              </button>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                <span className="bg-orange-100 text-[#FA8B24] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-widest">
                  Verified
                </span>
              </div>
              <p className="text-sm font-bold text-gray-600 mb-4">
                {eligibility?.designation || 'Employee'} • {user?.company || 'Betopia Group'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-bold text-gray-500">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                  <Mail size={14} className="text-[#FA8B24]" />
                  {user.email || 'N/A'}
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                  <Phone size={14} className="text-[#FA8B24]" />
                  {user.phone || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Area */}
          <div className="flex items-center gap-8 bg-white/60 backdrop-blur-md px-8 py-5 rounded-2xl border border-white/50 shadow-sm">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-[#FA8B24] mb-2">
                <Package size={18} />
              </div>
              <div className="text-xl font-black text-gray-900">{orders.length}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Orders Total</div>
            </div>

            <div className="w-px h-16 bg-gray-200/60"></div>

            <div className="text-center">
              <div className="w-10 h-10 mx-auto bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-purple-500 mb-2">
                <Heart size={18} />
              </div>
              <div className="text-xl font-black text-gray-900">12</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Wishlist Items</div>
            </div>

            <div className="w-px h-16 bg-gray-200/60"></div>

            <div className="text-center">
              <div className="w-10 h-10 mx-auto bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-blue-500 mb-2">
                <Wallet size={18} />
              </div>
              <div className="text-xl font-bold text-gray-900">৳ {eligibility?.eligible_amount ? eligibility.eligible_amount.toLocaleString() : '0.00'}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Eligible Advance Amount</div>
            </div>


          </div>

        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-28">
            <nav className="space-y-1">
              {sidebarMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                    ? 'bg-gradient-to-r from-[#FA8B24] to-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-gray-500 hover:bg-orange-50 hover:text-[#FA8B24]'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}

              <div className="pt-1 mt-2 border-t border-gray-100">
                <button className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9">

          {/* Overview Dashboard */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-500">

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column (Info Cards) */}
                <div className="xl:col-span-2 space-y-6">

                  <div className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FA8B24]">
                        <User size={18} />
                      </div>
                      <h2 className="text-sm font-black text-gray-900 tracking-tight">Personal Information</h2>
                    </div>

                    <div className="space-y-1">
                      <InfoRow label="Full Name" value={eligibility?.employee_name || user?.name || 'N/A'} />
                      <InfoRow label="Employee ID" value={eligibility?.employee_id_no || user?.employee_id || 'N/A'} />
                      <InfoRow label="Email Address" value={user?.email || 'N/A'} />

                      {isEditingPhone ? (
                        <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            <span className="w-5 flex justify-center text-gray-400">
                              <FileText size={14} />
                            </span>
                            <span className="text-xs font-bold text-gray-500">Contact Number</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="border border-gray-200 rounded px-2 py-1 text-xs font-bold text-gray-900 w-32 outline-none focus:border-[#FA8B24]"
                              placeholder="+880..."
                            />
                            <button onClick={handleSavePhone} disabled={isSavingPhone} className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors disabled:opacity-50">
                              <CheckCircle2 size={16} />
                            </button>
                            <button onClick={() => setIsEditingPhone(false)} disabled={isSavingPhone} className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors disabled:opacity-50">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 last:pb-0 group/phone">
                          <div className="flex items-center gap-3">
                            <span className="w-5 flex justify-center text-gray-400">
                              <FileText size={14} />
                            </span>
                            <span className="text-xs font-bold text-gray-500">Contact Number</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-900 text-right">{user?.phone || 'N/A'}</span>
                            <button onClick={() => { setEditPhone(user?.phone || ''); setIsEditingPhone(true); }} className="text-gray-400 hover:text-[#FA8B24] opacity-0 group-hover/phone:opacity-100 transition-all">
                              <Edit2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                      <InfoRow label="Company Name" value={user?.company || 'N/A'} />
                      <InfoRow label="Office Location" value={user?.company_address || 'N/A'} />
                    </div>
                  </div>



                </div>

                {/* Right Column (Advance & Actions) */}
                <div className="space-y-6">



                  {/* Recent Orders Overview */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-sm font-black text-gray-900 tracking-tight">Recent Orders</h2>
                      <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-gray-500 hover:text-[#FA8B24] flex items-center gap-1 transition-colors">
                        View All Orders <ArrowRight size={14} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      {orders.slice(0, 3).map((order) => (
                        <div 
                          key={order.order_id} 
                          onClick={() => {
                            setActiveTab('orders');
                            setExpandedOrders(new Set([order.order_id])); // Auto-expand this specific order
                            // small scroll to top just in case
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="cursor-pointer bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col justify-between group hover:border-[#FA8B24]/30 hover:bg-orange-50/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-white rounded-xl p-1 border border-gray-200 shrink-0">
                              <img src={getImageUrl(order.items[0]?.product_image || order.items[0]?.product?.image_url)} alt="Product" className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border mb-2 ${
                                order.status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                                order.status.toLowerCase() === 'rejected' || order.status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-orange-100 text-orange-700 border-orange-200'
                                }`}>
                                {order.status}
                              </span>
                              <div className="text-[10px] font-bold text-gray-500 mb-0.5">Order #{order.order_number || order.order_id || 'Pending'}</div>
                              <div className="text-[9px] font-bold text-gray-400">{new Date(order.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm font-black text-gray-900">৳ {order.total_amount.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="text-center py-6 text-sm font-bold text-gray-400">
                          No recent orders found.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* Order History View */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 animate-in fade-in duration-300 min-h-[500px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order History</h2>
                  <p className="text-sm font-medium text-gray-400 mt-1">Here you can manage your orders and track their status</p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FA8B24] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search for Order ID or Product"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-[#FA8B24] focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-gray-900"
                  />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                  <Filter size={18} /> Filters
                </button>
              </div>

              {/* Orders Table */}
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
                              className={`group hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-orange-50/30' : ''}`}
                            >
                              <td className="py-6 pl-4 font-bold text-gray-900">
                                <div className="flex items-center gap-3">
                                  <div className={`p-1 rounded border border-transparent group-hover:border-gray-200 transition-all ${isExpanded ? 'rotate-180 bg-white border-gray-200' : ''}`}>
                                    <ChevronDown size={14} className="text-gray-400" />
                                  </div>
                                  {order.order_number || order.order_id || 'Pending'}
                                </div>
                              </td>
                              <td className="py-6 text-sm font-medium text-gray-500">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-6">
                                <div className="flex items-center">
                                  <div className="flex -space-x-2 mr-3">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                      <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center overflow-hidden relative shadow-sm" style={{ zIndex: 3 - idx }}>
                                        <img src={getImageUrl(item.product_image || item.product?.image_url)} alt="product" className="w-full h-full object-contain p-0.5" />
                                      </div>
                                    ))}
                                    {order.items.length > 3 && (
                                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center relative shadow-sm" style={{ zIndex: 0 }}>
                                        <span className="text-[9px] font-bold text-gray-500">+{order.items.length - 3}</span>
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-sm font-bold text-gray-900">{order.items.length}</span>
                                </div>
                              </td>
                              <td className="py-6 text-sm font-bold text-gray-900">
                                ৳ {order.total_amount.toLocaleString()}
                              </td>
                              <td className="py-6 text-center">
                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${order.status.toLowerCase() === 'delivered'
                                    ? 'bg-green-50 text-green-600 border-green-100'
                                    : order.status.toLowerCase() === 'rejected' || order.status.toLowerCase() === 'cancelled'
                                      ? 'bg-red-50 text-red-600 border-red-100'
                                      : 'bg-amber-50 text-amber-600 border-amber-100'
                                  }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-6 text-right pr-4">
                                <button className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-[#FA8B24] hover:text-[#FA8B24] transition-all">
                                  Details
                                </button>
                              </td>
                            </tr>
                            {/* Expanded details view */}
                            {isExpanded && (
                              <tr className="bg-gray-50/30 animate-in slide-in-from-top-2 duration-300">
                                <td colSpan="6" className="p-0">
                                  <div className={`px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 border-l-4 ml-4 mb-6 mt-2 bg-white rounded-2xl shadow-inner mx-4 ${order.status.toLowerCase() === 'rejected' ? 'border-red-500' : 'border-[#FA8B24]'
                                    }`}>
                                    {order.status.toLowerCase() === 'rejected' && (
                                      <div className="col-span-full bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 mb-2">
                                        <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                          <h4 className="text-[11px] font-bold text-red-800 uppercase tracking-widest mb-1">Rejection Note</h4>
                                          <p className="text-md font-medium text-red-600">{order.reject_note || 'No reason provided by admin.'}</p>
                                        </div>
                                      </div>
                                    )}

                                    <div>
                                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shipping address</h4>
                                      <p className="text-xs font-bold text-gray-800 leading-relaxed">{order.delivery_address || order.user?.company_address || 'Not specified'}</p>
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
                                      <p className="text-xs font-bold text-gray-800 capitalize">{order.payment_method || 'Salary Credit'}</p>
                                    </div>

                                    {/* Items mini-list inside expansion */}
                                    <div className="col-span-full pt-6 border-t border-gray-100">
                                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Ordered Items</h4>
                                      <div className="flex flex-wrap gap-4">
                                        {order.items.map((item, idx) => (
                                          <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 pr-4 rounded-xl border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-lg p-1 border border-gray-100">
                                              <img src={getImageUrl(item.product_image || item.product?.image_url)} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                              <p className="text-[10px] font-bold text-gray-800 truncate max-w-[120px]">{item.product_name || item.product?.name || 'Product'}</p>
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
          )}

        </div>
      </div>
    </div>
  );
}
