"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User as UserIcon,
  ShoppingBag,
  RotateCcw,
  MapPin,
  ShoppingCart,
  KeyRound,
  LogOut,
  Pencil,
  Search,
  MoreVertical,
  Download,
  RefreshCw,
  Undo2,
  Plus,
  Trash2,
  Lock,
  AlertCircle,
  Check,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useMe, useLogout } from "@/hooks/auth";
import { hasAuthSession } from "@/lib/auth-storage";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { getStoredAddresses, saveStoredAddresses } from "@/lib/address-storage";


type TabKey =
  | "profile"
  | "orders"
  | "returns"
  | "addresses"
  | "cart"
  | "security";

interface Address {
  id: string;
  name: string;
  phone: string;
  type: "Home" | "Work";
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const INITIAL_ADDRESSES: Address[] = [];


const mockOrders = [
  {
    id: "ORD-94827-XYZ",
    productName: "Premium Brake Kit 1",
    date: "2023-10-05",
    amount: 1299.0,
    status: "Delivered",
    image: "/images/category_brakes.jpg",
  },
  {
    id: "ORD-94828-ABC",
    productName: "Performance Suspension 2 — Pro Series",
    date: "2023-10-06",
    amount: 1449.0,
    status: "Processing",
    image: "/images/category_suspension.jpg",
  },
  {
    id: "ORD-94829-DEF",
    productName: "Alloy Wheel Set 4 — Forged",
    date: "2023-10-07",
    amount: 1749.0,
    status: "Shipped",
    image: "/images/category_wheels.jpg",
  },
];

const mockRefunds = [
  {
    id: "RET-2041",
    orderId: "ORD-94820-MNP",
    productName: "Aerodynamic Carbon Spoiler Wing",
    requestedOn: "2023-09-28",
    amount: 2798.0,
    status: "Refund Completed",
    reason: "Fitment mismatch with car model",
    image: "/images/category_wheels.jpg",
  },
  {
    id: "RET-2038",
    orderId: "ORD-94815-QRS",
    productName: "Ultra-Beam 32 Curved LED Bar",
    requestedOn: "2023-09-12",
    amount: 6798.0,
    status: "Under Inspection",
    reason: "Damaged packaging upon arrival",
    image: "/images/category_lights.jpg",
  },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
    case "refund completed":
      return "text-emerald-400";
    case "processing":
    case "under inspection":
      return "text-amber-400";
    case "shipped":
      return "text-sky-400";
    case "cancelled":
      return "text-red-400";
    default:
      return "text-white/70";
  }
};

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [requestRefundModalOpen, setRequestRefundModalOpen] = useState(false);

  const initialTab: TabKey =
    searchParams?.get("tab") &&
    ["profile", "orders", "returns", "addresses", "cart", "security"].includes(
      searchParams.get("tab") as string
    )
      ? (searchParams.get("tab") as TabKey)
      : "profile";

  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const { data: user, isLoading, isError, error, isFetching } = useMe();
  const logoutMutation = useLogout();
  const { cartItems, removeFromCart } = useCart();

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
      0
    );
  }, [cartItems]);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dob: "2000-01-15",
    gender: "male" as "male" | "female" | "other",
    phone: "",
    email: "",
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersFilter, setOrdersFilter] = useState("All");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [returnsFilter, setReturnsFilter] = useState("All");

  const [refundForm, setRefundForm] = useState({
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

  const [passwordState, setPasswordState] = useState({
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
    const tab = searchParams?.get("tab") as TabKey;
    if (tab && ["profile", "orders", "returns", "addresses", "cart", "security"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("profile");
    }
  }, [searchParams]);

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

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      const s = order.status.toLowerCase();
      let matchesTab = false;
      if (ordersFilter === "All") matchesTab = true;
      else if (ordersFilter === "Delivered") matchesTab = s === "delivered";
      else if (ordersFilter === "Processing") matchesTab = s === "processing";
      else if (ordersFilter === "Shipped") matchesTab = s === "shipped";
      else if (ordersFilter === "Cancelled") matchesTab = s === "cancelled";

      const matchesSearch =
        order.productName.toLowerCase().includes(ordersSearch.toLowerCase()) ||
        order.id.toLowerCase().includes(ordersSearch.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [ordersFilter, ordersSearch]);

  const filteredReturns = useMemo(() => {
    return mockRefunds.filter((ret) => {
      const s = ret.status.toLowerCase();
      if (returnsFilter === "All") return true;
      if (returnsFilter === "Completed") return s.includes("completed");
      if (returnsFilter === "Under Inspection") return s.includes("inspection");
      return true;
    });
  }, [returnsFilter]);

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

  const navMenuItems = [
    { key: "profile" as TabKey, label: "My Profile", icon: UserIcon },
    { key: "orders" as TabKey, label: "My Orders", icon: ShoppingBag },
    { key: "returns" as TabKey, label: "Returns & Refund", icon: RotateCcw },
    { key: "addresses" as TabKey, label: "Address Book", icon: MapPin },
    { key: "cart" as TabKey, label: "My Cart", icon: ShoppingCart },
    { key: "security" as TabKey, label: "Change Password", icon: KeyRound },
  ];

  const orderTabs = ["All", "Delivered", "Processing", "Shipped", "Cancelled"];
  const returnTabs = ["All", "Completed", "Under Inspection"];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#640C0C]/40 selection:text-white pb-16">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <aside className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-[20px] bg-[#121212] border border-white/5">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#640C0C] border border-white/20 text-sm font-bold text-white shadow-md">
                  <span>{initials}</span>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#121212]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-white truncate">
                    {user?.fullName || "Member"}
                  </h2>
                  <p className="text-[11px] font-mono text-white/50 truncate">
                    {user?.phone || user?.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLogoutDialogOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium border border-red-500/20 shrink-0 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>

            <nav className="lg:hidden flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-white/10">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.key);
                      router.replace(`/profile?tab=${item.key}`, { scroll: false });
                    }}
                    className={`relative flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-[#640C0C] bg-[#640C0C]/10 text-white"
                        : "border-transparent text-white/50 hover:border-transparent hover:bg-white/[0.03] hover:text-white/80"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isActive ? "text-white" : "text-white/60"
                      }`}
                    />
                    <span>{item.label}</span>
                    {item.key === "orders" && mockOrders.length > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white font-bold"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {mockOrders.length}
                      </span>
                    )}
                    {item.key === "cart" && cartItems.length > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white font-bold"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {cartItems.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <nav className="hidden lg:block rounded-[20px] bg-[#121212] border border-white/5 p-2.5 space-y-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2 pt-1">
                Account Navigation
              </p>

              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.key);
                      router.replace(`/profile?tab=${item.key}`, { scroll: false });
                    }}
                    className={`w-full group flex items-center justify-between h-11 px-3 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-white/[0.08] text-white font-semibold"
                        : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-white/40 group-hover:text-white/80"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs sm:text-sm">{item.label}</span>
                    </div>

                    {item.key === "orders" && mockOrders.length > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white font-bold"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {mockOrders.length}
                      </span>
                    )}
                    {item.key === "cart" && cartItems.length > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white font-bold"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {cartItems.length}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setLogoutDialogOpen(true)}
                  className="w-full group flex items-center gap-3 h-11 px-3 rounded-xl text-xs sm:text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                >
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-red-400 group-hover:text-red-300">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span>Log Out</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Right Content Area */}
          <section className="lg:col-span-8">
            {/* 1. Profile Section */}
            {activeTab === "profile" && (
              <div className="rounded-[20px] bg-[#121212] border border-white/10 overflow-hidden">
                {savedSuccess && (
                  <div className="m-5 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-400">
                    <Check className="h-4 w-4" />
                    <span>Profile information updated successfully!</span>
                  </div>
                )}

                {/* Profile Header Banner */}
                <div className="p-4 sm:p-7 border-b border-white/10 flex items-center justify-between gap-3 bg-gradient-to-r from-white/[0.03] to-transparent">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <div className="flex h-13 w-13 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#640C0C]/80 via-[#202020] to-black border border-white/20 text-base sm:text-xl font-bold text-white shadow-xl">
                        {initials}
                      </div>
                      <div
                        className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#121212] border border-emerald-500/30 text-emerald-400"
                        title="Verified Account"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-emerald-500/20 text-emerald-400" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-lg font-bold text-white truncate">
                          {formData.name || "Customer Account"}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 shrink-0">
                          <ShieldCheck className="h-3 w-3" />
                          <span className="hidden sm:inline">Verified</span>
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-white/40 font-mono mt-0.5 truncate">
                        Member ID: #{user?.id ? user.id.slice(0, 8).toUpperCase() : "IK-001"}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {!isEditingInfo ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditingInfo(true)}
                          className="sm:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all cursor-pointer shadow-sm hover:border-white/30"
                          aria-label="Edit Profile"
                        >
                          <Pencil className="h-4 w-4 text-[#640C0C]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingInfo(true)}
                          className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/15 transition-all cursor-pointer shadow-sm hover:border-white/30"
                        >
                          <Pencil className="h-3.5 w-3.5 text-[#640C0C]" />
                          <span>Edit Information</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingInfo(false)}
                        className="text-xs text-white/50 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Details Content */}
                <form onSubmit={handleSaveProfile} className="p-6 sm:p-7 space-y-6">
                  {isEditingInfo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1.5">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/15 px-4 text-xs text-white placeholder:text-white/30 focus:border-[#640C0C] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1.5">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={formData.dob}
                            onChange={(e) =>
                              setFormData({ ...formData, dob: e.target.value })
                            }
                            className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/15 px-4 text-xs text-white focus:border-[#640C0C] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5">
                          Gender
                        </label>
                        <div className="flex items-center gap-6 py-1">
                          {(["male", "female", "other"] as const).map((g) => (
                            <label
                              key={g}
                              className="flex items-center gap-2 text-xs text-white/80 capitalize cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="gender"
                                checked={formData.gender === g}
                                onChange={() =>
                                  setFormData({ ...formData, gender: g })
                                }
                                className="accent-[#640C0C] h-4 w-4 cursor-pointer"
                              />
                              <span>{g}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1.5">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/15 px-4 text-xs font-mono text-white focus:border-[#640C0C] focus:outline-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-white/60 mb-1.5">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/15 px-4 text-xs text-white focus:border-[#640C0C] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsEditingInfo(false)}
                          className="px-4 py-2 rounded-full border border-white/15 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          Discard
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                          Full Name
                        </span>
                        <p className="text-sm font-semibold text-white">
                          {formData.name || "—"}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                          Date of Birth
                        </span>
                        <p className="text-sm font-semibold text-white font-mono">
                          {formData.dob || "—"}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                          Gender
                        </span>
                        <p className="text-sm font-semibold text-white capitalize">
                          {formData.gender || "—"}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                          Phone Number
                        </span>
                        <p className="text-sm font-semibold text-white font-mono">
                          {formData.phone || "—"}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 sm:col-span-2">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 block mb-1">
                          Email Address
                        </span>
                        <p className="text-sm font-semibold text-white">
                          {formData.email || "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* 2. Direct Orders Table with Rounded Search Box and Admin Pill Switcher */}
            {activeTab === "orders" && (
              <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 px-4 sm:px-6 py-4 bg-[#121212]">
                  <div className="flex sm:hidden items-center gap-2 w-full">
                    <div className="relative shrink-0 w-32">
                      <select
                        value={ordersFilter}
                        onChange={(e) => setOrdersFilter(e.target.value)}
                        className="w-full h-9 rounded-full bg-[#0a0a0a] border border-white/10 pl-3 pr-7 text-xs text-white appearance-none outline-none focus:border-white/30 cursor-pointer"
                      >
                        {orderTabs.map((tab) => (
                          <option key={tab} value={tab} className="bg-[#121212] text-white">
                            {tab}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50 pointer-events-none" />
                    </div>

                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
                      <input
                        type="text"
                        value={ordersSearch}
                        onChange={(e) => setOrdersSearch(e.target.value)}
                        placeholder="Search orders..."
                        className="w-full h-9 rounded-full bg-[#0a0a0a] border border-white/10 pl-8 pr-7 text-xs text-white placeholder-white/40 outline-none focus:border-white/30"
                      />
                      {ordersSearch && (
                        <button
                          type="button"
                          onClick={() => setOrdersSearch("")}
                          aria-label="Clear search"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-white/40 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/5 w-fit overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {orderTabs.map((tab) => {
                      const isActive = ordersFilter === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setOrdersFilter(tab)}
                          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? "bg-white text-black shadow-sm"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  <div className="hidden sm:flex items-center gap-2.5">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
                      <input
                        type="text"
                        value={ordersSearch}
                        onChange={(e) => setOrdersSearch(e.target.value)}
                        placeholder="Search orders..."
                        className="w-full h-9 rounded-full bg-[#0a0a0a] border border-white/10 pl-9 pr-7 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 focus:bg-[#121212]"
                      />
                      {ordersSearch && (
                        <button
                          type="button"
                          onClick={() => setOrdersSearch("")}
                          aria-label="Clear search"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-white/10 text-xs font-semibold text-white/50 uppercase tracking-wider bg-white/[0.02]">
                  <div className="col-span-3">Order ID</div>
                  <div className="col-span-5">Product Name</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                <div className="divide-y divide-white/5" ref={dropdownRef}>
                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-white/40 text-xs sm:text-sm">No matching orders found.</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div key={order.id} className="hover:bg-white/[0.02] transition-colors">
                        <div
                          className="md:hidden p-4 space-y-2.5 cursor-pointer relative"
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-16 h-16 bg-[#0a0a0a] rounded-xl border border-white/10 p-1 shrink-0 flex items-center justify-center">
                              <img
                                src={order.image}
                                alt={order.productName}
                                className="object-contain w-full h-full mix-blend-screen"
                              />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                                  {order.productName}
                                </p>

                                <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenDropdownId(openDropdownId === order.id ? null : order.id)
                                    }
                                    className="p-1 -mr-1 -mt-1 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                                    aria-label="Order actions"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>

                                  {openDropdownId === order.id && (
                                    <div className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden text-xs">
                                      <button
                                        type="button"
                                        onClick={() => alert("Invoice download initiated.")}
                                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download Invoice</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => router.push(`/products`)}
                                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>Buy Again</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveTab("returns");
                                          setOpenDropdownId(null);
                                        }}
                                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 border-t border-white/5 cursor-pointer"
                                      >
                                        <Undo2 className="w-3.5 h-3.5" />
                                        <span>Request Return</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-white/50 font-mono">
                                <span>{order.id}</span>
                                <span>•</span>
                                <span>{order.date}</span>
                              </div>

                              <div className="flex items-center justify-between text-xs pt-0.5">
                                <span className="font-semibold text-white">
                                  ₹{order.amount.toLocaleString("en-IN")}
                                </span>
                                <span className={`font-medium ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="hidden md:grid grid-cols-12 gap-3 items-center px-6 py-4 hover:bg-white/[0.04] transition-colors relative cursor-pointer"
                        >
                          <div className="col-span-3 text-xs font-mono font-medium text-white/70">
                            {order.id}
                          </div>

                          <div className="col-span-5 flex items-center gap-3">
                            <div className="w-11 h-11 bg-[#0a0a0a] rounded-lg border border-white/5 p-1 shrink-0 flex items-center justify-center">
                              <img
                                src={order.image}
                                alt={order.productName}
                                className="object-contain w-full h-full mix-blend-screen"
                              />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-white line-clamp-1">
                                {order.productName}
                              </p>
                              <p className="text-[11px] text-white/40">
                                ₹{order.amount.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>

                          <div className="col-span-2 text-xs text-white/60">
                            {order.date}
                          </div>

                          <div className="col-span-1 flex justify-center items-center">
                            <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>

                          <div
                            className="col-span-1 flex justify-center relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenDropdownId(openDropdownId === order.id ? null : order.id)
                              }
                              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                              aria-label="Order actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openDropdownId === order.id && (
                              <div className="absolute right-0 top-9 w-44 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden text-xs">
                                <button
                                  type="button"
                                  onClick={() => alert("Invoice download initiated.")}
                                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Invoice</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => router.push(`/products`)}
                                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Buy Again</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab("returns");
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 border-t border-white/5 cursor-pointer"
                                >
                                  <Undo2 className="w-3.5 h-3.5" />
                                  <span>Request Return</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "returns" && (
              <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
                {refundSuccessMessage && (
                  <div className="m-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-400">
                    <Check className="h-4 w-4" />
                    <span>{refundSuccessMessage}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 px-4 sm:px-6 py-4 bg-[#121212]">
                  <div className="flex sm:hidden items-center justify-between gap-2.5 w-full">
                    <button
                      type="button"
                      onClick={() => setRequestRefundModalOpen(true)}
                      className="inline-flex items-center gap-1.5 h-9 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-3.5 text-xs font-semibold text-white shrink-0 cursor-pointer shadow-md"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Request Refund</span>
                    </button>

                    <div className="relative shrink-0 w-36">
                      <select
                        value={returnsFilter}
                        onChange={(e) => setReturnsFilter(e.target.value)}
                        className="w-full h-9 rounded-full bg-[#0a0a0a] border border-white/10 pl-3 pr-7 text-xs text-white appearance-none outline-none focus:border-white/30 cursor-pointer"
                      >
                        {returnTabs.map((tab) => (
                          <option key={tab} value={tab} className="bg-[#121212] text-white">
                            {tab}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50 pointer-events-none" />
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/5 w-fit overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {returnTabs.map((tab) => {
                      const isActive = returnsFilter === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setReturnsFilter(tab)}
                          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? "bg-white text-black shadow-sm"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  <div className="hidden sm:block">
                    <button
                      type="button"
                      onClick={() => setRequestRefundModalOpen(true)}
                      className="inline-flex items-center gap-1.5 h-9 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-4.5 text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-md cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Request a Refund</span>
                    </button>
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-white/10 text-xs font-semibold text-white/50 uppercase tracking-wider bg-white/[0.02]">
                  <div className="col-span-2">Return ID</div>
                  <div className="col-span-4">Item Name</div>
                  <div className="col-span-2">Requested Date</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Total Amount</div>
                </div>

                <div className="divide-y divide-white/5">
                  {filteredReturns.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-white/40 text-xs sm:text-sm">No return requests found.</p>
                    </div>
                  ) : (
                    filteredReturns.map((ret) => (
                      <div key={ret.id} className="hover:bg-white/[0.02] transition-colors">
                        <div className="md:hidden p-4 space-y-2.5">
                          <div className="flex items-start gap-3.5">
                            <div className="w-16 h-16 bg-[#0a0a0a] rounded-xl border border-white/10 p-1 shrink-0 flex items-center justify-center">
                              <img
                                src={ret.image}
                                alt={ret.productName}
                                className="object-contain w-full h-full mix-blend-screen"
                              />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <p className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                                {ret.productName}
                              </p>

                              <div className="flex items-center gap-2 text-[11px] text-white/50 font-mono">
                                <span>{ret.id}</span>
                                <span>•</span>
                                <span>{ret.requestedOn}</span>
                              </div>

                              <div className="text-[11px] text-white/40">
                                Order #{ret.orderId}
                              </div>

                              {ret.reason && (
                                <p className="text-[11px] text-white/50 italic line-clamp-1">
                                  {ret.reason}
                                </p>
                              )}

                              <div className="flex items-center justify-between text-xs pt-0.5">
                                <span className="font-semibold text-white">
                                  ₹{ret.amount.toLocaleString("en-IN")}
                                </span>
                                <span className={`font-medium ${getStatusColor(ret.status)}`}>
                                  {ret.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden md:grid grid-cols-12 gap-3 items-center px-6 py-4 hover:bg-white/[0.04] transition-colors">
                          <div className="col-span-2 font-mono text-xs font-semibold text-white/80">
                            {ret.id}
                          </div>

                          <div className="col-span-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0a0a0a] rounded-lg border border-white/5 p-1 shrink-0 flex items-center justify-center">
                              <img
                                src={ret.image}
                                alt={ret.productName}
                                className="object-contain w-full h-full mix-blend-screen"
                              />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-white line-clamp-1">
                                {ret.productName}
                              </p>
                              <p className="text-[11px] text-white/40">
                                Order #{ret.orderId}
                              </p>
                            </div>
                          </div>

                          <div className="col-span-2 text-xs text-white/60">
                            {ret.requestedOn}
                          </div>

                          <div className="col-span-2">
                            <span className={`text-xs font-medium ${getStatusColor(ret.status)}`}>
                              {ret.status}
                            </span>
                          </div>

                          <div className="col-span-2 text-right text-xs sm:text-sm font-semibold text-white">
                            ₹{ret.amount.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "cart" && (
              <div className="rounded-[20px] bg-[#121212] border border-white/10 p-4 sm:p-7 space-y-5">
                <div className="sm:hidden flex items-center justify-end pb-3 border-b border-white/10">
                  <Link
                    href="/cart"
                    className="inline-flex items-center gap-1.5 h-8 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-md shrink-0 cursor-pointer"
                  >
                    <span>View Cart</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="hidden sm:flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        Cart Products ({cartItems.length})
                      </h3>
                      <p className="text-[11px] text-white/40 truncate">
                        Items currently in your cart
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/cart"
                    className="inline-flex items-center gap-1.5 h-9 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-4.5 text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-md shrink-0 cursor-pointer"
                  >
                    <span>View Cart</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {cartItems.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center space-y-3">
                    <ShoppingCart className="h-8 w-8 text-white/20 mx-auto" />
                    <p className="text-xs text-white/40">Your cart is currently empty.</p>
                    <Link href="/products" className="inline-block pt-1">
                      <Button className="rounded-full bg-[#640C0C] text-xs h-9 px-4">
                        Browse Catalogue
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="group flex items-center gap-3 p-3 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-[#640C0C]/50 hover:bg-white/[0.03] transition-all relative"
                        >
                          <Link
                            href="/cart"
                            className="w-16 h-16 bg-black rounded-xl border border-white/10 p-1.5 shrink-0 flex items-center justify-center cursor-pointer"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="object-contain w-full h-full mix-blend-screen"
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link href="/cart" className="block cursor-pointer">
                              <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-white/90">
                                {item.name}
                              </p>
                            </Link>
                            {item.color && (
                              <p className="text-[10px] text-white/40 mt-0.5">
                                Color: {item.color}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-1 text-xs">
                              <span className="text-white/50 text-[11px] bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                Qty: {item.quantity}
                              </span>
                              <span className="font-semibold text-white text-xs sm:text-sm">
                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              removeFromCart(item.id);
                            }}
                            aria-label="Remove item"
                            className="p-1.5 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center justify-between sm:justify-start sm:gap-4">
                        <span className="text-xs text-white/50">
                          Total ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items):
                        </span>
                        <span className="text-sm sm:text-base font-bold text-white">
                          ₹{cartTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Link href="/cart" className="w-full sm:w-auto">
                          <Button className="w-full sm:w-auto rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-xs h-9 px-5 font-semibold text-white">
                            Proceed to Checkout
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Address Book */}
            {activeTab === "addresses" && (
              <div className="rounded-[20px] bg-[#121212] border border-white/10 p-6 sm:p-7 space-y-6">
                <div className="flex items-center justify-end pb-2">
                  <button
                    type="button"
                    onClick={() => setIsAddAddressOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#640C0C] hover:bg-[#7a1010] px-4 py-2 rounded-full transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                {isAddAddressOpen && (
                  <form
                    onSubmit={handleAddAddress}
                    className="p-5 rounded-2xl border border-white/15 bg-[#0a0a0a] space-y-4"
                  >
                    <h3 className="text-sm font-bold text-white">New Shipping Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={newAddr.name}
                        onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                        className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Phone Number"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Address Line / Street / Flat"
                        value={newAddr.addressLine}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, addressLine: e.target.value })
                        }
                        className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30 sm:col-span-2"
                      />
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Pincode"
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        className="h-10 px-3.5 rounded-lg bg-[#141414] border border-white/10 text-white placeholder:text-white/30"
                      />
                      <div className="flex items-center gap-4">
                        <label className="text-xs text-white/70">Type:</label>
                        <label className="inline-flex items-center gap-1.5 text-xs text-white cursor-pointer">
                          <input
                            type="radio"
                            name="addrType"
                            checked={newAddr.type === "Home"}
                            onChange={() => setNewAddr({ ...newAddr, type: "Home" })}
                            className="accent-[#640C0C]"
                          />
                          Home
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs text-white cursor-pointer">
                          <input
                            type="radio"
                            name="addrType"
                            checked={newAddr.type === "Work"}
                            onChange={() => setNewAddr({ ...newAddr, type: "Work" })}
                            className="accent-[#640C0C]"
                          />
                          Work
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddAddressOpen(false)}
                        className="px-3.5 py-1.5 text-xs text-white/60 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-xs font-semibold text-white cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`rounded-2xl border p-5 space-y-3 relative ${
                        addr.isDefault
                          ? "border-[#640C0C] bg-[#640C0C]/5"
                          : "border-white/10 bg-[#0a0a0a]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          {addr.type}
                        </span>
                        {addr.isDefault ? (
                          <span className="text-[10px] font-medium text-emerald-400">
                            Default Address
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">{addr.name}</p>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">
                          {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-white/40 font-mono mt-1">{addr.phone}</p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-white/40 hover:text-red-400 transition-colors p-1"
                          title="Delete Address"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Change Password */}
            {activeTab === "security" && (
              <div className="rounded-[20px] bg-[#121212] border border-white/10 p-6 sm:p-8">
                {passwordSuccess && (
                  <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-400">
                    <Check className="h-4 w-4" />
                    <span>Password changed successfully.</span>
                  </div>
                )}

                {passwordError && (
                  <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <form onSubmit={handlePasswordSubmit} className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordState.current}
                        onChange={(e) =>
                          setPasswordState({ ...passwordState, current: e.target.value })
                        }
                        placeholder="••••••••"
                        className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordState.newPass}
                          onChange={(e) =>
                            setPasswordState({ ...passwordState, newPass: e.target.value })
                          }
                          placeholder="Min 6 characters"
                          className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordState.confirmPass}
                          onChange={(e) =>
                            setPasswordState({
                              ...passwordState,
                              confirmPass: e.target.value,
                            })
                          }
                          placeholder="Confirm password"
                          className="w-full h-11 rounded-full bg-[#0a0a0a] border border-white/10 px-4 text-xs text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>

                  <div className="lg:col-span-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <KeyRound className="h-4 w-4 text-[#640C0C]" />
                      <span>Password Guidelines</span>
                    </div>
                    <ul className="space-y-2 text-[11px] text-white/50 leading-relaxed list-disc list-inside">
                      <li>Use a combination of uppercase, lowercase letters and numbers.</li>
                      <li>Minimum 6 characters in length.</li>
                      <li>Avoid using common phrases or personal information.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Request Refund Modal */}
      {requestRefundModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setRequestRefundModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-[20px] border border-white/10 bg-[#121212] p-6 shadow-2xl text-white space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Request a Refund or Return</h3>
              <button
                type="button"
                onClick={() => setRequestRefundModalOpen(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Select Order
                </label>
                <select
                  required
                  value={refundForm.orderId}
                  onChange={(e) => {
                    const sel = mockOrders.find((o) => o.id === e.target.value);
                    setRefundForm({
                      ...refundForm,
                      orderId: e.target.value,
                      productName: sel ? sel.productName : "",
                    });
                  }}
                  className="w-full h-10 rounded-xl bg-[#0a0a0a] border border-white/10 px-3 text-xs text-white outline-none focus:border-white/30"
                >
                  <option value="">Select a past purchase...</option>
                  {mockOrders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      {ord.id} — {ord.productName} (₹{ord.amount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Reason for Return / Refund
                </label>
                <textarea
                  required
                  rows={3}
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  placeholder="Describe why you want to return or request a refund (e.g. fitment issue, damaged package, defect)..."
                  className="w-full rounded-xl bg-[#0a0a0a] border border-white/10 p-3 text-xs text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestRefundModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-white/15 text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign Out Modal */}
      {logoutDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => {
            if (!logoutMutation.isPending) setLogoutDialogOpen(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-[20px] border border-white/10 bg-[#121212] p-6 shadow-2xl text-white space-y-5"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#640C0C]/10 border border-[#640C0C]/20 text-[#640C0C]">
                <LogOut className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight text-white">
                  Sign Out of Your Account
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Are you sure you want to sign out? You will need to log in again with your phone number and password.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={logoutMutation.isPending}
                onClick={() => setLogoutDialogOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={logoutMutation.isPending}
                onClick={handleConfirmLogout}
                className="rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white px-5 py-2 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
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