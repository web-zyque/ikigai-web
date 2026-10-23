"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  LogOut,
  ShoppingBag,
  ShoppingCart,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  Lock,
  RotateCcw,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { useMe, useLogout } from "@/hooks/auth";
import { hasAuthSession } from "@/lib/auth-storage";
import { Button } from "@/components/ui/button";
import Footer from "@/components/store/Footer";

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const { data: user, isLoading, isError, error, refetch, isFetching } = useMe();
  const logoutMutation = useLogout();

  useEffect(() => {
    setMounted(true);
    document.title = "My Profile | Ikigai Accessories";
  }, []);

  const hasSession = mounted ? hasAuthSession() : false;

  const isUnauthorized =
    mounted &&
    (!hasSession ||
      (isError && (error as { status?: number })?.status === 401) ||
      (!isLoading && !isFetching && !user && !isError));

  useEffect(() => {
    if (isUnauthorized) {
      router.replace("/login");
    }
  }, [isUnauthorized, router]);

  const handleConfirmLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        setLogoutDialogOpen(false);
      },
    });
  };

  if (!mounted || isLoading || (isFetching && !user)) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-4 w-32 rounded bg-white/10 animate-pulse mb-8" />

          <div className="rounded-[20px] border border-white/5 bg-[#121212] p-6 sm:p-8 mb-8 animate-pulse">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="h-20 w-20 rounded-full bg-white/10 shrink-0" />
              <div className="space-y-3 flex-1 text-center sm:text-left w-full">
                <div className="h-7 w-48 mx-auto sm:mx-0 rounded bg-white/10" />
                <div className="h-4 w-36 mx-auto sm:mx-0 rounded bg-white/5" />
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                  <div className="h-6 w-24 rounded-full bg-white/10" />
                  <div className="h-6 w-28 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-[20px] border border-white/5 bg-[#121212] p-6 space-y-3 animate-pulse"
              >
                <div className="h-4 w-24 rounded bg-white/10" />
                <div className="h-6 w-44 rounded bg-white/10" />
              </div>
            ))}
          </div>

          <div className="rounded-[20px] border border-white/5 bg-[#121212] p-6 animate-pulse">
            <div className="h-5 w-32 rounded bg-white/10 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isUnauthorized) {
    return (
      <main className="min-h-[calc(100vh-120px)] bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-[#121212] border border-white/5 rounded-[20px] p-8 md:p-12 text-center max-w-md w-full shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#640C0C]/10 border border-[#640C0C]/20 text-[#640C0C]">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
          <p className="text-white/60 mb-6 text-sm leading-relaxed">
            Please log in to your account to view and manage your profile details.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-white/40 mb-6">
            <span className="inline-block h-2 w-2 rounded-full bg-[#640C0C] animate-ping" />
            Redirecting to login page...
          </div>
          <Link href="/login" className="block w-full">
            <Button className="w-full rounded-full bg-[#640C0C] text-white hover:bg-[#7a1010] h-12 font-medium">
              Log In to Continue
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-[calc(100vh-120px)] bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-[#121212] border border-white/5 rounded-[20px] p-8 md:p-10 text-center max-w-md w-full shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Unable to Load Profile</h1>
          <p className="text-white/60 mb-6 text-sm leading-relaxed">
            {error instanceof Error
              ? error.message
              : "We encountered an issue fetching your account information. Please try again."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => refetch()}
              className="flex-1 rounded-full bg-[#640C0C] text-white hover:bg-[#7a1010] h-11 flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
            <Link href="/" className="flex-1">
              <Button
                variant="outline"
                className="w-full rounded-full border-white/20 text-white hover:bg-white/10 h-11"
              >
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!user || (!user.fullName && !user.phone)) {
    return (
      <main className="min-h-[calc(100vh-120px)] bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-[#121212] border border-white/5 rounded-[20px] p-8 md:p-10 text-center max-w-md w-full shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Inbox className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">No Profile Information Found</h1>
          <p className="text-white/60 mb-6 text-sm leading-relaxed">
            Your profile records could not be located. Please try refreshing or sign in again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => refetch()}
              className="flex-1 rounded-full bg-[#640C0C] text-white hover:bg-[#7a1010] h-11 flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh
            </Button>
            <Link href="/login" className="flex-1">
              <Button
                variant="outline"
                className="w-full rounded-full border-white/20 text-white hover:bg-white/10 h-11"
              >
                Re-login
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const initials = getInitials(user.fullName);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">        
        <section
          aria-labelledby="profile-heading"
          className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#121212] p-6 sm:p-8 mb-8 transition-colors hover:border-white/15"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#640C0C]/15 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#640C0C]/60 via-[#1c1c1c] to-[#0a0a0a] border-2 border-[#640C0C]/40 text-2xl font-bold tracking-wider text-white shadow-xl shadow-black">
              <span>{initials}</span>
              <div
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#121212] border border-emerald-500/30 text-emerald-400"
                title="Verified User"
              >
                <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500/20 text-emerald-400" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 id="profile-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {user.fullName}
                  </h1>
                  <p className="text-sm text-white/60 font-mono mt-0.5">{user.phone}</p>
                </div>

                <div className="flex justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setLogoutDialogOpen(true)}
                    className="rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs h-9 px-4 gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Member
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Account
                </span>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="details-heading" className="mb-8">
          <div className="mb-4">
            <h2 id="details-heading" className="text-lg font-bold tracking-tight text-white">
              Personal Information
            </h2>
            <p className="text-xs text-white/50">
              Verified details collected during your account registration
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-[16px] border border-white/5 bg-[#121212] p-5 transition-colors hover:border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                  Full Name
                </span>
              </div>
              <p className="text-base font-semibold text-white pl-11">{user.fullName}</p>
              <p className="text-[11px] text-white/40 pl-11 mt-1">Provided at registration</p>
            </div>

            <div className="rounded-[16px] border border-white/5 bg-[#121212] p-5 transition-colors hover:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                    Phone Number
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Check className="h-3 w-3" />
                  OTP Verified
                </span>
              </div>
              <p className="text-base font-semibold text-white font-mono pl-11">{user.phone}</p>
              <p className="text-[11px] text-white/40 pl-11 mt-1">Used for authentication and SMS notifications</p>
            </div>

            <div className="rounded-[16px] border border-white/5 bg-[#121212] p-5 transition-colors hover:border-white/10 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                  Email Address
                </span>
              </div>
              <p className="text-base font-semibold text-white truncate pl-11">
                {user.email || "Not provided"}
              </p>
              <p className="text-[11px] text-white/40 pl-11 mt-1">Account communication & updates</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="security-heading" className="mb-8">
          <div className="rounded-[20px] border border-white/5 bg-[#121212] p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#640C0C]/10 border border-[#640C0C]/20 text-[#640C0C]">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 id="security-heading" className="text-base font-bold text-white">
                    Password & Security
                  </h3>
                </div>
              </div>

              <Link href="/forgot-password">
                <Button
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs h-9 px-4 whitespace-nowrap cursor-pointer"
                >
                  Reset Password
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="activity-heading" className="mb-10">
          <div className="mb-4">
            <h2 id="activity-heading" className="text-lg font-bold tracking-tight text-white">
              Quick Actions & Orders
            </h2>
            <p className="text-xs text-white/50">
              Access your shopping cart, order history, and support
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/orders"
              className="group rounded-[16px] border border-white/5 bg-[#121212] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 group-hover:text-white transition-colors">
                  <ShoppingBag className="h-5 w-5 text-[#640C0C]" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">My Orders</h3>
              <p className="text-xs text-white/50 line-clamp-2">
                Track status, review past purchases, and download invoices.
              </p>
            </Link>

            <Link
              href="/cart"
              className="group rounded-[16px] border border-white/5 bg-[#121212] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 group-hover:text-white transition-colors">
                  <ShoppingCart className="h-5 w-5 text-[#640C0C]" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Shopping Cart</h3>
              <p className="text-xs text-white/50 line-clamp-2">
                View items in your bag and proceed to checkout securely.
              </p>
            </Link>

            <Link
              href="/contact"
              className="group rounded-[16px] border border-white/5 bg-[#121212] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 group-hover:text-white transition-colors">
                  <HelpCircle className="h-5 w-5 text-[#640C0C]" />
                </div>
                <ArrowRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Customer Support</h3>
              <p className="text-xs text-white/50 line-clamp-2">
                Have questions or need assistance? Reach out to our team.
              </p>
            </Link>
          </div>
        </section>
      </main>

      {logoutDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => {
            if (!logoutMutation.isPending) setLogoutDialogOpen(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-[20px] border border-white/10 bg-[#121212] p-6 shadow-2xl text-white space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-[#640C0C]/10 border-[#640C0C]/20 text-[#640C0C]">
                <LogOut className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 id="logout-dialog-title" className="text-base font-bold tracking-tight text-white">
                  Sign Out of Your Account
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Are you sure you want to sign out? You will need to log in again with your phone number and password to view your profile or access your cart.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={logoutMutation.isPending}
                onClick={() => setLogoutDialogOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={logoutMutation.isPending}
                onClick={handleConfirmLogout}
                className="rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white px-5 py-2 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}