'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { useUserStore } from '../../store/useUserStore';
import { useOrderStore } from '../../store/useOrderStore';
import { Wallet, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, MapPin, Building2, Truck, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user, deductSalaryCredit } = useUserStore();
  const addOrder = useOrderStore((state) => state.addOrder);
  
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('salary'); // 'salary' or 'bkash'
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (items.length === 0 && !orderSuccess) {
      router.push('/cart');
    }
  }, [items, router, orderSuccess]);

  if (!mounted || !user) return null;

  const total = getCartTotal();
  const hasEnoughBalance = user.salary_credit_balance >= total;

  const handlePlaceOrder = () => {
    if (paymentMethod === 'salary' && !hasEnoughBalance) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      if (paymentMethod === 'salary') {
        deductSalaryCredit(total);
      }
      
      const order = addOrder({
        customer_id: user.user_id,
        items: items,
        total_amount: total,
        payment_method: paymentMethod === 'salary' ? 'Salary Credit' : 'bKash',
        delivery_address: user.delivery_address,
      });

      clearCart();
      setOrderSuccess(order);
      setIsProcessing(false);
    }, 1500);
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-[3rem] p-10 sm:p-16 text-center shadow-2xl shadow-gray-200/50 border border-gray-100">
          <div className="w-28 h-28 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-green-100 rotate-3 transform transition-transform hover:rotate-6">
            <CheckCircle2 size={56} strokeWidth={2.5} />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Order Confirmed!</h1>
          <p className="text-gray-500 font-medium text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Thank you! Your order <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-md">{orderSuccess.order_number}</span> has been placed and is being processed.
          </p>
          
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 mb-10 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                <Truck size={20} />
              </div>
              <h3 className="font-bold text-xl text-gray-900">Delivery Details</h3>
            </div>
            
            <div className="space-y-4 font-medium">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">Recipient</span>
                <span className="text-gray-900 font-bold">{user.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-500">Location</span>
                <span className="text-gray-900 font-bold text-right">{user.delivery_address}</span>
              </div>
              <div className="pt-2">
                <p className="text-sm text-blue-600 bg-blue-50 p-4 rounded-xl font-semibold flex gap-3">
                  <span className="shrink-0 mt-0.5">ℹ️</span>
                  Demand-based items will be delivered according to their specific schedule. Regular items arrive next business day.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders" className="bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900 font-bold py-4 px-8 rounded-2xl transition-all w-full sm:w-auto">
              View Order History
            </Link>
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-blue-600/30 transform hover:-translate-y-1 w-full sm:w-auto">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <Link href="/cart" className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 shadow-sm">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column - Form */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Delivery Details */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl shadow-inner">1</div>
              <h2 className="text-2xl font-bold text-gray-900">Delivery Information</h2>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-[1.5rem] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Building2 size={100} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-bold text-xl text-gray-900 block mb-1">{user.name}</span>
                    <span className="font-semibold text-blue-600">{user.department} Department</span>
                  </div>
                  <span className="bg-blue-600 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg font-bold shadow-sm">
                    Office HQ
                  </span>
                </div>
                
                <div className="flex items-start gap-3 mt-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-max max-w-full">
                  <MapPin size={20} className="text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-gray-700 font-medium leading-relaxed">{user.delivery_address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl shadow-inner">2</div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Salary Credit Option */}
              <label className={`relative border-2 rounded-[1.5rem] p-6 cursor-pointer transition-all duration-300 flex flex-col h-full ${
                paymentMethod === 'salary' 
                  ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-500/10' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'salary' ? 'border-blue-500' : 'border-gray-300'}`}>
                      {paymentMethod === 'salary' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Salary Credit</span>
                  </div>
                  <Wallet size={24} className={paymentMethod === 'salary' ? 'text-blue-500' : 'text-gray-400'} />
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-200/60">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Current Balance</span>
                    <span className="font-bold text-gray-900">৳ {user.salary_credit_balance.toLocaleString()}</span>
                  </div>
                  {!hasEnoughBalance && paymentMethod === 'salary' && (
                    <div className="mt-3 bg-rose-50 text-rose-600 text-xs font-bold px-3 py-2 rounded-lg text-center border border-rose-100">
                      Insufficient balance for this order
                    </div>
                  )}
                </div>
              </label>

              {/* bKash Option */}
              <label className={`relative border-2 rounded-[1.5rem] p-6 cursor-pointer transition-all duration-300 flex flex-col h-full ${
                paymentMethod === 'bkash' 
                  ? 'border-[#E2136E] bg-rose-50/30 shadow-md shadow-[#E2136E]/10' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'bkash' ? 'border-[#E2136E]' : 'border-gray-300'}`}>
                      {paymentMethod === 'bkash' && <div className="w-3 h-3 rounded-full bg-[#E2136E]" />}
                    </div>
                    <span className="font-bold text-gray-900 text-lg">bKash</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-1.5 shadow-sm">
                    <span className="text-[#E2136E] font-bold tracking-tighter text-lg leading-none px-1">bKash</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-200/60">
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    You will be redirected to the secure bKash payment gateway to complete your purchase.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl text-white sticky top-28">
            <div className="flex items-center gap-3 mb-8">
              <FileCheck size={24} className="text-blue-400" />
              <h2 className="text-2xl font-bold">Order Summary</h2>
            </div>
            
            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.product.product_id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-800 p-2 shrink-0">
                    <img src={item.product.image_url} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-bold text-sm truncate text-gray-100 mb-1">{item.product.name}</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-medium">Qty: {item.quantity}</span>
                      <span className="font-bold text-white">৳ {(item.product.unit_price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-800 pt-6 space-y-4 mb-8 font-medium">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">৳ {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Office Delivery</span>
                <span className="text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                <span className="text-lg">Total</span>
                <span className="text-3xl font-bold text-blue-400">৳ {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing || (paymentMethod === 'salary' && !hasEnoughBalance)}
              className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                isProcessing 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : paymentMethod === 'salary' && !hasEnoughBalance
                    ? 'bg-rose-500/20 text-rose-300 cursor-not-allowed border border-rose-500/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/40 transform hover:-translate-y-1 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-3 border-gray-400 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>Place Order Now <ArrowRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

