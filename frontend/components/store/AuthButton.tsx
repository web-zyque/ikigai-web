"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMe } from "@/hooks/auth";
import { hasAuthSession } from "@/lib/auth-storage";
import { UserProfileMenu } from "./UserProfileMenu";

const LOGIN_LINK_CLASS =
  "rounded-full border border-white/15 bg-ik-accent px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-ik-accent/90 sm:block";

export function AuthButton() {
  const [mounted, setMounted] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  
  const { data: user, isLoading, isError } = useMe({ 
    enabled: mounted && hasSession 
  });

  useEffect(() => {
    setMounted(true);
    // Check auth session after component mounts
    setHasSession(hasAuthSession());
  }, []);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
    );
  }

  // If no session exists, show login immediately
  if (!hasSession) {
    return (
      <Link href="/login" className={LOGIN_LINK_CLASS}>
        Login
      </Link>
    );
  }

  // Show loading while fetching user data
  if (isLoading) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
    );
  }

  // If error or no user, show login
  if (isError || !user) {
    return (
      <Link href="/login" className={LOGIN_LINK_CLASS}>
        Login
      </Link>
    );
  }

  return <UserProfileMenu user={user} />;
}