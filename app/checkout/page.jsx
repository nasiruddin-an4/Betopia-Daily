'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { useUserStore } from '../../store/useUserStore';
import { useOrderStore } from '../../store/useOrderStore';
import { ArrowLeft, CheckCircle2, Truck, Info, ShieldCheck, Mail, User, Phone, MapPin, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useSidebarStore } from '../../store/useSidebarStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user, deductSalaryCredit, isAuthenticated, accessToken } = useUserStore();
  const placeOrder = useOrderStore((state) => state.placeOrder);

  const [paymentMethod, setPaymentMethod] = useState('salary'); // 'salary' or 'bkash'
  const [mounted, setMounted] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/shop');
      useSidebarStore.getState().openLoginModal();
      return;
    }
    if (items.length === 0 && !orderSuccess) {
      router.push('/shop');
    }
  }, [items, router, orderSuccess, isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || '',
        email: user.email || (user.erp_employee_id ? `${user.erp_employee_id.toLowerCase()}@betopia.com` : ''),
        phone: user.phone || '',
        address: user.company_address || user.delivery_address || ''
      });
    }
  }, [user]);

  const subtotal = Number(useCartStore.getState().grand_total) || getCartTotal();
  const total = subtotal; // No shipping fee
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const [eligibilityBalance, setEligibilityBalance] = useState(0);

  useEffect(() => {
    async function fetchEligibility() {
      if (!accessToken || !isAuthenticated) return;
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
          const elig = data.eligibility || data;
          setEligibilityBalance(elig?.eligible_amount || 0);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchEligibility();
  }, [accessToken, isAuthenticated]);

  const balanceToUse = eligibilityBalance > 0 ? eligibilityBalance : Number(user?.salary_credit_balance || 0);
  const hasEnoughBalance = balanceToUse >= total;

  if (!mounted || !user) return null;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'salary' && !hasEnoughBalance) {
      alert("Insufficient Salary Credit balance for this order.");
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'salary') {
      deductSalaryCredit(total);
    }

    const order = await placeOrder(accessToken);

    if (order) {
      clearCart();
      setOrderSuccess({
        ...order,
        order_number: order.order_id || `BD-${Math.floor(Math.random() * 10000)}`,
        payment_method: paymentMethod === 'salary' ? 'Salary Credit' : 'bKash'
      });
    } else {
      alert('Failed to place order. Please try again.');
    }
    setIsProcessing(false);
  };

  if (orderSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-2xl p-10 sm:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left side: Success Message & Order Details */}
            <div className="flex flex-col gap-10">
              <div className="text-center lg:text-left">
                <div className='flex items-center gap-4 mb-4'>
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shadow-inner shadow-amber-100 mx-auto lg:mx-0">
                    <CheckCircle2 size={25} strokeWidth={2.5} />
                  </div>

                  <h1 className="text-4xl lg:text-5xl font-bold text-[#1c2135] tracking-tight">Order Placed!</h1>
                </div>
                <p className="text-gray-500 font-medium text-lg mb-8 max-w-md leading-relaxed mx-auto lg:mx-0">
                  Your order <span className="font-bold text-black bg-amber-50 px-2 py-1 rounded-md">{orderSuccess.order_number || orderSuccess.order_id || 'Pending'}</span> has been successfully processed using {orderSuccess.payment_method || 'Salary Credit'}.
                </p>
              </div>

              {/* Order Details (Left Side bottom) */}
              <div className="bg-[#F4F5F9] p-8 rounded-[2rem] border border-gray-100 text-left">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBag size={20} className="text-[#1c2135]" />
                  <h3 className="font-bold text-xl text-[#1c2135]">Order Details</h3>
                </div>

                <div className="space-y-4 font-medium text-sm">
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-500">Order ID</span>
                    <span className="text-[#1c2135] font-bold">{orderSuccess.order_number || orderSuccess.order_id || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-500">Date</span>
                    <span className="text-[#1c2135] font-bold">
                      {orderSuccess.created_at ? new Date(orderSuccess.created_at).toLocaleString() : new Date().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-500">Status</span>
                    <span className="text-[#1c2135] font-bold capitalize">
                      {orderSuccess.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="text-[#1c2135] font-bold text-lg">
                      ৳ {orderSuccess.total_amount ? parseFloat(orderSuccess.total_amount).toFixed(2) : subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/profile" className="bg-white border-2 border-gray-100 hover:border-gray-200 text-[#1c2135] font-bold py-4 px-8 rounded-xl transition-all text-center">
                  View Orders
                </Link>
                <Link href="/shop" className="bg-[#735EE0] hover:bg-[#624ed6] text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-[#735EE0]/30 text-center">
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right side: Items Ordered */}
            <div className="bg-[#F4F5F9] p-8 rounded-[2rem] border border-gray-100 text-left h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag size={20} className="text-[#1c2135]" />
                <h3 className="font-bold text-xl text-[#1c2135]">Items Ordered</h3>
              </div>

              <div className="flex-1 flex flex-col">
                {orderSuccess.items && orderSuccess.items.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {orderSuccess.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shrink-0 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-50 p-2.5 rounded-lg text-sm font-bold text-gray-500">
                            {item.quantity}x
                          </div>
                          <div>
                            <div className="text-[#1c2135] font-bold text-[15px] max-w-[200px] truncate">{item.product_name}</div>
                            <div className="text-gray-400 text-xs mt-0.5">{item.unit || ''}</div>
                          </div>
                        </div>
                        <div className="font-bold text-[#1c2135] text-[15px] shrink-0">
                          ৳ {parseFloat(item.quantity * parseFloat(item.price || item.discounted_price)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-10 font-medium">
                    No items found for this order.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#1c2135] uppercase tracking-widest transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-[#1c2135] tracking-tight mb-2">Checkout</h1>
        <p className="text-gray-500 text-sm font-medium">Complete your order by filling in your details below</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-12 relative max-w-4xl">
        <div className="absolute left-0 top-1/2 w-full h-[1px] bg-gray-200 -z-10" />

        <div className="flex items-center gap-3 bg-white pr-4">
          <div className="w-8 h-8 rounded-full bg-[#1c2135] text-white flex items-center justify-center text-sm font-bold shadow-sm">1</div>
          <span className="text-sm font-extrabold text-[#1c2135]">Delivery</span>
        </div>

        <div className="flex items-center gap-3 bg-white px-4">
          <div className="w-8 h-8 rounded-full bg-[#1c2135] text-white flex items-center justify-center text-sm font-bold shadow-sm">2</div>
          <span className="text-sm font-extrabold text-[#1c2135]">Order Review</span>
        </div>

        <div className="flex items-center gap-3 bg-white pl-4">
          <div className="w-8 h-8 rounded-full bg-[#735EE0] text-white flex items-center justify-center text-sm font-bold shadow-md shadow-[#735EE0]/30">3</div>
          <span className="text-sm font-extrabold text-[#735EE0]">Payment</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">

          {/* Order Summary Block */}
          <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#1c2135] rounded-2xl flex items-center justify-center text-white shrink-0">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1c2135]">Order Summary</h2>
                <p className="text-sm text-gray-400 font-medium">{itemCount} items in your cart</p>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F6F7FB] rounded-lg p-2 border border-gray-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1c2135]">{item.name}</h4>
                      <p className="text-[11px] text-gray-400 font-medium">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#1c2135]">
                    ৳{parseFloat(item.quantity_wise_price || (item.price * item.quantity)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details Block */}
          <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 bg-[#1c2135] rounded-2xl flex items-center justify-center text-white shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1c2135]">Delivery Details</h2>
                <p className="text-sm text-gray-400 font-medium">Where should we deliver your order?</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 z-10">
                    <User size={16} />
                  </div>
                  {user?.name ? (
                    <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 pl-11 text-sm font-bold text-gray-500 cursor-not-allowed flex items-center h-[50px]">
                      {user.name}
                    </div>
                  ) : (
                    <input
                      type="text" required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full bg-[#F6F7FB] border border-transparent rounded-xl px-4 py-3.5 pl-11 text-sm font-medium focus:outline-none focus:border-[#735EE0] focus:bg-white transition-all text-[#1c2135]"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 z-10">
                      <Mail size={16} />
                    </div>
                    {user?.email ? (
                      <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 pl-11 text-sm font-bold text-gray-500 cursor-not-allowed flex items-center h-[50px] truncate">
                        {user.email}
                      </div>
                    ) : (
                      <input
                        type="email" required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@email.com"
                        className="w-full bg-[#F6F7FB] border border-transparent rounded-xl px-4 py-3.5 pl-11 text-sm font-medium focus:outline-none focus:border-[#735EE0] focus:bg-white transition-all text-[#1c2135]"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Contact Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 z-10">
                      <Phone size={16} />
                    </div>
                    {user?.phone ? (
                      <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 pl-11 text-sm font-bold text-gray-500 cursor-not-allowed flex items-center h-[50px]">
                        {user.phone}
                      </div>
                    ) : (
                      <input
                        type="tel" required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+880 1XXXXXXXXX"
                        className="w-full bg-[#F6F7FB] border border-transparent rounded-xl px-4 py-3.5 pl-11 text-sm font-medium focus:outline-none focus:border-[#735EE0] focus:bg-white transition-all text-[#1c2135]"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Full Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 pt-4 pointer-events-none text-gray-400 z-10">
                    <MapPin size={16} />
                  </div>
                  {user?.company_address || user?.delivery_address ? (
                    <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 pl-11 text-sm font-bold text-gray-500 cursor-not-allowed flex items-start min-h-[96px]">
                      {user.company_address || user.delivery_address}
                    </div>
                  ) : (
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="House, Road, Area, City, District"
                      rows={3}
                      className="w-full bg-[#F6F7FB] border border-transparent rounded-xl px-4 py-3.5 pl-11 text-sm font-medium focus:outline-none focus:border-[#735EE0] focus:bg-white transition-all resize-none text-[#1c2135]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Right Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 space-y-6">

            {/* Payment Method Block */}
            <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 bg-[#735EE0] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner shadow-white/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1c2135]">Payment Method</h2>
                  <p className="text-sm text-gray-400 font-medium">Select how you want to pay</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {/* Salary Credit (replaces Cash on Delivery visually) */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('salary')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === 'salary'
                    ? 'border-[#FFB800] bg-[#FFB800]/5'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'salary' ? 'border-[#FFB800]' : 'border-gray-300'
                    }`}>
                    {paymentMethod === 'salary' && <div className="w-2.5 h-2.5 rounded-full bg-[#FFB800]" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#1c2135] text-sm mb-0.5">Salary Credit</div>
                    <div className="text-[11px] text-gray-400 font-medium">Pay directly from your employee credit</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-gray-400">Balance</div>
                    <div className="text-[12px] font-extrabold text-[#1c2135]">৳ {balanceToUse.toLocaleString()}</div>
                  </div>
                </button>

                {/* bKash */}
                <button
                  type="button" disabled
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed text-left transition-all"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-400 text-sm mb-0.5">bKash</div>
                    <div className="text-[11px] text-gray-400 font-medium">Mobile payment</div>
                  </div>
                  <div className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-1 rounded">
                    COMING SOON
                  </div>
                </button>
              </div>

              <div className="flex items-start gap-3 bg-[#F0FDF4] p-4 rounded-xl border border-green-100">
                <ShieldCheck size={18} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-green-700 font-medium leading-relaxed">
                  All transactions are encrypted and secure. Your details are never shared.
                </p>
              </div>
            </div>

            {/* Total Block */}
            <div className="bg-[#1c2135] rounded-[1.5rem] p-6 text-white shadow-xl shadow-[#1c2135]/20">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Amount</div>
                  <div className="text-3xl font-extrabold tracking-tight">৳ {total.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-300">{itemCount} items</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || (paymentMethod === 'salary' && !hasEnoughBalance)}
              className={`w-full py-5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${isProcessing || (paymentMethod === 'salary' && !hasEnoughBalance)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-[#735EE0] hover:bg-[#624ed6] text-white shadow-[#735EE0]/30 transform hover:-translate-y-1 active:scale-95'
                }`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (paymentMethod === 'salary' && !hasEnoughBalance) ? (
                'Insufficient Salary Credit'
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Place Order — ৳ {total.toFixed(2)}
                </>
              )}
            </button>

          </div>
        </div>
      </form>
    </div>
  );
}
