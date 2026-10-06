// lib/getCurrentUser.ts
import "server-only";
import { cookies } from "next/headers";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log("🔵 [SSR] Getting current user...");

    const cookieStore = await cookies(); // 🔥 FIX
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return null;

    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const json: UserResponse = await res.json();
    return json.data ?? null;
  } catch (err) {
    console.error("🔴 SSR auth error:", err);
    return null;
  }
};
