"use client";

import { useMe } from "@/hooks/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { use } from "react";
import { Package, Check, Truck, MapPin, Download, Undo2, AlertCircle } from "lucide-react";

const getMockOrder = (id: string) => ({
  id,
  date: "January 8, 2024 at 9:48 pm",
  status: "Shipped",
  paymentStatus: "Paid",
  amount: 1499.00,
  customer: {
    name: "Alex Jander",
    email: "alexjander@gmail.com",
    phone: "+1 628 267 9041",
    address: "1226 University Drive\nMenlo Park, CA 94025\nUnited States",
  },
  items: [
    {
      id: "item-1",
      name: "Macbook Air",
      variant: "Medium • Black",
      description: "Apple M2 chip with 8-core CPU and 8-core GPU. 256GB SSD storage.",
      quantity: 3,
      price: 500.00,
      image: "/images/category_brakes.jpg", 
    }
  ],
  summary: {
    subtotal: 1500.00,
    discount: 1.00,
    shipping: 0.00,
    total: 1499.00,
  },
  tracking: {
    partner: "FedEx Express",
    id: "TRK-983274982374"
  },
  timeline: {
    placed: "Jan 8, 2024 9:48 PM",
    confirmed: "Jan 9, 2024 10:00 AM",
    shipped: "Jan 10, 2024 2:30 PM",
    delivered: null, 
  }
});

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: user, isLoading } = useMe();
  const order = getMockOrder(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-black flex justify-center items-center">
        <p className="text-white/50">Loading order details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-[#121212] border border-white/5 rounded-[20px] p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-3">Login Required</h2>
          <p className="text-white/60 mb-8 text-sm leading-relaxed">
            Please log in to your account to view your order details.
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

  const steps = [
    { key: 'placed', label: 'Order placed', icon: Package },
    { key: 'confirmed', label: 'Order confirmed', icon: Check },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: MapPin },
  ];
  
  const currentStepIndex = steps.findLastIndex(step => order.timeline[step.key as keyof typeof order.timeline] !== null);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Order {order.id}</h1>
            <p className="text-white/50 text-sm">{order.date}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none bg-[#640C0C] border-[#640C0C] text-white hover:bg-[#640C0C]/90 h-10 rounded-full font-medium">
              <Download className="w-4 h-4 mr-2" /> Invoice
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none bg-transparent border-white/10 text-white hover:bg-white/5 h-10 rounded-full font-medium">
              <Undo2 className="w-4 h-4 mr-2" /> Request Refund
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none bg-transparent border-white/10 text-white hover:bg-white/5 h-10 rounded-full font-medium">
              <AlertCircle className="w-4 h-4 mr-2" /> Raise an Issue
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          <div className="flex-1 flex flex-col gap-6">

            <div className="bg-[#121212] rounded-[20px] border border-white/5 p-6 md:p-8">
              <h2 className="text-lg font-bold mb-6">Product Details</h2>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-5 sm:items-start">
                    <div className="w-24 h-24 bg-[#0a0a0a] rounded-lg border border-white/5 p-2 shrink-0 relative flex items-center justify-center">
                      <Image src={item.image} alt={item.name} fill className="object-contain mix-blend-screen p-2" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-white mb-1">{item.name}</h3>
                      <p className="text-sm text-white/50 mb-3 leading-relaxed">{item.description}</p>
                      <p className="text-sm font-medium text-white/70">Quantity: {item.quantity}</p>
                    </div>
                    <div className="flex sm:flex-col sm:text-right gap-2 mt-2 sm:mt-0 items-end shrink-0">
                      <span className="text-base font-bold text-white">${(item.quantity * item.price).toFixed(2)}</span>
                      <span className="text-xs text-white/40">${item.price.toFixed(2)} each</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#121212] rounded-[20px] border border-white/5 p-6 md:p-8 overflow-hidden">
              <h2 className="text-lg font-bold mb-8">Order Status</h2>
              <div className="relative flex justify-between items-start mb-4">

                <div className="absolute left-12 right-12 top-[11px] h-[10px] bg-white/10 z-0 rounded-full">
                  <div 
                    className="absolute left-0 top-0 h-full bg-[#22c55e] transition-all duration-500 rounded-full" 
                    style={{ width: `${(Math.max(currentStepIndex, 0) / (steps.length - 1)) * 100}%` }}
                  ></div>
                </div>

                {steps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-3 w-24">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-[#22c55e] text-white' : 'bg-[#404040] text-white/50'}`}>
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                      <div className="text-center hidden sm:flex flex-col items-center mt-2">
                        <span className={`text-[11px] font-bold whitespace-nowrap ${isCompleted ? 'text-white' : 'text-white/40'}`}>{step.label}</span>
                        {order.timeline[step.key as keyof typeof order.timeline] && (
                          <span className="text-[10px] text-white/40 whitespace-nowrap mt-0.5">{order.timeline[step.key as keyof typeof order.timeline]}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="sm:hidden mt-4 pt-4 border-t border-white/10">
                 <p className="text-sm font-bold text-white mb-1">{steps[Math.max(currentStepIndex, 0)].label}</p>
                 <p className="text-xs text-white/50">{order.timeline[steps[Math.max(currentStepIndex, 0)].key as keyof typeof order.timeline]}</p>
              </div>

              {(order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered') && order.tracking && (
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-start gap-4">
                  <div className="text-left flex flex-col">
                    <span className="text-white/50 text-[10px] font-bold tracking-wider uppercase mb-1">Delivery Partner</span>
                    <span className="text-xs font-bold text-white whitespace-nowrap">{order.tracking.partner}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-white/50 text-[10px] font-bold tracking-wider uppercase mb-1">Tracking ID</span>
                    <span className="text-xs font-bold text-white whitespace-nowrap">{order.tracking.id}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#121212] rounded-[20px] border border-white/5 p-6 md:p-8">
              <h2 className="text-lg font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal <span className="text-white/40 ml-1">({order.items.length} item{order.items.length > 1 ? 's' : ''})</span></span>
                  <span className="text-white font-medium">${order.summary.subtotal.toFixed(2)}</span>
                </div>
                {order.summary.discount > 0 && (
                  <div className="flex justify-between text-white/70">
                    <span>Discount</span>
                    <span className="text-[#640C0C] font-medium">-${order.summary.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span className="text-white font-medium">{order.summary.shipping === 0 ? 'Free' : `$${order.summary.shipping.toFixed(2)}`}</span>
                </div>
                <div className="pt-5 mt-3 border-t border-white/10 flex justify-between items-center">
                  <span className="text-base font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-[#640C0C]">${order.summary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
            
            <div className="bg-[#121212] rounded-[20px] border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-8">Customer Info</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-white/40 text-xs font-bold mb-4 uppercase tracking-wider">Contact</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-white/40 text-[11px] mb-1 uppercase tracking-wider">Name</p>
                      <p className="font-medium text-white/90">{order.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-[11px] mb-1 uppercase tracking-wider">Email</p>
                      <p className="font-medium text-white/90">{order.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-[11px] mb-1 uppercase tracking-wider">Phone</p>
                      <p className="font-medium text-white/90">{order.customer.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-white/40 text-xs font-bold mb-4 uppercase tracking-wider">Shipping Address</h3>
                  <div className="text-sm text-white/90 leading-relaxed whitespace-pre-line font-medium">
                    {order.customer.address}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
