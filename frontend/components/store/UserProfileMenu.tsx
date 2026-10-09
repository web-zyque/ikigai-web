"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, ChevronDown, LogOut, Settings, ShoppingBag } from "lucide-react";
import { useLogout } from "@/hooks/auth";
import type { User as UserType } from "@/types/auth.types";

interface UserProfileMenuProps {
  user: UserType;
}

export function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const logoutMutation = useLogout();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  const displayName = user.fullName.split(' ')[0];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-ik-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-ik-accent-hover"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
          <User className="h-3 w-3" />
        </div>
        <span className="hidden sm:inline">{displayName}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-white/10 bg-ik-surface shadow-lg backdrop-blur-sm z-50"
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-medium text-white">{user.fullName}</p>
            <p className="text-xs text-white/60">{user.phone}</p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            
            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ShoppingBag className="h-4 w-4" />
              Orders
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>

         
          <div className="border-t border-white/10 py-1">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}