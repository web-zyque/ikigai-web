"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useMe } from "@/hooks/auth";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { data: user, isLoading } = useMe();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = subtotal > 0 ? 0 : 0; // Adjust discount logic as needed
  const deliveryFee = subtotal > 0 ? 15.00 : 0;
  const total = subtotal - discount + deliveryFee;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8 max-w-7xl flex justify-center items-center h-[50vh]">
          <p className="text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 container mx-auto px-4 flex justify-center items-center">
          <div className="bg-[#121212] border border-white/5 rounded-[20px] p-8 md:p-12 text-center max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-3">Cart Access Restricted</h2>
            <p className="text-white/60 mb-8 text-sm leading-relaxed">
              Please log in to your account to view your cart, manage your items, and proceed to checkout securely.
            </p>
            <Link href="/login">
              <Button className="w-full rounded-full bg-[#640C0C] text-white hover:opacity-90 h-12 font-medium">
                Log In to Continue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side: Cart Items */}
          <div className="flex-1 bg-[#121212] rounded-[16px] border border-white/5 p-5 md:p-6">
            <div className="hidden md:grid grid-cols-12 gap-4 text-white/50 text-xs mb-4 border-b border-white/10 pb-2">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Price</div>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/50">Your cart is empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <div className="col-span-1 md:col-span-6 flex gap-4 items-center">
                      <div className="w-20 h-20 bg-[#0a0a0a] rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center p-2">
                        <Image src={item.image} alt={item.name} fill className="object-contain p-2 mix-blend-screen" />
                      </div>
                      <div>
                        <h3 className="text-white text-sm font-medium line-clamp-2">{item.name}</h3>
                        {item.color && <p className="text-white/50 text-xs mt-1">Color: {item.color}</p>}
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-3 flex justify-between md:justify-center items-center">
                      <span className="md:hidden text-white/50 text-xs">Quantity:</span>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-1 text-sm">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-white/50 hover:text-white p-1"><Minus className="w-3 h-3" /></button>
                        <span className="text-white font-medium w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-white/50 hover:text-white p-1"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center gap-4">
                      <span className="md:hidden text-white/50 text-xs">Price:</span>
                      <span className="text-[#640C0C] font-bold text-base">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-white/50 hover:text-[#640C0C] transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Order Summary */}
          <div className="w-full lg:w-80 flex flex-col gap-5">
            <div className="bg-[#121212] rounded-[16px] border border-white/5 p-5">
              <h2 className="text-lg font-bold text-white mb-5">Order Summary</h2>
              
              <div className="flex gap-2 mb-6 bg-white/5 border border-white/10 p-1 rounded-full">
                <div className="flex-1 flex items-center px-3 gap-2">
                  <span className="text-white/50 text-sm">🎫</span>
                  <input 
                    type="text" 
                    placeholder="Coupon Code" 
                    className="bg-transparent text-white w-full focus:outline-none text-xs placeholder:text-white/30"
                  />
                </div>
                <Button className="rounded-full bg-[#121212] border border-white/10 text-white hover:bg-white/10 h-8 px-4 text-xs">Apply</Button>
              </div>

              <div className="space-y-3 mb-5 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-white/70">
                    <span>Discount</span>
                    <span className="text-[#640C0C] font-medium">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>Delivery Fee</span>
                  <span className="text-white font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-white/10 mb-6">
                <span className="text-base font-bold text-white">Total</span>
                <span className="text-xl font-bold text-[#640C0C]">${total.toFixed(2)}</span>
              </div>

              <Button 
                disabled={cartItems.length === 0}
                className="w-full rounded-full bg-[#640C0C] text-white hover:opacity-90 h-12 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Go to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
