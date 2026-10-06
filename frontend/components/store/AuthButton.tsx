"use client";

import Link from "next/link";
import { useMe } from "@/hooks/auth";
import { UserProfileMenu } from "./UserProfileMenu";

export function AuthButton() {
  const { data: user, isLoading, error } = useMe();

  if (isLoading) {
    return (
      <div className="rounded-full border border-white/15 bg-ik-accent px-5 py-2 text-xs font-medium text-white">
        <span className="opacity-0">Login</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-white/15 bg-ik-accent px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-ik-accent/90 sm:block"
      >
        Login
      </Link>
    );
  }

  return <UserProfileMenu user={user} />;
}