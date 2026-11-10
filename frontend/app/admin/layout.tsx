"use client";

import React, { useState, useEffect } from "react";
import { useMe } from "@/hooks/auth";
import AdminSidebar from "@/components/admin/sidebar/Sidebar";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";
import { AdminLayoutContext } from "@/contexts/admin-layout-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: user } = useMe();

  const profile = user
    ? {
        name: user.fullName,
        role: user.role === "STAFF" ? "Staff" : "Administrator",
        initials: user.fullName
          .split(" ")
          .slice(0, 2)
          .map((w: string) => w[0])
          .join("")
          .toUpperCase(),
      }
    : undefined;
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ikigai_admin_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("ikigai_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <AdminAuthWrapper>
      <AdminLayoutContext.Provider
        value={{
          mobileOpen,
          setMobileOpen,
          isCollapsed,
          setIsCollapsed,
          toggleCollapse,
        }}
      >
        <div className="flex min-h-screen bg-black text-white antialiased selection:bg-[#640C0C]/40 selection:text-white">
          <AdminSidebar
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapse}
            profile={profile}
          />
          <div className="flex flex-1 flex-col w-full min-w-0 overflow-x-hidden transition-all duration-300">
            {children}
          </div>
        </div>
      </AdminLayoutContext.Provider>
    </AdminAuthWrapper>
  );
}
