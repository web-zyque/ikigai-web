"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMe } from "@/hooks/auth";
import { UserProfileMenu } from "./UserProfileMenu";

const LOGIN_LINK_CLASS =
  "rounded-full border border-white/15 bg-ik-accent px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-ik-accent/90 sm:block";

export function AuthButton() {
  const [mounted, setMounted] = useState(false);
  
  const { data: user, isLoading } = useMe();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
    );
  }

  // Show loading while fetching user data
  if (isLoading) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
    );
  }

  // If user data exists, show profile menu
  if (user) {
    return <UserProfileMenu user={user} />;
  }

  // If no user, show login (including when me() returns 401 or network error)
  return (
    <Link href="/login" className={LOGIN_LINK_CLASS}>
      Login
    </Link>
  );
}
