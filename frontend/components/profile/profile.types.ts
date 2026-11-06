export type TabKey =
  | "profile"
  | "orders"
  | "returns"
  | "addresses"
  | "security";

export interface ProfileOrder {
  id: string;
  productName: string;
  date: string;
  amount: number;
  status: string;
  image: string;
}

export interface ProfileRefund {
  id: string;
  orderId: string;
  productName: string;
  requestedOn: string;
  amount: number;
  status: string;
  reason: string;
  image: string;
}

export interface ProfileFormData {
  name: string;
  dob: string;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
}

export interface PasswordFormData {
  current: string;
  newPass: string;
  confirmPass: string;
}

export interface RefundFormData {
  orderId: string;
  productName: string;
  reason: string;
}
