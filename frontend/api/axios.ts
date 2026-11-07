import axios, { AxiosError } from "axios";
import { clearAuthSession } from "@/lib/auth-storage";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints that return 401 for reasons other than "session expired":
// - auth/login, auth/signup  → wrong credentials
// - cart/**                  → admins/staff have no cart row; 401 is expected
// - products/**              → public endpoints that fall back to 401 in some configs
const SESSION_SAFE_PATTERNS = [
  '/auth/login',
  '/auth/signup',
  '/cart',
  '/cart/',
];

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string | string[] }>) => {
    const status = err.response?.status ?? 0;
    const url = err.config?.url ?? '';

    if (status === 401) {
      const isSafeEndpoint = SESSION_SAFE_PATTERNS.some((pattern) =>
        url.includes(pattern)
      );
      if (!isSafeEndpoint) {
        clearAuthSession();
      }
    }

    const raw = err.response?.data?.message;
    const message = Array.isArray(raw)
      ? raw[0]
      : (raw ?? (status === 0 ? "Network error. Check connection." : err.message));

    return Promise.reject(
      new ApiError(status, message, Array.isArray(raw) ? raw : undefined),
    );
  },
);

export default api;