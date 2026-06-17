"use client";

import React from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useUserStore } from "../store/useUserStore";
import { useRouter } from "next/navigation";

export default function CartSidebar({ isOpen, onClose }) {
  const { items, updateQuantity, removeItem, getCartTotal, grand_total, subtotal, total_discount } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const total = Number(grand_total) || getCartTotal();

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
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl z-[101] transform transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-6">
          <h2 className="text-2xl font-serif text-gray-800">Shopping cart</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={20} strokeWidth={1} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-medium text-gray-500">
                Your cart is empty
              </h3>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-[#333333] text-white text-[13px] font-bold tracking-wider uppercase transition-colors hover:bg-black"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 pb-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-5"
                >
                  {/* Item Image */}
                  <div className="w-20 h-20 shrink-0 bg-[#eaeaec] flex items-center justify-center overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-[85%] h-[85%] object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 flex flex-col py-0.5 justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col">
                        <h4 className="text-[13px] font-bold text-gray-900 leading-tight mt-0.5">
                          {item.name}
                        </h4>
                        <div className="text-[11px] font-medium text-gray-500 mt-1">
                          ৳{item.price} {item.unit && <span className="text-gray-400">| {item.unit}</span>}
                        </div>
                      </div>
                      <div className="text-[13px] font-bold text-gray-900 shrink-0 whitespace-nowrap">
                        ৳ {item.quantity_wise_price || (item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">Qty</span>
                        <div className="flex items-center bg-[#f5f5f5] rounded px-1 py-0.5">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                              )
                            }
                            className="text-gray-400 hover:text-gray-900 transition-colors px-1"
                          >
                            <Minus size={10} strokeWidth={2.5} />
                          </button>
                          <span className="w-6 text-center text-[12px] font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                              )
                            }
                            className="text-gray-400 hover:text-gray-900 transition-colors px-1"
                          >
                            <Plus size={10} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] text-gray-400 hover:text-gray-800 flex items-center gap-1 transition-colors"
                      >
                        Remove <Trash2 size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="bg-[#f8f9fa] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-gray-900">Total</span>
              <span className="text-[20px] font-bold text-gray-900 tracking-tight">
                ৳{Number(total).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#333333] hover:bg-black text-white py-4 font-bold text-[12px] tracking-[0.1em] uppercase transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
