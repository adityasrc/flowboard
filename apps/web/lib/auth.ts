export interface AuthUser {
  id?: number | string;
  name?: string;
  email?: string;
  exp?: number;
}

export function getUserFromToken(token: string): AuthUser | null {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const payload = JSON.parse(jsonPayload) as AuthUser;

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name || "",
      email: payload.email || "",
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

