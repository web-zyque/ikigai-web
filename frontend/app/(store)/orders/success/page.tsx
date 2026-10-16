"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { DownloadIcon } from "@phosphor-icons/react";
import { exportReceiptToPdf } from "@/utils/exportReceiptToPdf";
import {
  ArrowLeft,
  ShoppingBag,
  Printer,
  ExternalLink,
  FileText,
  RotateCcw,
  Sparkles
} from "lucide-react";
import {
  ReceiptPrinter,
  type ReceiptPrinterStage
} from "@/components/store/ReceiptPrinter";
import { Button } from "@/components/ui/button";


interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  orderId: string;
  date: string;
  status: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const paramOrderId = searchParams.get("orderId") || searchParams.get("id");
  const [stage, setStage] = useState<ReceiptPrinterStage>("processing");

  const order = useMemo<OrderData>(() => {
    // Generate realistic order details or load from search params
    const id = paramOrderId || "IKG-829104";
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      orderId: id,
      date: formattedDate,
      status: "Confirmed",
      paymentMethod: "Credit Card (•••• 4242)",
      customerName: "Alex Mercer",
      customerEmail: "alex.mercer@example.com",
      shippingAddress: "742 Evergreen Terrace, Springfield, OR",
      items: [
        {
          id: "item-1",
          name: "Ikigai Titanium Shift Knob",
          quantity: 1,
          price: 189.0,
        },
        {
          id: "item-2",
          name: "Forged Carbon Paddle Shifters",
          quantity: 1,
          price: 249.0,
        },
        {
          id: "item-3",
          name: "High-Flow Cotton Air Filter",
          quantity: 2,
          price: 65.0,
        },
      ],
      subtotal: 568.0,
      discount: 25.0,
      shippingFee: 0.0,
      total: 543.0,
    };
  }, [paramOrderId]);

  useEffect(() => {
    // Stage pipeline animation: processing -> printing -> complete
    const printTimer = setTimeout(() => {
      setStage("printing");
    }, 1200);

    const completeTimer = setTimeout(() => {
      setStage("complete");
    }, 3400);

    return () => {
      clearTimeout(printTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-[calc(100vh-81px)] lg:h-[calc(100vh-81px)] lg:max-h-[calc(100vh-81px)] bg-black text-white relative flex flex-col justify-start lg:justify-center px-4 sm:px-6 lg:px-12 selection:bg-[#640C0C] selection:text-white lg:overflow-hidden pt-4 pb-8 lg:py-0">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10"
      >
        <div className="w-[500px] h-[500px] rounded-full bg-[#640C0C]/15 blur-[140px] opacity-75" />
        <div className="w-[300px] h-[300px] rounded-full bg-white/[0.03] blur-[100px] translate-y-32" />
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start lg:items-center">
        {/* Left Column: Compact Receipt Printer */}
        <div className="lg:col-span-5 flex justify-center items-start">
          <div className="w-full max-w-[330px] h-auto overflow-visible">
            <ReceiptPrinter.Root
              stage={stage}
              feedMotion="stepped"
              className="w-full h-auto overflow-visible drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
            >
              <ReceiptPrinter.Machine className="p-2.5 pb-6">
                <ReceiptPrinter.Header className="h-9 mb-1.5 px-0.5">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-md overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center p-0.5">
                      <Image
                        src="/images/logo.png"
                        alt="Ikigai Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-100 block leading-tight mb-1">
                        Ikigai Customs Accessories
                      </span>
                      <span className="text-[9px] text-zinc-400 block leading-tight">
                        Official Order Receipt
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStage("processing");

                      setTimeout(() => {
                        setStage("printing");
                      }, 900);

                      setTimeout(() => {
                        setStage("complete");
                      }, 2800);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-zinc-800/80 text-zinc-300 transition-colors hover:bg-zinc-700/80 hover:text-white"
                    title="Replay printing animation"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </ReceiptPrinter.Header>

                <ReceiptPrinter.Screen className="p-2.5 py-2">
                  <ReceiptPrinter.Status className="text-[11px] font-medium text-zinc-200" />
                </ReceiptPrinter.Screen>
              </ReceiptPrinter.Machine>

              <ReceiptPrinter.Output className="-mt-3 w-full h-auto px-2">
                <ReceiptPrinter.Paper id="receipt-content" className="h-auto min-h-0 max-h-none overflow-visible bg-[#fcfbf9] text-zinc-900 border-x border-zinc-300/60 shadow-xl px-4 pt-4 pb-7">
                  {order ? (
                    <div className="space-y-2.5 text-[10.5px] font-mono leading-tight">
                      {/* Receipt Header */}
                      <div className="text-center pb-2 border-b border-dashed border-zinc-300">
                        <div className="font-black text-xs tracking-wider uppercase text-zinc-950">
                          IKIGAI CUSTOMS CAR ACCESSORIES
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">
                          Performance &amp; Styling Precision
                        </div>
                        <div className="text-[9px] text-zinc-400">
                          www.ikigaiautomotive.in
                        </div>
                      </div>

                      <div className="space-y-0.5 text-[9.5px] pb-2 border-b border-dashed border-zinc-300">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Order ID:</span>
                          <span className="font-bold text-zinc-900">{order.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Date:</span>
                          <span className="text-zinc-700">{order.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Payment:</span>
                          <span className="text-zinc-700">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Customer:</span>
                          <span className="text-zinc-700 truncate max-w-[150px] text-right">
                            {order.customerName}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pb-2 border-b border-dashed border-zinc-300">
                        <div className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
                          Purchased Items
                        </div>

                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start text-[9.5px]">
                              <div className="pr-1.5">
                                <span className="font-medium text-zinc-900 line-clamp-1">
                                  {item.name}
                                </span>
                                <span className="text-[8.5px] text-zinc-500">
                                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                                </span>
                              </div>
                              <span className="font-semibold text-zinc-900 whitespace-nowrap">
                                ₹{(item.quantity * item.price).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals Breakdown */}
                      <div className="space-y-0.5 text-[9.5px] pb-2 border-b border-dashed border-zinc-300">
                        <div className="flex justify-between text-zinc-600">
                          <span>Subtotal:</span>
                          <span>₹{order.subtotal.toFixed(2)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Discount:</span>
                            <span>-₹{order.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-zinc-600">
                          <span>Shipping:</span>
                          <span>
                            {order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-zinc-950 pt-1 border-t border-zinc-200">
                          <span>TOTAL:</span>
                          <span>₹{order.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Barcode & Footer note */}
                      <div className="text-center pt-1 space-y-1">
                        <div className="flex justify-center items-center gap-[1.5px] h-6 px-4 opacity-80 mix-blend-multiply">
                          {[4, 2, 5, 1, 3, 4, 2, 1, 6, 3, 2, 4, 1, 3, 2, 5, 2, 3, 1, 4, 2, 2, 5, 1, 3, 2, 4, 2].map((w, idx) => (
                            <span
                              key={idx}
                              className="bg-zinc-900 h-full inline-block"
                              style={{ width: `${w}px` }}
                            />
                          ))}
                        </div>
                        <div className="text-[8px] tracking-widest text-zinc-400">
                          *{order.orderId}*
                        </div>
                        <p className="text-[8.5px] text-zinc-500 italic">
                          Keep this receipt for warranty and tracking.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                      Generating receipt...
                    </div>
                  )}
                </ReceiptPrinter.Paper>
              </ReceiptPrinter.Output>
            </ReceiptPrinter.Root>
          </div>
        </div>

        {/* Right Column: Greetings, Info, and Primary Actions */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs text-white/80 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#640C0C]" />
              <span className="font-medium">Order Placed Successfully</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight uppercase bg-gradient-to-r from-white via-white/80 to-white/30 bg-clip-text text-transparent">
              Receipt Generated
            </h1>

            <p className="text-sm text-zinc-400 max-w-lg leading-relaxed">
              Thank you for shopping with <strong className="text-white font-semibold">Ikigai Customs Car Accessories</strong>. Your order confirmation and digital proof of purchase have been issued. We are currently prepping your performance package for prompt dispatch.
            </p>
          </div>

          {/* Highlights Card */}
          <div className=" grid grid-cols-2 gap-3 max-w-lg mb-3 mt-1">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-sm">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 block mb-1">Confirmation Sent</span>
              <span className="text-xs sm:text-sm font-medium text-zinc-200 truncate block">
                {order.customerEmail}
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-sm">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 block mb-1">Dispatch Method</span>
              <span className="text-xs sm:text-sm font-medium text-zinc-200 block">
                Tracked Express Delivery
              </span>
            </div>
          </div>

          <div className="w-full max-w-lg">
            {/* Action Buttons */}
            <div className="flex flex-cols sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!order) return;
                  exportReceiptToPdf(order);
                }}
                className="flex-1 rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium h-11 text-xs gap-2 transition-all"
              >
                <Printer className="w-4 h-4 text-white/70" />
                Print Receipt
              </Button>

              <Button
                asChild
                className="flex-1 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white font-medium h-11 text-xs gap-2 shadow-lg shadow-[#640C0C]/30 transition-all"
              >
                <Link href="/orders">
                  <FileText className="w-4 h-4" />
                  View All Orders
                </Link>
              </Button>
            </div>

            {/* Continue Shopping */}
            <div className="mt-3 sm:mt-6 flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 py-1 text-xs text-zinc-400 transition-colors hover:text-white"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Continue Shopping</span>
                <ExternalLink className="ml-0.5 h-3 w-3 opacity-50" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-white/50 text-sm">Loading receipt details...</div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
