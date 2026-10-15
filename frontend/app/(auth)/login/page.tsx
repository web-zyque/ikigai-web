"use client";

import { AuthForm } from "@/components/ui/login-minimal";
import { useMe } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: user, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {

      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  if (!isLoading && user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black p-6">
        <div className="w-full max-w-sm rounded-[20px] bg-[#121212] border border-white/5 p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white/60">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-6">
      <div className="w-full max-w-sm rounded-[20px] bg-[#121212] border border-white/5 p-8 shadow-2xl">
        <AuthForm />
      </div>
    </div>
  );
}
