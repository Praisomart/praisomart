export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  // Handle auth errors specifically
  if (response.status === 401) {
    // Token is expired or invalid — clear it
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    let message = "Your session has expired. Please sign in again.";
    if (isJson) {
      try {
        const errorData = await response.json();
        message = errorData.error || errorData.message || message;
      } catch (_) {}
    } else {
      await response.text().catch(() => {});
    }
    throw new Error(message);
  }

  if (response.status === 403) {
    // Not authenticated at all — consume body and throw clear error
    if (isJson) {
      await response.json().catch(() => {});
    } else {
      await response.text().catch(() => {});
    }
    throw new Error("Please sign in to continue.");
  }

  if (!response.ok) {
    let message = "An error occurred";
    if (isJson) {
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (_) {
        // Fallback if JSON parsing fails despite content-type
      }
    } else {
      await response.text().catch(() => {});
    }
    throw new Error(message || response.statusText);
  }

  if (!isJson) {
    const text = await response.text();
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
      throw new Error("Invalid server response: Expected JSON but received HTML. Check if the backend is running.");
    }
    return text;
  }

  return response.json();
}

