// lib/user.ts
import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { headers } from "next/headers";
import { prisma } from "./db.cjs";
import { isEmailVerified } from "./email-verification";

export interface UserPayload {
  userId: string;
  roles: string[];
}

export async function createAuthToken(userId: string, roles: string[]) {
  const payload = { userId, roles };
  console.log("payload", payload);

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  if (!secret || !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in env");
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  return token;
}

export async function verifyAuthToken(token: string) {
  try {
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    return payload as { userId: string; roles: string[] };
  } catch (error) {
    console.error("Invalid JWT token:", error);
    return null;
  }
}

export async function getCurrentUser(
  request: NextRequest
): Promise<{ userId: string } | null> {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") || // Header first for iPhone reliability
      request.cookies.get("auth-token")?.value;

    console.log("token", token);
    if (!token) {
      throw new Error("No token Provided");
    }

    const user = await verifyAuthToken(token);
    return user ? { userId: user.userId } : null;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

export async function getFullUser(request: NextRequest) {
  console.log("fetching token");
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("auth-token")?.value;

  console.log("fetched token", token);

  if (!token) {
    console.log("No token provided");
    throw new Error("No token provided");
  }

  const user = await verifyAuthToken(token);
  if (!user) console.log("no user found");

  console.log("user retrieved", user?.userId);
  const fullUser = await prisma.user.findUnique({
    where: { id: user?.userId },
    include: { publisher: { select: { id: true } } },
  });

  return fullUser;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

export async function getUserIdFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const cookieToken = req.cookies.get("auth-token")?.value;

  const token = bearerToken || cookieToken;

  if (!token) return null;

  try {
    const payload = await verifyAuthToken(token);
    return payload?.userId || null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function getCurrentUserWithRoles(request: NextRequest) {
  try {
    // 🔥 IPHONE FIX: Check Authorization header first, then fallback to cookie
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") || // Header priority for token-based auth
      request.cookies.get("auth-token")?.value; // Fallback to cookie

    console.log(
      "🔍 [getCurrentUserWithRoles] Extracted token:",
      token ? "***" + token.slice(-10) : "none"
    );

    if (!token) {
      console.log(
        "❌ [getCurrentUserWithRoles] No auth token found in header or cookies"
      );
      return null;
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log("🔍 [getCurrentUserWithRoles] JWT payload:", payload);

    const userId = payload.userId as string;
    if (!userId) {
      console.log("❌ [getCurrentUserWithRoles] No userId in JWT payload");
      return null;
    }

    // Get user with roles from database - UPDATED: removed ur include
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // REMOVED: ur include since roles are now direct enum array
    });

    if (!user) {
      console.log(
        "❌ [getCurrentUserWithRoles] User not found in database:",
        userId
      );
      return null;
    }

    const roles = user.roles; // UPDATED: directly from enum array

    console.log("✅ [getCurrentUserWithRoles] User authenticated:", {
      userId: user.id,
      email: user.email,
      roles,
    });

    return {
      userId: user.id,
      email: user.email,
      roles,
      verified: user.verified,
    };
  } catch (error) {
    console.error("❌ [getCurrentUserWithRoles] Error:", error);
    return null;
  }
}

export async function handleRoleAccess(
  request: NextRequest,
  requiredRole: string
): Promise<boolean> {
  const user = await getCurrentUserWithRoles(request);
  return user ? user.roles.includes(requiredRole.toUpperCase()) : false; // UPDATED: convert to uppercase for enum matching
}
