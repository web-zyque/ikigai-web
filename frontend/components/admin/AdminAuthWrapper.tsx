"use client";

import { useMe } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { data: user, isLoading, error } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (error || !user) {

        router.push('/login');
        return;
      }
      
      if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        router.push('/');
        return;
      }
    }
  }, [user, isLoading, error, router]);

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

  return <>{children}</>;
}