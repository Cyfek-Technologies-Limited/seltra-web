// lib/onboarding.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const DEFAULT_PHONE = "No Phone Number";

type AuthUserRecord = {
  id: string;
  email: string;
  username: string | null;
  phone: string;
  avatar: string | null;
  authProvider: string;
  emailVerified: Date | null;
  roles: string[];
  createdAt: Date;
};

export function needsOnboarding(user: { roles: string[] }) {
  return user.roles.length === 0;
}

export function formatAuthUser(user: AuthUserRecord) {
  const roles = user.roles;
  const onboardingRequired = needsOnboarding(user);

  return {
    id: user.id,
    _id: user.id,
    email: user.email,
    username: user.username,
    phone: user.phone && user.phone !== DEFAULT_PHONE ? user.phone : null,
    avatar: user.avatar,
    authProvider: user.authProvider,
    emailVerified: Boolean(user.emailVerified),
    role: roles[0]?.toLowerCase() ?? null,
    roles: roles.map((role) => role.toLowerCase()),
    isPublisher: roles.includes("PUBLISHER"),
    isAdvertiser:
      roles.includes("ADVERTISER") &&
      !roles.includes("PUBLISHER") &&
      !roles.includes("ADMIN"),
    isAdmin: roles.includes("ADMIN"),
    onboardingCompleted: !onboardingRequired,
    needsOnboarding: onboardingRequired,
    createdAt: user.createdAt,
  };
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: "auth-token",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

// Each purpose gets its own derived key so these short-lived tokens can never
// be accepted by verifyAuthToken() as a session token (and vice versa).
function derivedSecret(purpose: string) {
  const base = process.env.JWT_SECRET;
  if (!base) throw new Error("JWT_SECRET is missing in env");
  return new TextEncoder().encode(`${base}:${purpose}`);
}

const STATE_PURPOSE = "google-oauth-state";
const CODE_PURPOSE = "google-oauth-exchange-code";

export async function createGoogleState() {
  return new SignJWT({ nonce: crypto.randomBytes(16).toString("hex") })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(derivedSecret(STATE_PURPOSE));
}

export async function verifyGoogleState(state: string | null) {
  if (!state) return false;
  try {
    await jwtVerify(state, derivedSecret(STATE_PURPOSE));
    return true;
  } catch {
    return false;
  }
}

export async function createGoogleExchangeCode(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setJti(crypto.randomBytes(16).toString("hex"))
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(derivedSecret(CODE_PURPOSE));
}

export async function verifyGoogleExchangeCode(code: string) {
  try {
    const { payload } = await jwtVerify(code, derivedSecret(CODE_PURPOSE));
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function googleRedirectUri() {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/auth/google/callback`;
}
