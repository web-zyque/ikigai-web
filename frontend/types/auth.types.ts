export interface User {
  id: string;
  fullName: string;
  phone: string;
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
  phone: string;
  password: string;
}

export interface OkResponse {
  ok: true;
}