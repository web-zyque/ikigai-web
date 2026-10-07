"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MoreVertical, Download, RefreshCw, Undo2, XCircle, Search } from "lucide-react";
import { useMe } from "@/hooks/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const mockOrders = [
  {
    id: "ORD-94827-XYZ",
    productName: "Premium Brake Kit 1",
    date: "2023-10-05",
    amount: 1299.00,
    status: "Delivered",
    image: "/images/category_brakes.jpg"
  },
  {
    id: "ORD-94828-ABC",
    productName: "Performance Suspension 2 — Pro Series",
    date: "2023-10-06",
    amount: 1449.00,
    status: "Processing",
    image: "/images/category_suspension.jpg"
  },
  {
    id: "ORD-94829-DEF",
    productName: "Alloy Wheel Set 4 — Forged",
    date: "2023-10-07",
    amount: 1749.00,
    status: "Shipped",
    image: "/images/category_wheels.jpg"
  }
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered": return "text-green-500";
    case "processing": return "text-yellow-500";
    case "shipped": return "text-blue-500";
    case "cancelled": return "text-red-500";
    default: return "text-white/70";
  }
};

export default function OrdersPage() {
  const { data: user, isLoading } = useMe();
  const router = useRouter();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const navigateToOrder = (id: string, e: React.MouseEvent) => {
    // If click was inside the dropdown, don't navigate
    if (openDropdownId === id) return;
    router.push(`/orders/${id}`);
  };

  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      const s = order.status.toLowerCase();
      let matchesTab = false;
      
      if (activeTab === "All") matchesTab = true;
      else if (activeTab === "Delivered") matchesTab = s === "delivered";
      else if (activeTab === "Cancelled") matchesTab = s === "cancelled";

      const matchesSearch = order.productName.toLowerCase().includes(searchQuery.toLowerCase()) || order.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-black flex justify-center items-center">
        <p className="text-white/50">Loading orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-[#121212] border border-white/5 rounded-[20px] p-8 md:p-12 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-3">Login Required</h2>
          <p className="text-white/60 mb-8 text-sm leading-relaxed">
            Please log in to your account to view your order history.
          </p>
          <Link href="/login">
            <Button className="w-full rounded-full bg-[#640C0C] text-white hover:opacity-90 h-12 font-medium">
              Log In to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Orders</h1>
            <p className="text-white/50 text-sm">View and manage your recent purchases</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 self-start md:self-auto w-full md:w-auto">
            {/* Search Box on the Left of the Tab Switcher */}
            <div className="relative w-full sm:w-64 shrink-0 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 transition-colors group-focus-within:text-white" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-all hover:bg-white/5"
              />
            </div>

            {/* Tab Switcher on the Right */}
            <div className="flex bg-[#121212] border border-white/10 p-1 rounded-full w-full sm:w-auto shrink-0 shadow-inner">
              {["All", "Delivered", "Cancelled"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ease-out ${
                    activeTab === tab 
                      ? "bg-white text-black shadow-md scale-100" 
                      : "text-white/60 hover:text-white hover:bg-white/10 scale-95 hover:scale-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#121212] rounded-[20px] border border-white/5">
          
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-xs font-medium text-white/50 bg-white/5 uppercase tracking-wider rounded-t-[20px]">
            <div className="col-span-3">Order ID</div>
            <div className="col-span-5">Product Name</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Orders List */}
          <div className="divide-y divide-white/10" ref={dropdownRef}>
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-white/50">No orders found.</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div 
                  key={order.id} 
                  onClick={(e) => navigateToOrder(order.id, e)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-5 hover:bg-white/[0.04] transition-colors relative cursor-pointer last:rounded-b-[20px]"
                >
                  
                  {/* Mobile-only Order ID & Date layout */}
                  <div className="md:hidden flex justify-between items-center mb-2">
                    <span className="text-xs text-white/50">{order.id}</span>
                    <span className="text-xs text-white/50">{order.date}</span>
                  </div>

                  <div className="col-span-3 hidden md:block text-sm font-medium text-white/70">
                    {order.id}
                  </div>
                  
                  <div className="col-span-1 md:col-span-5 flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#0a0a0a] rounded-lg border border-white/5 p-1 shrink-0 flex items-center justify-center">
                      <img src={order.image} alt={order.productName} className="object-contain w-full h-full mix-blend-screen" />
                    </div>
                    <p className="text-sm font-medium text-white line-clamp-2">{order.productName}</p>
                  </div>

                  <div className="col-span-2 hidden md:block text-sm text-white/60">
                    {order.date}
                  </div>

                  {/* Mobile Status row */}
                  <div className="md:hidden flex justify-end items-center mt-2 border-t border-white/5 pt-3">
                    <div className={`text-sm ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="col-span-1 hidden md:flex justify-center">
                    <div className={`text-sm whitespace-nowrap ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="col-span-1 flex justify-end md:justify-center relative absolute md:static top-5 right-4">
                    <button 
                      onClick={(e) => toggleDropdown(order.id, e)}
                      className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                      aria-label="Order options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdownId === order.id && (
                      <div 
                        className="absolute right-8 md:right-10 top-12 md:top-auto md:mt-10 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl shadow-black/80 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col py-1">
                          <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left">
                            <Download className="w-4 h-4" /> Download Invoice
                          </button>
                          <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left">
                            <RefreshCw className="w-4 h-4" /> Buy Again
                          </button>
                          <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left">
                            <Undo2 className="w-4 h-4" /> Request Refund
                          </button>
                          {order.status.toLowerCase() !== 'shipped' && order.status.toLowerCase() !== 'delivered' && (
                            <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors text-left border-t border-white/5 mt-1 pt-2.5">
                              <XCircle className="w-4 h-4" /> Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
