"use client";

import React, { createContext, useContext } from "react";

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
