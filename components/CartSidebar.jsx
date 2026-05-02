"use client";

import React from "react";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useUserStore } from "../store/useUserStore";
import { useRouter } from "next/navigation";

export default function CartSidebar({ isOpen, onClose }) {
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const total = getCartTotal();

  const handleCheckout = () => {
    onClose();
    if (isAuthenticated) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[101] transform transition-transform duration-500 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Outside Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 -left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 shadow-xl border border-gray-100 hover:scale-110 transition-all duration-500 group ${
            isOpen
              ? "opacity-100 scale-100 translate-x-0"
              : "opacity-0 scale-50 translate-x-10 pointer-events-none"
          }`}
        >
          <X
            size={24}
            strokeWidth={2.5}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
        </button>

        <div className="flex flex-col h-full">
          {/* Top Banner */}
          <div className="bg-amber-500 text-white py-2.5 px-4 text-center font-bold text-sm">
            You have reduced delivery charge
          </div>

          {/* Header */}
          <div className="flex items-center gap-4 p-5 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600">
                <ShoppingBag size={22} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800 italic">
                  {items.length} items
                </div>
                <div className="text-sm font-bold text-gray-600 flex items-center gap-1">
                  Discounted Shipping Fee: ৳ 49
                </div>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                  <ShoppingBag size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Cart is empty
                </h3>
                <button
                  onClick={onClose}
                  className="mt-4 text-emerald-600 font-bold"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div
                    key={`${item.product.product_id}-${item.selected_unit}`}
                    className="p-4 flex gap-4 bg-white hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 shrink-0 bg-white rounded-lg p-1 border border-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 leading-tight mb-1">
                          {item.product.name}
                        </h4>
                        <div className="text-xs text-gray-400 font-medium">
                          {item.selected_unit || item.product.unit}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex flex-col items-end justify-between gap-2">
                      <div className="flex items-center bg-gray-100/80 rounded-full px-1 py-0.5 border border-gray-200/50">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.product_id,
                              item.quantity - 1,
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.product_id,
                              item.quantity + 1,
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm font-bold text-gray-900">
                          ৳{item.product.unit_price * item.quantity}
                        </div>
                        {item.product.discount_pct && (
                          <div className="text-[10px] text-gray-400 line-through">
                            ৳
                            {Math.round(
                              (item.product.unit_price * item.quantity) /
                                (1 - item.product.discount_pct / 100),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
            <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
                <Plus size={14} />
              </div>
              Enter special code
            </button>

            <button
              onClick={handleCheckout}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white p-1 rounded-[1.25rem] transition-all flex items-center justify-between group h-16"
            >
              <span className="pl-6 font-bold text-xl">Checkout</span>
              <div className="bg-amber-600 h-full px-6 flex items-center rounded-[1rem] font-bold text-xl min-w-[120px] justify-center">
                ৳ {total.toLocaleString()}
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
