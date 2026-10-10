"use client";

import React, { useState, createContext, useContext } from "react";
import AdminSidebar from "@/components/admin/sidebar/Sidebar";

export const MobileMenuContext = createContext<{
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  setMobileOpen: () => { },
});

export const useMobileMenu = () => useContext(MobileMenuContext);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MobileMenuContext.Provider value={{ setMobileOpen }}>
      <div className="flex min-h-screen bg-black text-white antialiased selection:bg-[#640C0C]/40 selection:text-white">
        <AdminSidebar
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
          {children}
        </div>
      </div>
    </MobileMenuContext.Provider>
  );
}
