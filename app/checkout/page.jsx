'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/useCartStore';
import { useUserStore } from '../../store/useUserStore';
import { useOrderStore } from '../../store/useOrderStore';
import { ChevronRight, ArrowLeft, ShoppingBag, CheckCircle2, ShieldCheck, Truck, Clock, Info } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user, deductSalaryCredit, isAuthenticated } = useUserStore();
  const addOrder = useOrderStore((state) => state.addOrder);
  
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [paymentMethod, setPaymentMethod] = useState('salary'); // 'salary' or 'bkash'

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0 && !orderSuccess) {
      router.push('/shop');
    }
  }, [items, router, orderSuccess, isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: `${user.erp_employee_id.toLowerCase()}@betopia.com`,
        city: user.delivery_address || '',
        state: 'Dhaka', 
        zip: '1212'
      }));
    }
  }, [user]);

  const subtotal = getCartTotal();
  const shippingFee = shippingMethod === 'express' ? 9 : 0;
  const taxes = subtotal * 0.05; 
  const total = subtotal + shippingFee + taxes;

  const hasEnoughBalance = user?.salary_credit_balance >= total;

  if (!mounted || !user) return null;

  const handlePlaceOrder = () => {
    if (paymentMethod === 'salary' && !hasEnoughBalance) {
      alert("Insufficient Salary Credit balance for this order.");
      return;
    }
    
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
        delivery_address: `${formData.city}, ${formData.state}, ${formData.zip}`,
        shipping_method: shippingMethod === 'free' ? 'Free Shipping' : 'Express Shipping',
        customer_notes: formData.description
      });

      clearCart();
      setOrderSuccess(order);
      setIsProcessing(false);
    }, 2000);
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };

  if (orderSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[3rem] p-10 sm:p-16 text-center shadow-2xl shadow-gray-200/50 border border-gray-100">
          <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-amber-100">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Order Placed!</h1>
          <p className="text-gray-500 font-medium text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Your order <span className="font-bold text-black bg-amber-50 px-2 py-1 rounded-md">{orderSuccess.order_number}</span> has been successfully processed using {orderSuccess.payment_method}.
          </p>
          
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 mb-10 text-left">
            <div className="flex items-center gap-3 mb-6">
               <Truck size={20} className="text-amber-500" />
               <h3 className="font-bold text-xl text-gray-900">Delivery Information</h3>
            </div>
            
            <div className="space-y-4 font-medium text-sm">
               <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-500">Shipping To</span>
                  <span className="text-gray-900 font-bold">{formData.city}, {formData.state}</span>
               </div>
               <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-500">Estimated Delivery</span>
                  <span className="text-gray-900 font-bold">{shippingMethod === 'express' ? '1-3 Business Days' : '7-20 Business Days'}</span>
               </div>
               <div className="pt-2">
                 <p className="text-xs text-amber-700 bg-amber-50 p-4 rounded-xl font-bold flex gap-3">
                   <Info size={16} className="shrink-0" />
                   Internal delivery will be coordinated through your department head as per standard protocol.
                 </p>
               </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/profile" className="bg-white border-2 border-gray-100 hover:border-gray-900 text-gray-900 font-bold py-4 px-8 rounded-2xl transition-all">
              View My Orders
            </Link>
            <Link href="/" className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-black/10">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Steps */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
           <button 
             onClick={() => step === 2 ? setStep(1) : router.push('/shop')}
             className="flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-colors mb-2 group"
           >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-widest">{step === 2 ? 'Back to shipping' : 'Back to shop'}</span>
           </button>
           <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Checkout</h1>
        </div>
        
        <div className="flex items-center gap-3 text-sm font-bold">
           <span className="text-gray-400">Cart</span>
           <ChevronRight size={14} className="text-gray-300" />
           <span className={`${step === 1 ? 'text-amber-500 underline underline-offset-8' : 'text-gray-900'}`}>Shipping</span>
           <ChevronRight size={14} className="text-gray-300" />
           <span className={`${step === 2 ? 'text-amber-500 underline underline-offset-8' : 'text-gray-400'}`}>Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-12">
          {step === 1 ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-500">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Shipping Address</h2>
                <form id="shipping-form" onSubmit={handleContinueToPayment} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">First Name*</label>
                      <input 
                        type="text" required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Name*</label>
                      <input 
                        type="text" required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email*</label>
                      <input 
                        type="email" required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone number*</label>
                      <input 
                        type="tel" required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+880 123456789"
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">City*</label>
                      <input 
                        type="text" required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">State*</label>
                      <input 
                        type="text" required
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Zip Code*</label>
                      <input 
                        type="text" required
                        value={formData.zip}
                        onChange={(e) => setFormData({...formData, zip: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none" 
                      />
                    </div>
                  </div>
                </form>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Shipping Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setShippingMethod('free')}
                    className={`flex items-start gap-4 p-6 border-2 rounded-2xl transition-all text-left ${shippingMethod === 'free' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${shippingMethod === 'free' ? 'border-black' : 'border-gray-300'}`}>
                       {shippingMethod === 'free' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-900">Free Shipping</span>
                          <span className="font-bold text-gray-900">৳ 0</span>
                       </div>
                       <p className="text-sm text-gray-500">7-20 Days delivery</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setShippingMethod('express')}
                    className={`flex items-start gap-4 p-6 border-2 rounded-2xl transition-all text-left ${shippingMethod === 'express' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${shippingMethod === 'express' ? 'border-black' : 'border-gray-300'}`}>
                       {shippingMethod === 'express' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-900">Express Shipping</span>
                          <span className="font-bold text-gray-900">৳ 9</span>
                       </div>
                       <p className="text-sm text-gray-500">1-3 Days delivery</p>
                    </div>
                  </button>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
               <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Payment Method</h2>
                  <div className="grid grid-cols-1 gap-6">
                     {/* Salary Credit Option */}
                     <button 
                        onClick={() => setPaymentMethod('salary')}
                        className={`flex items-center gap-6 p-8 border-2 rounded-[2rem] transition-all text-left group ${paymentMethod === 'salary' ? 'border-amber-500 bg-amber-50/30' : 'border-gray-100 hover:border-gray-200'}`}
                     >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'salary' ? 'border-amber-500' : 'border-gray-300'}`}>
                           {paymentMethod === 'salary' && <div className="w-3 h-3 rounded-full bg-amber-500" />}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-xl text-gray-900">Salary Credit</span>
                              <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Internal</span>
                           </div>
                           <p className="text-sm text-gray-500 font-medium">Pay directly from your employee credit balance</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Available</p>
                           <p className="text-lg font-bold text-gray-900">৳ {user.salary_credit_balance.toLocaleString()}</p>
                        </div>
                     </button>

                     {/* bKash Option */}
                     <button 
                        onClick={() => setPaymentMethod('bkash')}
                        className={`flex items-center gap-6 p-8 border-2 rounded-[2rem] transition-all text-left group ${paymentMethod === 'bkash' ? 'border-[#E2136E] bg-[#E2136E]/5' : 'border-gray-100 hover:border-gray-200'}`}
                     >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'bkash' ? 'border-[#E2136E]' : 'border-gray-300'}`}>
                           {paymentMethod === 'bkash' && <div className="w-3 h-3 rounded-full bg-[#E2136E]" />}
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                           <div>
                              <span className="font-bold text-xl text-gray-900 block mb-1">bKash</span>
                              <p className="text-sm text-gray-500 font-medium">Fast and secure mobile payment</p>
                           </div>
                           <div className="bg-white border border-gray-100 rounded-xl p-2 px-4 shadow-sm">
                              <span className="text-[#E2136E] font-bold text-2xl tracking-tighter">bKash</span>
                           </div>
                        </div>
                     </button>
                  </div>
               </section>

               <div className="p-6 bg-gray-50 rounded-2xl flex gap-4">
                  <ShieldCheck size={24} className="text-gray-400 shrink-0" />
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">
                     Your payment information is handled securely. For Salary Credit, the amount will be deducted instantly from your employee account. For bKash, you'll be redirected to their secure gateway.
                  </p>
               </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
           <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/20 sticky top-28">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Your Cart</h2>
              
              <div className="space-y-6 mb-8 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={`${item.product.product_id}-${item.selected_unit}`} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl p-2 shrink-0 border border-gray-100 relative">
                       <img src={item.product.image_url} alt="" className="w-full h-full object-contain" />
                       <span className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                          {item.quantity}
                       </span>
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.product.name}</h4>
                       <p className="text-xs text-gray-400 font-medium">{item.selected_unit || item.product.unit}</p>
                    </div>
                    <div className="text-sm font-bold text-gray-900">৳ {(item.product.unit_price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-4 pt-6 border-t border-gray-100 mb-10">
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500 font-medium">Subtotal</span>
                   <span className="text-gray-900 font-bold">৳ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-gray-500 font-medium">Shipping</span>
                   <span className="text-gray-900 font-bold">৳ {shippingFee}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                   <span className="text-gray-500 font-medium">Estimated taxes</span>
                   <span className="text-gray-900 font-bold">৳ {taxes.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                   <span className="text-xl font-bold text-gray-900">Total</span>
                   <span className="text-3xl font-bold text-black tracking-tight">৳ {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type={step === 1 ? "submit" : "button"}
                form={step === 1 ? "shipping-form" : ""}
                onClick={step === 2 ? handlePlaceOrder : undefined}
                disabled={isProcessing || (step === 2 && paymentMethod === 'salary' && !hasEnoughBalance)}
                className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                  isProcessing 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : step === 2 && paymentMethod === 'salary' && !hasEnoughBalance
                      ? 'bg-red-50 text-red-500 cursor-not-allowed border border-red-100'
                      : 'bg-black hover:bg-gray-800 text-white shadow-2xl shadow-black/20 transform hover:-translate-y-1 active:scale-95'
                }`}
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-3 border-gray-300 border-t-black rounded-full animate-spin" />
                ) : step === 1 ? (
                  'Continue to Payment'
                ) : !hasEnoughBalance && paymentMethod === 'salary' ? (
                  'Insufficient Balance'
                ) : (
                  paymentMethod === 'salary' ? 'Place Order (Salary Credit)' : 'Proceed to bKash'
                )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
