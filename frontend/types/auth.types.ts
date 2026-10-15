export interface User {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  adminId?: string;
  isActive?: boolean;
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF';
  createdAt?: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface SendOtpPayload {
  phone: string;
}

export interface SignupPayload {
  fullName: string;
  phone: string;
  otp: string;
  password: string;
}

export interface LoginPayload {
  identifier: string; // Can be phone number or admin ID
  password: string;
}

export interface CreateAdminPayload {
  adminId: string;
  fullName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'STAFF';
}

export interface OkResponse {
  ok: true;
}