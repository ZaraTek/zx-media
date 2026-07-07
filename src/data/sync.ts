export interface GoogleUser {
  jwt: string;
  email: string;
}

interface SyncLibraryResponse {
  library: string[];
  updatedAt: string;
}

const API_BASE = (import.meta.env.VITE_SYNC_API_BASE_URL as string | undefined)?.trim() ?? "";

function apiUrl(path: string): string {
  if (!API_BASE) return path;
  return `${API_BASE.replace(/\/$/, "")}${path}`;
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const extraHeaders: Record<string, string> = {};
  if (method !== "GET" && method !== "HEAD") {
    extraHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    headers: { ...extraHeaders, ...(init.headers as Record<string, string> ?? {}) },
  });

  const data = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? `Request failed with status ${response.status}`);
  }

  return data as T;
}

export async function googleSignIn(idToken: string): Promise<GoogleUser> {
  return requestJson<GoogleUser>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export async function pullRemoteLibrary(appJwt: string): Promise<SyncLibraryResponse> {
  return requestJson<SyncLibraryResponse>("/api/sync/library", {
    method: "GET",
    headers: { Authorization: `Bearer ${appJwt}` },
  });
}

export async function pushRemoteLibrary(
  appJwt: string,
  library: string[]
): Promise<SyncLibraryResponse> {
  return requestJson<SyncLibraryResponse>("/api/sync/library", {
    method: "PUT",
    headers: { Authorization: `Bearer ${appJwt}` },
    body: JSON.stringify({ library }),
  });
}
