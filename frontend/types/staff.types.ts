export type StaffStatus = "Active" | "Inactive";

export const STAFF_ROLES = [
  "Store Manager",
  "Fitment Specialist",
  "Inventory Supervisor",
  "Service Technician",
  "Sales Executive",
  "Support Agent",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number] | string;

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: StaffRole;
  joinDate: string; // YYYY-MM-DD
  status: StaffStatus;
}

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  joinDate: string;
  status: StaffStatus;
}
