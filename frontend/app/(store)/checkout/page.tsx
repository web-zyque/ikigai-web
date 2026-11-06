"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  X,
  ShoppingBag,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useCart } from "@/hooks/use-cart";
import { useMe } from "@/hooks/auth";
import {
  useCreateUserAddress,
  useDeleteUserAddress,
  useSetDefaultUserAddress,
  useUpdateUserAddress,
  useUserAddresses,
} from "@/hooks/use-addresses";
import { productsApi } from "@/services/products.service";
import type { ProductResponse } from "@/types/products.types";
import type { CartItem } from "@/stores/cart-store";
import {
  clearBuyNowSelection,
  getBuyNowSelection,
  saveBuyNowSelection,
  type BuyNowSelection,
} from "@/lib/buy-now-checkout";
import { Address, AddressInput } from "@/types/address.types";
import {
  getStoredAddresses,
  saveStoredAddresses,
} from "@/lib/address-storage";
import { useToastStore } from "@/stores/toast-store";
import { useCreateOrder } from "@/hooks/use-orders";

const SELECTED_ADDRESS_SESSION_KEY = "ikigai-selected-shipping-address";

const emptyAddressForm = (): AddressInput => ({
  name: "",
  phone: "",
  type: "Home",
  addressLine: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
});

function createBuyNowCartItem(product: ProductResponse, selection: BuyNowSelection): CartItem {
  if (product.publicationStatus !== "active") {
    throw new Error("This product is no longer available.");
  }

  const variant = selection.variantId
    ? product.variants?.find((item) => item.id === selection.variantId)
    : undefined;
  if (selection.variantId && !variant) {
    throw new Error("The selected product option is no longer available.");
  }

  const availableQuantity = variant?.stockQuantity ?? product.stockQuantity;
  if (availableQuantity < selection.quantity) {
    throw new Error("This product does not have enough stock for the selected quantity.");
  }

  const price = Number(product.sellingPrice);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("The current product price could not be verified.");
  }

  const images = variant?.images ?? product.images;
  const image = images.find((item) => item.isMainImage)?.imageUrl ?? images[0]?.imageUrl ?? "";

  return {
    id: product.id,
    name: product.name,
    price,
    image,
    color: variant?.colorName ?? product.color ?? "Default",
    quantity: selection.quantity,
    variantId: selection.variantId ?? undefined,
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems: normalCartItems, updateQuantity, removeFromCart, isUpdating, error, isCartSyncPending, cartSyncError, retryCartSync, discardGuestCartAndUseAccountCart } = useCart();
  const { data: user } = useMe();
  const userAddressQuery = useUserAddresses(user?.id, Boolean(user));
  const createUserAddress = useCreateUserAddress(user?.id);
  const updateUserAddress = useUpdateUserAddress(user?.id);
  const deleteUserAddress = useDeleteUserAddress(user?.id);
  const setDefaultUserAddress = useSetDefaultUserAddress(user?.id);
  const addToast = useToastStore((state) => state.addToast);
  const createOrder = useCreateOrder();
  const idempotencyKey = useRef("");

  const [mounted, setMounted] = useState(false);
  const [isBuyNowCheckout, setIsBuyNowCheckout] = useState(false);
  const [buyNowSelection, setBuyNowSelection] = useState<BuyNowSelection | null>(null);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
  const [buyNowError, setBuyNowError] = useState("");
  const [guestAddresses, setGuestAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressError, setAddressError] = useState("");
  const [isAddressSaving, setIsAddressSaving] = useState(false);
  const [pendingDeleteAddress, setPendingDeleteAddress] = useState<Address | null>(null);
  const [deleteAddressError, setDeleteAddressError] = useState("");

  const [newAddr, setNewAddr] = useState<AddressInput>(emptyAddressForm);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    setMounted(true);
    const selection = getBuyNowSelection();
    if (selection) {
      setIsBuyNowCheckout(true);
      setBuyNowSelection(selection);
    }
    const loaded = getStoredAddresses();
    setGuestAddresses(loaded);
    const defaultAddr = loaded.find((a) => a.isDefault) || loaded[0];
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
    }
  }, []);

  useEffect(() => {
    if (!user || !userAddressQuery.data) return;
    const storedId = window.sessionStorage.getItem(SELECTED_ADDRESS_SESSION_KEY);
    const selected = userAddressQuery.data.find((address) => address.id === storedId)
      ?? userAddressQuery.data.find((address) => address.isDefault)
      ?? userAddressQuery.data[0];
    setSelectedAddressId(selected?.id ?? "");
    if (selected) window.sessionStorage.setItem(SELECTED_ADDRESS_SESSION_KEY, selected.id);
    else window.sessionStorage.removeItem(SELECTED_ADDRESS_SESSION_KEY);
  }, [user?.id, userAddressQuery.data]);

  useEffect(() => {
    if (!buyNowSelection) return;
    let active = true;
    setIsBuyNowLoading(true);
    setBuyNowError("");
    productsApi.getById(buyNowSelection.productId)
      .then((product) => {
        if (active) setBuyNowItem(createBuyNowCartItem(product, buyNowSelection));
      })
      .catch((loadError) => {
        if (!active) return;
        setBuyNowItem(null);
        setBuyNowError(loadError instanceof Error ? loadError.message : "Could not verify this product. Please try again.");
      })
      .finally(() => {
        if (active) setIsBuyNowLoading(false);
      });
    return () => { active = false; };
  }, [buyNowSelection]);

  useEffect(() => {
    if (user) {
      setNewAddr((prev) => ({
        ...prev,
        name: prev.name || user.fullName || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const addresses = user ? (userAddressQuery.data ?? []) : guestAddresses;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)
    || (user ? undefined : addresses.find((a) => a.isDefault) || addresses[0]);

  const selectAddress = (id: string) => {
    setSelectedAddressId(id);
    if (user) window.sessionStorage.setItem(SELECTED_ADDRESS_SESSION_KEY, id);
  };

  const checkoutItems = isBuyNowCheckout ? (buyNowItem ? [buyNowItem] : []) : normalCartItems;
  const subtotal = checkoutItems.reduce(
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

  const handleSaveNewAddress = async (e: React.FormEvent) => {
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

    setAddressError("");
    setIsAddressSaving(true);
    try {
      if (user) {
        const saved = editingAddressId
          ? await updateUserAddress.mutateAsync({ id: editingAddressId, input: newAddr })
          : await createUserAddress.mutateAsync(newAddr);
        selectAddress(saved.id);
      } else {
        const created: Address = {
          id: "addr-" + Date.now(),
          name: newAddr.name,
          phone: newAddr.phone,
          type: newAddr.type,
          addressLine: newAddr.addressLine,
          city: newAddr.city,
          state: newAddr.state,
          pincode: newAddr.pincode,
          isDefault: guestAddresses.length === 0,
        };
        const updated = [...guestAddresses, created];
        setGuestAddresses(updated);
        saveStoredAddresses(updated);
        setSelectedAddressId(created.id);
      }
      setIsAddingNewAddress(false);
      setEditingAddressId(null);
      setNewAddr({ ...emptyAddressForm(), name: user?.fullName || "", phone: user?.phone || "" });
    } catch (saveError) {
      setAddressError(saveError instanceof Error ? saveError.message : "Could not save this address. Please try again.");
    } finally {
      setIsAddressSaving(false);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    setAddressError("");
    if (user) {
      try {
        await setDefaultUserAddress.mutateAsync(id);
      } catch (defaultError) {
        setAddressError(defaultError instanceof Error ? defaultError.message : "Could not update the default address.");
      }
      return;
    }
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setGuestAddresses(updated);
    saveStoredAddresses(updated);
    setSelectedAddressId(id);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressError("");
    setNewAddr({
      name: address.name,
      phone: address.phone,
      type: address.type,
      addressLine: address.addressLine,
      addressLine2: address.addressLine2 ?? "",
      landmark: address.landmark ?? "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country ?? "India",
      isDefault: address.isDefault,
    });
    setIsAddingNewAddress(true);
  };

  const requestDeleteAddress = (address: Address) => {
    setDeleteAddressError("");
    setPendingDeleteAddress(address);
  };

  const handleConfirmDeleteAddress = async () => {
    if (!user || !pendingDeleteAddress || deleteUserAddress.isPending) return;
    const address = pendingDeleteAddress;
    setDeleteAddressError("");
    try {
      const remaining = await deleteUserAddress.mutateAsync(address.id);
      if (selectedAddressId === address.id) {
        const next = remaining.find((entry) => entry.isDefault) ?? remaining[0];
        if (next) selectAddress(next.id);
        else {
          setSelectedAddressId("");
          window.sessionStorage.removeItem(SELECTED_ADDRESS_SESSION_KEY);
        }
      }
      setPendingDeleteAddress(null);
      addToast("Address deleted successfully", "success");
    } catch (deleteError) {
      setDeleteAddressError(deleteError instanceof Error ? deleteError.message : "Could not delete this address. Please try again.");
    }
  };

  const handleUpdateQuantity = (item: CartItem, delta: number) => {
    if (isBuyNowCheckout) {
      if (!buyNowItem || !buyNowSelection) return;
      const nextQuantity = Math.max(1, buyNowItem.quantity + delta);
      setBuyNowItem({ ...buyNowItem, quantity: nextQuantity });
      saveBuyNowSelection({ ...buyNowSelection, quantity: nextQuantity });
      return;
    }
    updateQuantity(item.id, delta, item.variantId);
  };

  const handleRemoveCheckoutItem = (item: CartItem) => {
    if (isBuyNowCheckout) {
      setBuyNowItem(null);
      setBuyNowError("This Buy Now item was removed from checkout.");
      clearBuyNowSelection();
      return;
    }
    removeFromCart(item.id, item.variantId);
  };

  const handlePlaceOrder = async () => {
    if (checkoutItems.length === 0 || isBuyNowLoading || !user) {
      if (!user) router.push("/login?redirect=/checkout");
      return;
    }
    if (!selectedAddress) { setOrderError("Please select a saved shipping address."); return; }
    setOrderError("");
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    if (isBuyNowCheckout && buyNowSelection) {
      const currentSelection = {
        ...buyNowSelection,
        quantity: buyNowItem?.quantity ?? buyNowSelection.quantity,
      };
      setIsSubmitting(true);
      try {
        const currentProduct = await productsApi.getById(currentSelection.productId);
        const refreshedItem = createBuyNowCartItem(currentProduct, currentSelection);
        if (buyNowItem && refreshedItem.price !== buyNowItem.price) {
          setBuyNowItem(refreshedItem);
          setBuyNowError("The price changed. Review the updated total and place your order again to confirm.");
          setIsSubmitting(false);
          return;
        }
        setBuyNowItem(refreshedItem);
      } catch (loadError) {
        setBuyNowError(loadError instanceof Error ? loadError.message : "Could not verify this product. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const result = await createOrder.mutateAsync({
        addressId: selectedAddress.id,
        paymentMethod: "COD",
        ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
        idempotencyKey: idempotencyKey.current,
        ...(isBuyNowCheckout && buyNowSelection ? { buyNowItem: {
          productId: buyNowSelection.productId,
          variantId: buyNowSelection.variantId ?? null,
          quantity: buyNowItem?.quantity ?? buyNowSelection.quantity,
        } } : {}),
      });
      clearBuyNowSelection();
      router.push(`/order-confirmation/${result.id}`);
    } catch (submitError) {
      setOrderError(submitError instanceof Error ? submitError.message : "Could not place your order. Please try again.");
      setIsSubmitting(false);
    }
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
        {isCartSyncPending && (
          <div role="status" className="mb-6 rounded-2xl border border-white/10 bg-[#121212] p-4 text-sm text-white/70">
            <p>{cartSyncError ?? "Syncing your saved cart with your account…"}</p>
            {cartSyncError && (
              <div className="mt-2 flex flex-wrap gap-4">
                <button type="button" onClick={() => void retryCartSync().catch(() => undefined)} className="text-[#b44] hover:underline">
                  Retry cart sync
                </button>
                <button type="button" onClick={() => void discardGuestCartAndUseAccountCart().catch(() => undefined)} className="text-white/50 hover:text-white hover:underline">
                  Discard guest cart and use account cart
                </button>
              </div>
            )}
          </div>
        )}
        {buyNowError && (
          <div role="alert" className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {buyNowError}
          </div>
        )}
        {!user && checkoutItems.length > 0 && (
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
                  Order Items ({checkoutItems.length})
                </h2>
                {!isBuyNowCheckout && (
                  <Link
                    href="/cart"
                    className="text-xs text-white/50 hover:text-white underline transition-colors"
                  >
                    Edit Cart
                  </Link>
                )}
              </div>

              {isBuyNowLoading ? (
                <div role="status" className="py-12 text-center text-sm text-white/60">Verifying your selected product…</div>
              ) : checkoutItems.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/30">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-white/60 text-sm">{isBuyNowCheckout ? "No Buy Now item is available for checkout." : "Your cart is currently empty."}</p>
                  <Link href="/products" className="inline-block pt-2">
                    <Button className="rounded-full bg-[#640C0C] text-xs h-9 px-5 cursor-pointer">
                      Explore Products
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {error && <p role="alert" className="py-3 text-sm text-red-400">{error}</p>}
                  {checkoutItems.map((item) => (
                    <div
                      key={`${item.id}-${item.variantId ?? "default"}`}
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
                            onClick={() => handleUpdateQuantity(item, -1)}
                            disabled={isCartSyncPending || item.quantity <= 1 || isUpdating(item.id)}
                            className="text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-0.5 md:p-1 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          </button>
                          <span className="text-white font-semibold w-4 sm:w-5 md:w-8 text-center text-[11px] sm:text-xs md:text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item, 1)}
                            disabled={isCartSyncPending || isUpdating(item.id)}
                            className="text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-0.5 md:p-1 cursor-pointer"
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
                          onClick={() => handleRemoveCheckoutItem(item)}
                          disabled={isCartSyncPending}
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
              {user && userAddressQuery.isLoading ? (
                <div role="status" className="flex items-center gap-2 text-xs text-white/50"><Loader2 className="h-4 w-4 animate-spin" /> Loading your saved addresses…</div>
              ) : selectedAddress ? (
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
                      {selectedAddress.addressLine}
                      {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                      {selectedAddress.landmark && `, ${selectedAddress.landmark}`}
                      {`, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`}
                      {selectedAddress.country && `, ${selectedAddress.country}`}
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
              {userAddressQuery.isError && user && <p role="alert" className="mt-3 text-xs text-red-400">Could not load your saved addresses. Please try again.</p>}
              {addressError && <p role="alert" className="mt-3 text-xs text-red-400">{addressError}</p>}
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

              {orderError && <p role="alert" className="text-sm text-red-400">{orderError}</p>}
              {!user && <p className="text-xs text-white/50">Sign in to place an order. Your cart will remain saved.</p>}
              <Button
                disabled={Boolean(checkoutItems.length === 0 || isBuyNowLoading || buyNowError || !selectedAddress || isSubmitting || (!isBuyNowCheckout && isCartSyncPending))}
                onClick={handlePlaceOrder}
                className="w-full rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white h-12 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer"
              >
                {isSubmitting ? "Processing Order..." : `Place COD Order • $${total.toFixed(2)}`}
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
                  setEditingAddressId(null);
                  setAddressError("");
                }}
                className="text-white/40 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isAddingNewAddress ? (
              <div className="space-y-4">
                {user && userAddressQuery.isLoading ? (
                  <div role="status" className="flex items-center justify-center gap-2 py-8 text-xs text-white/50"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved addresses…</div>
                ) : addresses.length === 0 ? (
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
                          onClick={() => selectAddress(addr.id)}
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
                                onChange={() => selectAddress(addr.id)}
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
                          {user && (
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }} aria-label={`Edit ${addr.type} address`} className="text-white/45 hover:text-white transition-colors">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); requestDeleteAddress(addr); }} aria-label={`Delete ${addr.type} address`} disabled={deleteUserAddress.isPending} className="text-white/45 hover:text-red-400 transition-colors disabled:opacity-40">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-white/70 pl-6 leading-relaxed">
                          {addr.addressLine}{addr.addressLine2 && `, ${addr.addressLine2}`}{addr.landmark && `, ${addr.landmark}`}, {addr.city}, {addr.state} - {addr.pincode}{addr.country && `, ${addr.country}`}
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
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddressError("");
                      setNewAddr({ ...emptyAddressForm(), name: user?.fullName || "", phone: user?.phone || "" });
                      setIsAddingNewAddress(true);
                    }}
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
                {addressError && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-xs text-red-300">{addressError}</p>}
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
                  {user && (
                    <>
                      <input
                        type="text"
                        placeholder="Apartment, suite, unit (optional)"
                        value={newAddr.addressLine2 ?? ""}
                        onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
                        className="h-10 px-3.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#640C0C] sm:col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="Landmark (optional)"
                        value={newAddr.landmark ?? ""}
                        onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                        className="h-10 px-3.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#640C0C] sm:col-span-2"
                      />
                    </>
                  )}
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
                  {user && (
                    <>
                      <input
                        type="text"
                        required
                        placeholder="Country"
                        value={newAddr.country}
                        onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                        className="h-10 px-3.5 rounded-lg bg-[#0a0a0a] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#640C0C]"
                      />
                      <label className="inline-flex items-center gap-2 text-xs text-white/70 sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={newAddr.isDefault}
                          onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                          className="accent-[#640C0C]"
                        />
                        Set as default address
                      </label>
                    </>
                  )}
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
                    onClick={() => { setIsAddingNewAddress(false); setEditingAddressId(null); setAddressError(""); }}
                    variant="outline"
                    className="h-9 px-4 text-xs rounded-full border-white/20 cursor-pointer"
                  >
                    Back to List
                  </Button>
                  <Button
                    type="submit"
                    disabled={isAddressSaving}
                    className="h-9 px-5 text-xs rounded-full bg-[#640C0C] text-white cursor-pointer"
                  >
                    {isAddressSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                    {editingAddressId ? "Save Changes" : "Save & Use Address"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteAddress)}
        onClose={() => {
          if (deleteUserAddress.isPending) return;
          setPendingDeleteAddress(null);
          setDeleteAddressError("");
        }}
        onConfirm={() => void handleConfirmDeleteAddress()}
        title="Delete Address?"
        description={pendingDeleteAddress
          ? `Are you sure you want to delete this ${pendingDeleteAddress.type} address for ${pendingDeleteAddress.name}?`
          : "Are you sure you want to delete this address?"}
        confirmText="Delete Address"
        cancelText="Cancel"
        loadingText="Deleting…"
        isLoading={deleteUserAddress.isPending}
        errorMessage={deleteAddressError}
      />

    </div>
  );
}
