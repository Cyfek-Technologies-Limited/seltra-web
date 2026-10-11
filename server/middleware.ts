// middleware.ts (in your BACKEND project)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = new Set(
  [
    "https://seltra.app",
    "https://www.seltra.app",
    "https://seltra-web.vercel.app",
    "https://adhive-frontend.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
  ]
    .filter((origin): origin is string => Boolean(origin))
    .map((origin) => origin.replace(/\/+$/, ""))
);

// Preview deployments of the frontend, limited to this Vercel team's URLs.
const previewOriginPattern =
  /^https:\/\/seltra-web-[a-z0-9-]+-cyfektechnologiesltd-3635\.vercel\.app$/;

function isAllowedOrigin(origin: string | null): origin is string {
  return Boolean(
    origin && (allowedOrigins.has(origin) || previewOriginPattern.test(origin))
  );
}

function applyCors(response: NextResponse, origin: string | null) {
  if (isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  response.headers.append("Vary", "Origin");
  return response;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, Cache-Control, Pragma"
    );
    return applyCors(response, origin);
  }

  return applyCors(NextResponse.next(), origin);
}

export const config = {
  matcher: "/api/:path*",
};
