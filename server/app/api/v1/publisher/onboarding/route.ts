import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/db.cjs";
import { getUserIdFromRequest, verifyAuthToken } from "../../../../../lib/user";

const onboardingSchema = z.object({
  age: z.number().int().min(13).max(120),
  gender: z.string().min(1).max(50),
  location: z.string().min(2).max(120),
  occupation: z.string().min(2).max(120),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { status: 401, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const parsedBody = onboardingSchema.safeParse({
      age: typeof body.age === "string" ? Number(body.age) : body.age,
      gender: body.gender,
      location: body.location,
      occupation: body.occupation,
    });

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          status: 400,
          error: "Invalid input",
          details: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { age, gender, location, occupation } = parsedBody.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        publisher: true,
      },
    });

    console.log("user", user);

    if (!user) {
      return NextResponse.json(
        { status: 404, error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.roles.includes("PUBLISHER")) {
      return NextResponse.json(
        { status: 403, error: "Only publishers can complete this onboarding" },
        { status: 403 }
      );
    }

    if (!user.publisher) {
      return NextResponse.json(
        { status: 404, error: "Publisher profile not found" },
        { status: 404 }
      );
    }

    const updatedPublisher = await prisma.publisher.update({
      where: { userId: userId },
      data: {
        age,
        gender,
        location,
        occupation,
        profileComplete: true,
      },
      select: {
        id: true,
        userId: true,
        age: true,
        gender: true,
        location: true,
        occupation: true,
        profileComplete: true,
      },
    });

    const response = NextResponse.json(
      {
        status: 200,
        msg: "Publisher onboarding completed successfully",
        data: updatedPublisher,
      },
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error("Publisher onboarding update failed:", error);

    return NextResponse.json(
      {
        status: 500,
        error: (error as Error).message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
