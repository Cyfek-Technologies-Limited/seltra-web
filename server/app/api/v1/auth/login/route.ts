import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "../../../../../lib";
import { createAuthToken } from "../../../../../lib/user";
import { prisma } from "../../../../../lib/db.cjs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Fetch user with roles - UPDATED: removed UserRole include
    const user = await prisma.user.findUnique({
      where: { email },
      // REMOVED: UserRole include since roles are now direct enum array
    });

    console.log("logged in user", email, user);
    if (!user) {
      return NextResponse.json(
        { status: 401, error: "Invalid User" },
        { status: 401 }
      );
    }

    // Verify password
    const correctPassword = await verifyPassword(user.passwordHash, password);
    if (!correctPassword) {
      return NextResponse.json({ status: 401, error: "Password is incorrect" });
    }

    // Extract roles - UPDATED: directly from user.roles
    const roles = user.roles; // This is now the enum array

    // Create token - UPDATED: using enum array directly
    const token = await createAuthToken(user.id, roles);

    // Prepare response data - UPDATED: role logic
    const formattedUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      isPublisher: roles.includes("PUBLISHER"), // UPDATED: uppercase
      isAdvertiser:
        roles.includes("ADVERTISER") &&
        !roles.includes("PUBLISHER") &&
        !roles.includes("ADMIN"), // UPDATED: advertiser logic
      isAdmin: roles.includes("ADMIN"), // UPDATED: uppercase
      createdAt: user.createdAt,
      roles: roles.map((role) => role.toLowerCase()), // UPDATED: convert to lowercase for frontend compatibility
    };

    const responseData = {
      status: 200,
      token: token,
      data: formattedUser,
      msg: "User sign in successful",
    };

    // Create response with CORS headers
    const response = NextResponse.json(responseData, { status: 200 });

    // Set cookie with proper configuration for cross-domain
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: "lax", // Changed from "lax" to "none" for cross-domain
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      // domain:
      //   process.env.NODE_ENV === "production" ? ".vercel.app" : "localhost", // Allow subdomains
    });

    // Add CORS headers
    response.headers.set(
      "Access-Control-Allow-Origin",
      req.headers.get("origin") || "*"
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
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");

    console.log("✅ Login successful, cookie set");
    return response;
  } catch (error) {
    console.error("login failed:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(req: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set(
    "Access-Control-Allow-Origin",
    req.headers.get("origin") || "*"
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
