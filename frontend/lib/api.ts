import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

/** Prefer NEXT_PUBLIC_API_BASE_URL; keep NEXT_PUBLIC_API_URL for backwards compatibility. */
function resolveBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:4000";
  return raw.replace(/\/+$/, "");
}

export const API_BASE_URL = resolveBaseUrl();

const isDev = process.env.NODE_ENV === "development";

if (typeof window !== "undefined" && isDev) {
  console.info("[LMS API] Base URL:", API_BASE_URL);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    if (isDev) {
      console.debug("[LMS API] POST /api/auth/refresh (cookie session)");
    }
    const res = await api.post<{ accessToken: string; user: { id: string; email: string } }>(
      "/api/auth/refresh",
      {},
      { skipAuth: true, skipRefresh: true }
    );
    useAuthStore.getState().setSession(res.data.accessToken, res.data.user);
    if (isDev) {
      console.debug("[LMS API] Refresh OK, user:", res.data.user?.email);
    }
    return res.data.accessToken;
  } catch (err) {
    /* Do not wipe a session that just logged in — a stale bootstrap refresh can 401 after Set-Cookie. */
    const { accessToken: existing } = useAuthStore.getState();
    if (!existing) {
      useAuthStore.getState().clearSession();
    } else if (isDev) {
      console.debug("[LMS API] Refresh failed but access token already in memory — keeping session");
    }
    if (isDev && !existing) {
      console.warn("[LMS API] Refresh failed (not signed in or expired cookie)", err);
    }
    return null;
  }
}

api.interceptors.request.use((config) => {
  if (isDev) {
    const path = `${config.baseURL ?? ""}${config.url ?? ""}`;
    console.debug("[LMS API] →", (config.method ?? "GET").toUpperCase(), path);
  }
  const skip = (config as InternalAxiosRequestConfig & { skipAuth?: boolean }).skipAuth;
  if (skip) return config;
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => {
    if (isDev) {
      console.debug("[LMS API] ←", r.status, r.config.url);
    }
    return r;
  },
  async (error: AxiosError) => {
    if (isDev) {
      const status = error.response?.status;
      const url = error.config?.url;
      if (error.code === "ECONNABORTED") {
        console.error("[LMS API] Timeout:", url);
      } else if (!error.response) {
        console.error("[LMS API] Network error (CORS, wrong URL, or server down):", url, error.message);
      } else {
        console.error("[LMS API] Error", status, url, error.response.data);
      }
    }
    const original = error.config as
      | (InternalAxiosRequestConfig & {
          skipAuth?: boolean;
          skipRefresh?: boolean;
          _retry?: boolean;
        })
      | undefined;
    if (!original) return Promise.reject(error);
    const status = error.response?.status;
    if (
      status === 401 &&
      !original._retry &&
      !original.skipAuth &&
      !original.skipRefresh
    ) {
      original._retry = true;
      if (!refreshing) {
        refreshing = refreshAccessToken().finally(() => {
          refreshing = null;
        });
      }
      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Restores session from refresh cookie if needed.
 * Always ends with `hydrated: true` so UI never waits forever on a hung request (timeout still applies).
 */
export async function bootstrapSession(): Promise<boolean> {
  const { accessToken, setHydrated } = useAuthStore.getState();
  try {
    if (accessToken) {
      if (isDev) console.debug("[LMS API] Session: using in-memory access token");
      return true;
    }
    const token = await refreshAccessToken();
    return !!token;
  } catch (e) {
    if (isDev) console.error("[LMS API] bootstrapSession error", e);
    useAuthStore.getState().clearSession();
    return false;
  } finally {
    setHydrated(true);
    if (isDev) console.debug("[LMS API] Auth hydration complete");
  }
}
