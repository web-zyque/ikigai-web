"use client";

import { AuthForm } from "@/components/ui/login-minimal";
import { useMe } from "@/hooks/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function LoginContent() {
  const { data: user, isLoading } = useMe();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && user) {
      // Use the redirect param if present, otherwise default by role
      const redirect = searchParams.get("redirect");
      if (redirect) {
        router.replace(redirect);
      } else if (user.role === "ADMIN" || user.role === "STAFF") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [user, isLoading, router, searchParams]);

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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-black p-6">
          <div className="w-full max-w-sm rounded-[20px] bg-[#121212] border border-white/5 p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/60">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}