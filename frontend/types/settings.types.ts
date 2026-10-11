export interface StoreInfoSettings {
  storeName: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
}

export interface AdminProfileSettings {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

export interface ShippingSettings {
  shippingCharge: number;
  freeShippingThreshold: number;
}

export interface PaymentMethodsSettings {
  upiEnabled: boolean;
  codEnabled: boolean;
}

export interface NotificationSettings {
  newOrders: boolean;
  lowStockAlerts: boolean;
  cancelledOrders: boolean;
}

export interface AdminSettingsData {
  storeInfo: StoreInfoSettings;
  adminProfile: AdminProfileSettings;
  shipping: ShippingSettings;
  payments: PaymentMethodsSettings;
  notifications: NotificationSettings;
}
