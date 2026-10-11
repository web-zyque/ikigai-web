"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useMe } from "@/hooks/auth";
import { hasAuthSession } from "@/lib/auth-storage";
import { UserProfileMenu } from "./UserProfileMenu";

const emptySubscribe = () => () => {};

export function AuthButton() {
  const hasSession = useSyncExternalStore(
    emptySubscribe,
    () => hasAuthSession(),
    () => false
  );

  const { data: user, isLoading, error } = useMe({ enabled: hasSession });

  if (hasSession && isLoading) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
    );
  }

  // If user is authenticated and data loaded
  if (user && !error) {
    return <UserProfileMenu user={user} />;
  }

  // Default: Instant Login button for guests and unauthenticated visitors
  return (
    <Link
      href="/login"
      className="rounded-full border border-white/15 bg-ik-accent px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-ik-accent/90 sm:block"
    >
      Login
    </Link>
  );
}