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


  if (!mounted) {
    return (
      <Link href="/login" className={LOGIN_LINK_CLASS}>
        Login
      </Link>
    );
  }

  if (isLoading) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
    );
  }

  if (user) {
    return <UserProfileMenu user={user} />;
  }

  return (
    <Link href="/login" className={LOGIN_LINK_CLASS}>
      Login
    </Link>
  );
}