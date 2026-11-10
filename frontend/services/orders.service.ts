import api from "@/api/axios";

export type OrderStatusValue =
  | "AWAITING_PAYMENT"
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItemRecord {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  sku: string;
  imageUrl: string | null;
  selectedVariant: {
    id: string;
    colorName: string;
    sku: string | null;
  } | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string;
  orderStatus: OrderStatusValue;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  subtotal: string;
  deliveryFee: string;
  discountAmount: string;
  totalAmount: string;
  couponCode: string | null;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    addressType: string;
  };
  items: OrderItemRecord[];
  createdAt: string;
  itemCount?: number;
  customer?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  cancellationRequests?: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reason: string;
  }[];
}

export interface CreateOrderPayload {
  addressId: string;
  paymentMethod: "COD" | "ONLINE";
  couponCode?: string;
  idempotencyKey: string;
  buyNowItem?: {
    productId: string;
    variantId?: string | null;
    quantity: number;
  };
}

export const ordersService = {
  create: (body: CreateOrderPayload) =>
    api.post<OrderRecord>("/orders", body).then(r => r.data),

  mine: () =>
    api.get<OrderRecord[]>("/orders").then(r => r.data),

  mineById: (id: string) =>
    api.get<OrderRecord>(`/orders/${id}`).then(r => r.data),

  requestCancellation: (id: string, reason: string) =>
    api
      .post(`/orders/${id}/cancellation-requests`, { reason })
      .then(r => r.data),

  adminList: (params: Record<string, string | number | undefined>) =>
    api
      .get<{
        orders: OrderRecord[];
        total: number;
        page: number;
        totalPages: number;
      }>("/admin/orders", { params })
      .then(r => r.data),

  adminStats: () =>
    api.get<Record<string, number>>("/admin/orders/stats").then(r => r.data),

  updateStatus: (id: string, status: OrderStatusValue) =>
    api
      .patch<OrderRecord>(`/admin/orders/${id}/status`, { status })
      .then(r => r.data),

  cancellations: () =>
    api.get<any[]>("/admin/orders/cancellation-requests").then(r => r.data),

  reviewCancellation: (
    id: string,
    decision: "APPROVED" | "REJECTED",
    adminNote?: string
  ) =>
    api
      .patch(`/admin/orders/cancellation-requests/${id}`, {
        decision,
        adminNote,
      })
      .then(r => r.data),
};
