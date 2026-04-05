"use client";

import { useEffect } from "react";
import { bootstrapSession } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void bootstrapSession().catch(() => {
      useAuthStore.getState().setHydrated(true);
    });
  }, []);

  return children;
}
