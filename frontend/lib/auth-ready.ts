import type { AuthUser } from "@/store/authStore";

/**
 * After login/register, `hydrated` may still be false until bootstrap's refresh finishes.
 * We still have a valid access token — allow protected pages to load.
 * Also avoids waiting forever if bootstrap is slow.
 */
export function isAuthReady(state: {
  hydrated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
}): boolean {
  return state.hydrated || (!!state.user && !!state.accessToken);
}
