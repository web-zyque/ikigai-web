export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus = "Paid" | "Pending" | "Failed";

export type PaymentMethod =
  | "UPI / QR Code"
  | "Credit / Debit Card"
  | "Net Banking"
  | "Cash on Delivery (COD)";

export interface OrderProductItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  customer: CustomerDetails;
  createdAt: string; // ISO string or human format
  formattedDate: string;
  formattedTime: string;
  items: OrderProductItem[];
  itemCount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
}

export interface OrderFilterCriteria {
  status: "All" | OrderStatus;
  paymentStatus: "All" | PaymentStatus;
  dateRange: "All" | "Today" | "Last 7 Days" | "Last 30 Days";
  searchQuery: string;
}
