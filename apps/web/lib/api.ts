import axios from "axios";
import { HTTP_BACKEND } from "@/config";

export const api = axios.create({
  baseURL: HTTP_BACKEND,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (typeof window !== "undefined") {
      // Expired session: clear token and redirect to signin
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          localStorage.removeItem("token");
        } catch {}
        window.location.assign("/signin");
      }
    }
    return Promise.reject(error);
  },
);

export { isAxiosError } from "axios";
