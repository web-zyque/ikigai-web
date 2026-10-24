"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { useMe, useLogout } from "@/hooks/auth";
import { hasAuthSession } from "@/lib/auth-storage";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { getStoredAddresses, saveStoredAddresses } from "@/lib/address-storage";
import { Address } from "@/types/address.types";
import {
  TabKey,
  ProfileOrder,
  ProfileRefund,
  ProfileFormData,
  PasswordFormData,
  RefundFormData,
  getInitials,
  ProfileSidebar,
  ProfileInfoTab,
  ProfileOrdersTab,
  ProfileReturnsTab,
  ProfileAddressesTab,
  ProfileSecurityTab,
  RequestRefundModal,
  LogoutDialog,
} from "@/components/profile";

const INITIAL_ADDRESSES: Address[] = [];
const orderTabs = ["All", "Delivered", "Processing", "Shipped", "Cancelled"];
const returnTabs = ["All", "Completed", "Under Inspection"];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [requestRefundModalOpen, setRequestRefundModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const { data: user, isLoading, isError, error, isFetching } = useMe();
  const logoutMutation = useLogout();
  const { cartItems } = useCart();

  const [orders] = useState<ProfileOrder[]>([]);
  const [refunds] = useState<ProfileRefund[]>([]);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    dob: "",
    gender: "male",
    phone: "",
    email: "",
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersFilter, setOrdersFilter] = useState("All");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [returnsFilter, setReturnsFilter] = useState("All");

  const [refundForm, setRefundForm] = useState<RefundFormData>({
    orderId: "",
    productName: "",
    reason: "",
  });
  const [refundSuccessMessage, setRefundSuccessMessage] = useState("");

  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<Address, "id" | "isDefault">>({
    name: "",
    phone: "",
    type: "Home",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [passwordState, setPasswordState] = useState<PasswordFormData>({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setMounted(true);
    document.title = "My Profile | Ikigai Customs";
    setAddresses(getStoredAddresses());
  }, []);

  useEffect(() => {
    if (mounted) {
      saveStoredAddresses(addresses);
    }
  }, [addresses, mounted]);

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab === "cart") {
      router.replace("/cart");
      return;
    }
    if (tab && ["profile", "orders", "returns", "addresses", "security"].includes(tab)) {
      setActiveTab(tab as TabKey);
    } else {
      setActiveTab("profile");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasSession = mounted ? hasAuthSession() : false;
  const isUnauthorized =
    mounted &&
    (!hasSession ||
      (isError && (error as { status?: number })?.status === 401) ||
      (!isLoading && !isFetching && !user && !isError));

  useEffect(() => {
    if (isUnauthorized) {
      router.replace("/login");
    }
  }, [isUnauthorized, router]);

  const handleConfirmLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        setLogoutDialogOpen(false);
        router.replace("/login");
      },
    });
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingInfo(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundForm.orderId || !refundForm.reason) return;
    setRequestRefundModalOpen(false);
    setRefundSuccessMessage("Refund request submitted successfully! We will review it shortly.");
    setRefundForm({ orderId: "", productName: "", reason: "" });
    setTimeout(() => setRefundSuccessMessage(""), 4000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.addressLine || !newAddr.city || !newAddr.pincode) return;
    const item: Address = {
      ...newAddr,
      id: `addr-${Date.now()}`,
      isDefault: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, item]);
    setIsAddAddressOpen(false);
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
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!passwordState.current || !passwordState.newPass) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (passwordState.newPass !== passwordState.confirmPass) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordState.newPass.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }
    setPasswordSuccess(true);
    setPasswordState({ current: "", newPass: "", confirmPass: "" });
    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  if (!mounted || isLoading || (isFetching && !user)) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 h-96 rounded-[20px] bg-[#121212] border border-white/5 animate-pulse" />
            <div className="lg:col-span-8 h-96 rounded-[20px] bg-[#121212] border border-white/5 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (isUnauthorized) {
    return (
      <main className="min-h-[calc(100vh-120px)] bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-[#121212] border border-white/5 rounded-[20px] p-8 md:p-12 text-center max-w-md w-full shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#640C0C]/10 border border-[#640C0C]/20 text-[#640C0C]">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
          <p className="text-white/60 mb-6 text-sm leading-relaxed">
            Please log in to your account to view and manage your profile details.
          </p>
          <Link href="/login" className="block w-full">
            <Button className="w-full rounded-full bg-[#640C0C] text-white hover:bg-[#7a1010] h-12 font-medium">
              Log In to Continue
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const initials = getInitials(user?.fullName);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#640C0C]/40 selection:text-white pb-16">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ProfileSidebar
            user={user}
            initials={initials}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogoutClick={() => setLogoutDialogOpen(true)}
            ordersCount={orders.length}
            cartCount={cartItems.length}
          />

          <section className="lg:col-span-8">
            {activeTab === "profile" && (
              <ProfileInfoTab
                user={user}
                initials={initials}
                formData={formData}
                setFormData={setFormData}
                isEditingInfo={isEditingInfo}
                setIsEditingInfo={setIsEditingInfo}
                savedSuccess={savedSuccess}
                onSaveProfile={handleSaveProfile}
              />
            )}

            {activeTab === "orders" && (
              <ProfileOrdersTab
                orders={orders}
                ordersSearch={ordersSearch}
                setOrdersSearch={setOrdersSearch}
                ordersFilter={ordersFilter}
                setOrdersFilter={setOrdersFilter}
                orderTabs={orderTabs}
                openDropdownId={openDropdownId}
                setOpenDropdownId={setOpenDropdownId}
                dropdownRef={dropdownRef}
                onNavigateToOrder={(id) => router.push(`/orders/${id}`)}
                onNavigateToProducts={() => router.push(`/products`)}
                onRequestReturn={() => setActiveTab("returns")}
              />
            )}

            {activeTab === "returns" && (
              <ProfileReturnsTab
                refunds={refunds}
                returnsFilter={returnsFilter}
                setReturnsFilter={setReturnsFilter}
                returnTabs={returnTabs}
                refundSuccessMessage={refundSuccessMessage}
                onRequestRefundClick={() => setRequestRefundModalOpen(true)}
              />
            )}

            {activeTab === "addresses" && (
              <ProfileAddressesTab
                addresses={addresses}
                isAddAddressOpen={isAddAddressOpen}
                setIsAddAddressOpen={setIsAddAddressOpen}
                newAddr={newAddr}
                setNewAddr={setNewAddr}
                onAddAddress={handleAddAddress}
                onSetDefaultAddress={handleSetDefaultAddress}
                onDeleteAddress={handleDeleteAddress}
              />
            )}

            {activeTab === "security" && (
              <ProfileSecurityTab
                passwordState={passwordState}
                setPasswordState={setPasswordState}
                passwordSuccess={passwordSuccess}
                passwordError={passwordError}
                onPasswordSubmit={handlePasswordSubmit}
              />
            )}
          </section>
        </div>
      </main>

      <RequestRefundModal
        isOpen={requestRefundModalOpen}
        onClose={() => setRequestRefundModalOpen(false)}
        orders={orders}
        refundForm={refundForm}
        setRefundForm={setRefundForm}
        onSubmit={handleRefundSubmit}
      />

      <LogoutDialog
        isOpen={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        isPending={logoutMutation.isPending}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-[60vh] bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4" />
            <p className="text-white/60 text-xs">Loading profile...</p>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}