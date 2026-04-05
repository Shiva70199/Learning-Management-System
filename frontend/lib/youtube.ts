export function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] ?? null;
    }
    if (u.searchParams.get("v")) {
      return u.searchParams.get("v");
    }
    const parts = u.pathname.split("/").filter(Boolean);
    const embedIdx = parts.indexOf("embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) {
      return parts[embedIdx + 1]!;
    }
  } catch {
    return null;
  }
  return null;
}
