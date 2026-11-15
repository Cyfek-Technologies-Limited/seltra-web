import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";

const key = () => {
  const raw = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;
  if (!raw || !/^[a-f0-9]{64}$/i.test(raw)) {
    throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as 64 hex characters");
  }
  return Buffer.from(raw, "hex");
};

export function encryptSocialToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptSocialToken(value: string) {
  const [iv, tag, ciphertext] = value.split(".").map((part) => Buffer.from(part, "base64url"));
  if (!iv || !tag || !ciphertext) throw new Error("Invalid encrypted social token");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

function stateSecret(provider: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(`${secret}:publisher-social-oauth:${provider}`);
}

export function socialRedirectUri(provider: "tiktok" | "instagram") {
  return `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/publisher/social/${provider}/callback`;
}

export async function createSocialState(provider: "tiktok" | "instagram", userId: string) {
  return new SignJWT({ provider })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setJti(crypto.randomBytes(16).toString("hex"))
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(stateSecret(provider));
}

export async function verifySocialState(provider: "tiktok" | "instagram", state: string | null) {
  if (!state) return null;
  try {
    const { payload } = await jwtVerify(state, stateSecret(provider));
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function refreshSocialAccessToken(connection: any) {
  let accessToken = decryptSocialToken(connection.accessToken);
  if (!connection.expiresAt || connection.expiresAt.getTime() > Date.now() + 5 * 60_000) return accessToken;

  if (connection.provider === "tiktok" && connection.refreshToken) {
    const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY || "",
        client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: decryptSocialToken(connection.refreshToken),
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload.access_token) throw new Error("TikTok authorization expired. Please reconnect your account.");
    accessToken = payload.access_token;
    await (await import("./db.cjs")).prisma.publisherSocialConnection.update({
      where: { id: connection.id },
      data: {
        accessToken: encryptSocialToken(payload.access_token),
        refreshToken: payload.refresh_token ? encryptSocialToken(payload.refresh_token) : connection.refreshToken,
        expiresAt: new Date(Date.now() + payload.expires_in * 1000),
      },
    });
    return accessToken;
  }

  if (connection.provider === "instagram") {
    const url = new URL("https://graph.facebook.com/v26.0/oauth/access_token");
    url.search = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: process.env.META_APP_ID || "",
      client_secret: process.env.META_APP_SECRET || "",
      fb_exchange_token: connection.refreshToken ? decryptSocialToken(connection.refreshToken) : accessToken,
    }).toString();
    const response = await fetch(url);
    const payload = await response.json();
    if (!response.ok || !payload.access_token) throw new Error("Instagram authorization expired. Please reconnect your account.");
    const pagesResponse = await fetch(`https://graph.facebook.com/v26.0/me/accounts?fields=access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(payload.access_token)}`);
    const pages = await pagesResponse.json();
    const page = (pages.data || []).find((item: any) => item.instagram_business_account?.id === connection.accountId);
    if (!pagesResponse.ok || !page?.access_token) throw new Error("Instagram authorization expired. Please reconnect your account.");
    accessToken = page.access_token;
    await (await import("./db.cjs")).prisma.publisherSocialConnection.update({
      where: { id: connection.id },
      data: { accessToken: encryptSocialToken(accessToken), refreshToken: encryptSocialToken(payload.access_token), expiresAt: new Date(Date.now() + (payload.expires_in || 5_184_000) * 1000) },
    });
    return accessToken;
  }
  throw new Error("Social account authorization expired. Please reconnect.");
}
