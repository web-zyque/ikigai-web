"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  X,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useMe } from "@/hooks/auth";
import { Address } from "@/types/address.types";
import {
  getStoredAddresses,
  saveStoredAddresses,
} from "@/lib/address-storage";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { data: user } = useMe();

  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  const [newAddr, setNewAddr] = useState<Omit<Address, "id" | "isDefault">>({
    name: "",
    phone: "",
    type: "Home",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string;
    total: number;
    itemCount: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    const loaded = getStoredAddresses();
    setAddresses(loaded);
    const defaultAddr = loaded.find((a) => a.isDefault) || loaded[0];
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setNewAddr((prev) => ({
        ...prev,
        name: prev.name || user.fullName || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ||
    addresses.find((a) => a.isDefault) ||
    addresses[0];

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const discount = appliedCoupon ? Math.round(subtotal * 0.1) : 0;
  const deliveryFee = subtotal > 0 ? (subtotal > 2000 ? 0 : 15.0) : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const totalSavings = discount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const cleaned = couponCode.trim().toUpperCase();
    if (!cleaned) return;
    if (cleaned === "IKIGAI10" || cleaned === "WELCOME10" || cleaned === "SAVE10") {
      setAppliedCoupon(cleaned);
      setCouponCode("");
    } else {
      setCouponError("Invalid coupon code. Try IKIGAI10");
    }
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newAddr.name.trim() ||
      !newAddr.phone.trim() ||
      !newAddr.addressLine.trim() ||
      !newAddr.city.trim() ||
      !newAddr.state.trim() ||
      !newAddr.pincode.trim()
    ) {
      return;
    }

    const created: Address = {
      ...newAddr,
      id: "addr-" + Date.now(),
      isDefault: addresses.length === 0,
    };

    const updated = [...addresses, created];
    setAddresses(updated);
    saveStoredAddresses(updated);
    setSelectedAddressId(created.id);
    setIsAddingNewAddress(false);
    setNewAddr({
      name: user?.fullName || "",
      phone: user?.phone || "",
      type: "Home",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    saveStoredAddresses(updated);
    setSelectedAddressId(id);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = "IKG-" + Math.floor(100000 + Math.random() * 900000);
      setOrderSuccess({
        orderId: generatedId,
        total,
        itemCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
      });
      clearCart();
      setIsSubmitting(false);
    }, 1200);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start animate-pulse">
            <div className="lg:col-span-7 bg-[#121212] rounded-2xl border border-white/10 p-6 h-96" />
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#121212] rounded-2xl border border-white/10 p-6 h-36" />
              <div className="bg-[#121212] rounded-2xl border border-white/10 p-6 h-72" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {!user && cartItems.length > 0 && (
          <div className="mb-6 bg-[#121212] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">ℹ️</span>
              <p className="text-white/70 text-xs sm:text-sm">
                Ordering as Guest. Have an account?{" "}
                <Link
                  href="/login?redirect=/checkout"
                  className="text-[#640C0C] font-semibold hover:underline"
                >
                  Log in
                </Link>{" "}
                to earn rewards and track status.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#121212] rounded-2xl border border-white/10 p-5 md:p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <h2 className="text-base font-bold text-white">
                  Order Items ({cartItems.length})
                </h2>
                <Link
                  href="/cart"
                  className="text-xs text-white/50 hover:text-white underline transition-colors"
                >
                  Edit Cart
                </Link>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/30">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-white/60 text-sm">Your cart is currently empty.</p>
                  <Link href="/products" className="inline-block pt-2">
                    <Button className="rounded-full bg-[#640C0C] text-xs h-9 px-5 cursor-pointer">
                      Explore Products
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 md:py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-2 sm:gap-4 md:gap-6"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 md:flex-none md:w-[46%]">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#0a0a0a] rounded-xl border border-white/10 p-1.5 shrink-0 flex items-center justify-center relative overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="(max-width: 768px) 64px, 80px"
                              className="object-contain p-1 mix-blend-screen"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-[10px] text-white/40">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 pr-1">
                          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/50 truncate mt-0.5">
                            <span>${item.price.toFixed(2)}</span>
                            {item.color && <span>• {item.color}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 md:flex-1 md:flex md:justify-start md:pl-2">
                        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-white/5 border border-white/10 rounded-full px-1.5 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="text-white/50 hover:text-white p-0.5 md:p-1 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          </button>
                          <span className="text-white font-semibold w-4 sm:w-5 md:w-8 text-center text-[11px] sm:text-xs md:text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="text-white/50 hover:text-white p-0.5 md:p-1 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2.5 sm:gap-3.5 md:gap-5 justify-end">
                        <div className="text-right min-w-[55px] sm:min-w-[70px] md:min-w-[90px]">
                          <span className="text-[#640C0C] font-bold text-xs sm:text-sm md:text-lg lg:text-xl block">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-white/40 hover:text-[#640C0C] transition-colors p-1 md:p-1.5 cursor-pointer shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-[#121212] rounded-2xl border border-white/10 p-5 md:p-6 shadow-xl">
              {selectedAddress ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-white/70 px-2.5 py-0.5 rounded bg-white/5 border border-white/10">
                        {selectedAddress.type}
                      </span>
                      {selectedAddress.isDefault && (
                        <span className="text-[10px] font-medium text-emerald-400">
                          Default Address
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-3 border-white/15 bg-white/5 hover:bg-white/10 text-white cursor-pointer rounded-full"
                    >
                      Change
                    </Button>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {selectedAddress.name}
                    </p>
                    <p className="text-xs text-white/70 mt-1 leading-relaxed">
                      {selectedAddress.addressLine}, {selectedAddress.city},{" "}
                      {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                    <p className="text-xs text-white/40 font-mono mt-1">
                      {selectedAddress.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-white/15 text-center space-y-2">
                  <p className="text-xs text-white/50">No delivery address added.</p>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsAddressModalOpen(true);
                      setIsAddingNewAddress(true);
                    }}
                    className="h-8 text-xs rounded-full bg-[#640C0C] text-white px-4 cursor-pointer"
                  >
                    Add Address
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-[#121212] rounded-2xl border border-white/10 p-5 md:p-6 shadow-xl space-y-5">
              <h2 className="text-base font-bold text-white">Payment Details</h2>

              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2 bg-white/5 border border-white/10 p-1 rounded-full">
                  <div className="flex-1 flex items-center px-3 gap-2">
                    <span className="text-white/50 text-xs">🎫</span>
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. IKIGAI10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-transparent text-white w-full focus:outline-none text-xs placeholder:text-white/30 uppercase"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="rounded-full bg-[#121212] border border-white/10 text-white hover:bg-white/10 h-8 px-4 text-xs cursor-pointer"
                  >
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 px-3">
                    <span>Coupon &quot;{appliedCoupon}&quot; applied (10% OFF)</span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-white/40 hover:text-white underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-400 px-3">{couponError}</p>
                )}
              </form>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="font-medium">Saved Amount</span>
                    <span className="font-semibold">-${totalSavings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>Delivery Fee</span>
                  <span className="text-white font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      `$${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-base font-bold text-white">Total Amount</span>
                <span className="text-2xl font-bold text-[#640C0C]">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button
                disabled={Boolean(cartItems.length === 0 || !selectedAddress || isSubmitting)}
                onClick={handlePlaceOrder}
                className="w-full rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white h-12 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer"
              >
                {isSubmitting ? "Processing Order..." : `Place Order • $${total.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-white/15 rounded-2xl w-full max-w-lg p-5 md:p-6 shadow-2xl max-h-[90vh] overflow-y-auto filter-scroll">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Select Shipping Address</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setIsAddingNewAddress(false);
                }}
                className="text-white/40 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isAddingNewAddress ? (
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="p-6 text-center space-y-2 border border-dashed border-white/10 rounded-xl">
                    <p className="text-xs text-white/50">No saved addresses found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => {
                      const isSelected = addr.id === selectedAddressId;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`rounded-xl border p-4 cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#640C0C] bg-[#640C0C]/10"
                              : "border-white/10 bg-[#0a0a0a] hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="shippingAddress"
                                checked={isSelected}
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="accent-[#640C0C]"
                              />
                              <span className="text-xs font-semibold text-white">
                                {addr.name}
                              </span>
                              <span className="text-[10px] uppercase font-semibold text-white/60 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                                {addr.type}
                              </span>
                            </div>
                            {addr.isDefault ? (
                              <span className="text-[10px] font-medium text-emerald-400">
                                Default
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefaultAddress(addr.id);
                              }}
                              className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                            >
                              Make Default
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-white/70 pl-6 leading-relaxed">
                          {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-white/40 font-mono pl-6 mt-1">
                          {addr.phone}
                        </p>
                      </div>
                    );
                  })}
                </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5 pt-3 border-t border-white/10">
                  <Button
                    type="button"
                    onClick={() => setIsAddingNewAddress(true)}
                    variant="outline"
                    className="flex-1 rounded-full text-xs h-10 border-white/20 hover:bg-white/10 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add New Address
                  </Button>
                  {addresses.length > 0 && (
                    <Button
                      type="button"
                      onClick={() => setIsAddressModalOpen(false)}
                      className="flex-1 rounded-full bg-[#640C0C] text-xs h-10 text-white cursor-pointer"
                    >
                      Confirm Selection
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveNewAddress} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Full Name"
                    value={newAddr.name}
                    onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                    className="h-10 px-3.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#640C0C]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Phone Number"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="h-10 px-3.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#640C0C]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Flat / House / Building / Street"
                    value={newAddr.addressLine}
                    onChange={(e) =>
                      setNewAddr({ ...newAddr, addressLine: e.target.value })
                    }
                    className="h-10 px-3.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#640C0C] sm:col-span-2"
                  />
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="h-10 px-3.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#640C0C]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="h-10 px-3.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#640C0C]"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pincode"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="h-10 px-3.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#640C0C]"
                  />
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-white/60">Type:</span>
                    <label className="inline-flex items-center gap-1.5 text-xs text-white cursor-pointer">
                      <input
                        type="radio"
                        name="addrModalType"
                        checked={newAddr.type === "Home"}
                        onChange={() => setNewAddr({ ...newAddr, type: "Home" })}
                        className="accent-[#640C0C]"
                      />
                      Home
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-white cursor-pointer">
                      <input
                        type="radio"
                        name="addrModalType"
                        checked={newAddr.type === "Work"}
                        onChange={() => setNewAddr({ ...newAddr, type: "Work" })}
                        className="accent-[#640C0C]"
                      />
                      Work
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                  <Button
                    type="button"
                    onClick={() => setIsAddingNewAddress(false)}
                    variant="outline"
                    className="h-9 px-4 text-xs rounded-full border-white/20 cursor-pointer"
                  >
                    Back to List
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 px-5 text-xs rounded-full bg-[#640C0C] text-white cursor-pointer"
                  >
                    Save & Use Address
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#121212] border border-white/15 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">Order Placed Successfully!</h3>
              <p className="text-xs text-white/60">
                Thank you for your order. We are preparing it for delivery.
              </p>
            </div>

            <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-white/50">Order Number</span>
                <span className="font-mono font-semibold text-white">
                  {orderSuccess.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Total Paid</span>
                <span className="font-bold text-[#640C0C]">
                  ${orderSuccess.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Delivery To</span>
                <span className="text-white truncate max-w-[200px]">
                  {selectedAddress?.city || "Standard Address"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                onClick={() => router.push("/profile?tab=orders")}
                className="w-full rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white h-11 text-xs font-semibold cursor-pointer"
              >
                View Order in Profile
              </Button>
              <Button
                onClick={() => router.push("/products")}
                variant="outline"
                className="w-full rounded-full border-white/15 hover:bg-white/10 text-white h-11 text-xs cursor-pointer"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
