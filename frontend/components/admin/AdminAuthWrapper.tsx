"use client";

import { useMe } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { data: user, isLoading, error } = useMe();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isMounted) {
      if (error || !user) {
        // Not authenticated, redirect to login
        router.push('/login');
        return;
      }
      
      if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        // Not an admin or staff, redirect to customer area
        router.push('/');
        return;
      }
    }
  }, [user, isLoading, error, router, isMounted]);

  // Show nothing during SSR to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting for unauthorized users
  if (error || !user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Redirecting...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and is an admin or staff
  return <>{children}</>;
}