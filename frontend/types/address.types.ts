export interface Address {
  id: string;
  name: string;
  phone: string;
  type: "Home" | "Work";
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}
