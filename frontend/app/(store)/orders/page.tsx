"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile?tab=orders");
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white/40 text-xs animate-pulse">Opening orders in your profile...</p>
    </div>
  );
}
