import { AdminSettingsData } from "@/types/settings.types";

export const DEFAULT_SETTINGS: AdminSettingsData = {
  storeInfo: {
    storeName: "IKIGAI Auto Parts & Accessories",
    logoUrl: "/images/logo.png",
    phone: "+91 98200 12345",
    email: "support@ikigai-auto.com",
    address: "402, Auto Hub Central, Andheri-Kurla Road, Mumbai, MH - 400059",
  },
  adminProfile: {
    name: "Admin User",
    email: "admin@ikigai-auto.com",
    phone: "+91 98111 22334",
    avatarUrl: "",
  },
  shipping: {
    shippingCharge: 150,
    freeShippingThreshold: 2500,
  },
  payments: {
    upiEnabled: true,
    codEnabled: true,
  },
  notifications: {
    newOrders: true,
    lowStockAlerts: true,
    cancelledOrders: true,
  },
};
