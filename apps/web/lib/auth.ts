const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
}

export async function login(email: string, password: string): Promise<{ token: string; userId: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(data.message ?? "Sign in failed");
  }
  return res.json() as Promise<{ token: string; userId: string }>;
}

export async function register(email: string, password: string, name?: string): Promise<{ token: string; userId: string }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(data.message ?? "Registration failed");
  }
  return res.json() as Promise<{ token: string; userId: string }>;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
  if (typeof window !== "undefined") {
    localStorage.removeItem("zenith_token");
  }
}

export async function getSession(): Promise<AuthUser | null> {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("zenith_token");
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json() as Promise<AuthUser>;
  } catch {
    return null;
  }
}
