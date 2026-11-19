import { API_BASE_URL } from "@/lib/api";

export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  if (!url.startsWith("/uploads/")) return url;

  try {
    return new URL(url, new URL(API_BASE_URL, window.location.origin).origin).toString();
  } catch {
    return url;
  }
}
