"use client";

import React, { useState, createContext, useContext, useEffect } from "react";
import AdminSidebar from "@/components/admin/sidebar/Sidebar";
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";

export interface AdminLayoutContextType {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCollapse: () => void;
}

export const AdminLayoutContext = createContext<AdminLayoutContextType>({
  mobileOpen: false,
  setMobileOpen: () => {},
  isCollapsed: false,
  setIsCollapsed: () => {},
  toggleCollapse: () => {},
});

export const useMobileMenu = () => {
  const ctx = useContext(AdminLayoutContext);
  return {
    mobileOpen: ctx.mobileOpen,
    setMobileOpen: ctx.setMobileOpen,
  };
};

export const useAdminSidebar = () => useContext(AdminLayoutContext);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
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
          />
          <div className="flex flex-1 flex-col w-full min-w-0 overflow-x-hidden transition-all duration-300">
            {children}
          </div>
        </div>
      </AdminLayoutContext.Provider>
    </AdminAuthWrapper>
  );
}
