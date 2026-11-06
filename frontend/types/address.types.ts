export interface Address {
  id: string;
  name: string;
  phone: string;
  type: "Home" | "Work";
  addressLine: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault: boolean;
}

export interface AddressInput {
  name: string;
  phone: string;
  type: "Home" | "Work";
  addressLine: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}
