"use client";

import { useMe } from "@/hooks/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasAuthSession } from "@/lib/auth-storage";

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { data: user, isLoading, error } = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isMounted) {
      if (error || !user) {
        // Preserve the intended destination so login can bounce back
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname ?? "/admin")}`;
        router.push(loginUrl);
        return;
      }
      if (user.role !== "ADMIN" && user.role !== "STAFF") {
        router.push("/");
        return;
      }
    }
  }, [user, isLoading, error, router, isMounted, pathname]);

  // SSR: return null to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Still fetching — but if there is a local session marker, optimistically
  // render children to avoid the full-screen spinner on every navigation
  if (isLoading) {
    const hasLocalSession = hasAuthSession();
    if (hasLocalSession) {
      return <>{children}</>;
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or wrong role — show spinner while redirect fires
  if (error || !user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}