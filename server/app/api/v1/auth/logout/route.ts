import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [LOGOUT] Processing logout request...");

    // Create response
    const responseData = {
      status: "200",
      msg: "User logged out successfully",
    };

    // Create response and clear the auth-token cookie
    const response = NextResponse.json(responseData, { status: 200 });

    // Logout is a cross-site fetch (frontend and API are on different sites),
    // and browsers drop SameSite=Lax Set-Cookie headers on cross-site responses,
    // so the clearing cookie must be SameSite=None; Secure to take effect.
    for (const name of ["auth-token", "refresh-token"]) {
      response.cookies.set(name, "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 0,
        expires: new Date(0),
        path: "/",
      });
    }
    response.headers.set("Cache-Control", "no-store");

    // Add CORS headers (copy from /auth/me)
    response.headers.set(
      "Access-Control-Allow-Origin",
      request.headers.get("origin") || "*"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    console.log("✅ [LOGOUT] User logged out successfully");

    return response;
  } catch (error: unknown) {
    console.error("❌ [LOGOUT] Error during logout:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Create error response with CORS headers
    const response = NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );

    // Add CORS headers to error response
    response.headers.set(
      "Access-Control-Allow-Origin",
      request.headers.get("origin") || "*"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  }
}

// Also support GET requests for convenience
export async function GET(request: NextRequest) {
  return POST(request);
}

// Add OPTIONS handler for CORS preflight (copy from /auth/me)
export async function OPTIONS(request: NextRequest) {
  console.log("🔄 [LOGOUT] Handling OPTIONS request");
  const response = new NextResponse(null, { status: 200 });
  response.headers.set(
    "Access-Control-Allow-Origin",
    request.headers.get("origin") || "*"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}
