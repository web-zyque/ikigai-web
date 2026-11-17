import api from "@/api/axios";

export interface StaffRecord {
  id: string;
  adminId: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: "STAFF";
  isActive: boolean;
  createdAt: string;
}

export interface StaffPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: "STAFF";
  isActive?: boolean;
}

export const staffService = {
  list: () => api.get<StaffRecord[]>("/auth/staff").then((r) => r.data),
  create: (payload: StaffPayload) => api.post<StaffRecord>("/auth/staff", payload).then((r) => r.data),
  update: (id: string, payload: StaffPayload) => api.patch<StaffRecord>(`/auth/staff/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/auth/staff/${id}`).then((r) => r.data),
};
