
import api from "@/api/axios";
import type {
  LoginPayload,
  OkResponse,
  SendOtpPayload,
  SignupPayload,
  User,
  VerifyOtpPayload,
} from "@/types/auth.types";

export const sendOtp = (payload: SendOtpPayload) =>
  api.post<OkResponse>("/auth/otp/send", payload).then((r) => r.data);

export const verifyOtp = (payload: VerifyOtpPayload) =>
  api.post<OkResponse>("/auth/otp/verify", payload).then((r) => r.data);

export const signup = (payload: SignupPayload) =>
  api.post<OkResponse>("/auth/signup", payload).then((r) => r.data);

export const login = (payload: LoginPayload) =>
  api.post<OkResponse>("/auth/login", payload).then((r) => r.data);

export const logout = () =>
  api.post<OkResponse>("/auth/logout").then((r) => r.data);

export const me = () =>
  api.get<User>("/auth/me").then((r) => r.data);

export const authService = {
  sendOtp,
  verifyOtp,
  signup,
  login,
  logout,
  me,
};