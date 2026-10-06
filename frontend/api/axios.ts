import axios, { AxiosError } from "axios";

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

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string | string[] }>) => {
    const status = err.response?.status ?? 0;
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