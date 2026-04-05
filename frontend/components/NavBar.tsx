"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isAuthReady } from "@/lib/auth-ready";
import { useAuthStore } from "@/store/authStore";

export function NavBar() {
  const router = useRouter();
  const { user, accessToken, clearSession, hydrated } = useAuthStore();
  const ready = isAuthReady({ hydrated, user, accessToken });

  async function logout() {
    try {
      if (accessToken) {
        await api.post("/api/auth/logout");
      }
    } catch {
      /* still clear local session */
    }
    clearSession();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[3.25rem] max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-[15px] font-extrabold tracking-tight text-ink"
        >
          Course<span className="text-accent">Kit</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-muted">
          {user && accessToken ? (
            <>
              <Link href="/subjects" className="hidden hover:text-accent sm:inline">
                Catalog
              </Link>
              <Link href="/ai" className="hidden hover:text-accent sm:inline">
                AI tools
              </Link>
              <span className="hidden max-w-[180px] truncate text-xs text-slate-500 sm:inline">
                {user.email}
              </span>
              <button type="button" onClick={() => void logout()} className="btn-secondary !px-3 !py-1.5 !text-xs">
                Log out
              </button>
            </>
          ) : ready ? (
            <>
              <Link href="/login" className="hover:text-accent">
                Log in
              </Link>
              <Link href="/register" className="btn-primary !px-3 !py-1.5 !text-xs">
                Sign up
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
