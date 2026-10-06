import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserWithRoles } from "../../../../../../lib/user";
import { prisma } from "../../../../../../lib/db.cjs";
import { uploadBufferToR2 } from "../../../../../../lib/r2";
import {
  generateProofCode,
  stampImageWithCode,
  stampVideoWithCode,
} from "../../../../../../lib/ocr";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [ACCEPT CAMPAIGN] Processing campaign acceptance...");

    // 1. Authenticate user
    const user = await getCurrentUserWithRoles(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Check publisher role
    const isPublisher = user.roles.includes("PUBLISHER");
    if (!isPublisher) {
      return NextResponse.json(
        { error: "Only publishers can accept campaigns" },
        { status: 403 }
      );
    }

    const publisher = await prisma.publisher.findUnique({
      where: { userId: user.userId },
    });

    if (!publisher) {
      return NextResponse.json(
        { error: "Publisher profile not found" },
        { status: 404 }
      );
    }

    // 3. Parse request
    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // 4. Fetch campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { adCreative: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 400 }
      );
    }

    if (!campaign.adCreative?.fileUrl) {
      return NextResponse.json(
        { error: "Campaign creative not found" },
        { status: 400 }
      );
    }

    // 5. Check if already accepted
    const existingEarning = await prisma.publisherEarning.findUnique({
      where: {
        publisherId_campaignId: {
          publisherId: publisher.id,
          campaignId,
        },
      },
    });

    if (existingEarning) {
      return NextResponse.json(
        { error: "You have already accepted this campaign" },
        { status: 400 }
      );
    }

    // 6. Determine file type
    const fileUrl = campaign.adCreative.fileUrl;
    console.log("Creative file URL:", fileUrl);

    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(fileUrl);
    const isVideo = /\.(mp4|mov|webm|avi)$/i.test(fileUrl);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Unsupported creative format" },
        { status: 400 }
      );
    }

    // 7. Generate proof code and stamp creative
    const proofCode = generateProofCode();
    console.log("Proof code generated:", proofCode);

    let stampedCreativeUrl: string | null = null;

    try {
      const creativeResponse = await fetch(fileUrl);
      if (!creativeResponse.ok) {
        throw new Error(`Failed to fetch creative: ${creativeResponse.status}`);
      }

      const arrayBuffer = await creativeResponse.arrayBuffer();
      const originalBuffer = Buffer.from(arrayBuffer);

      if (isImage) {
        console.log("Stamping image...");
        const stamped = await stampImageWithCode(originalBuffer, proofCode);
        const uploaded = await uploadBufferToR2(
          stamped.buffer,
          stamped.contentType,
          "stamped-creatives"
        );
        stampedCreativeUrl = uploaded.fileUrl;
        console.log("Image stamped successfully:", stampedCreativeUrl);
      } else if (isVideo) {
        console.log("Stamping video...");
        const stamped = await stampVideoWithCode(
          originalBuffer,
          fileUrl,
          proofCode
        );
        const uploaded = await uploadBufferToR2(
          stamped.buffer,
          "video/mp4",
          "stamped-creatives"
        );
        stampedCreativeUrl = uploaded.fileUrl;
        console.log("Video stamped successfully:", stampedCreativeUrl);
      }
    } catch (stampError) {
      console.error("Stamping failed:", stampError);
      return NextResponse.json(
        { error: "Failed to generate stamped campaign creative" },
        { status: 500 }
      );
    }

    // 8. Create publisher earning record
    const publisherEarning = await prisma.publisherEarning.create({
      data: {
        publisherId: publisher.id,
        campaignId,
        amount: 0,
        views: 0,
        status: "ACTIVE",
        proofImages: [],
        proofUrls: [],
        proofCode,
        stampedCreativeUrl,
        claimedAt: new Date(),
      },
      include: {
        campaign: {
          include: {
            adCreative: true,
          },
        },
      },
    });

    console.log("✅ [ACCEPT CAMPAIGN] Campaign accepted successfully");

    return NextResponse.json({
      status: 200,
      message: "Campaign accepted successfully",
      data: {
        publisherCampaign: publisherEarning,
        creativeToPost: stampedCreativeUrl,
      },
    });
  } catch (error: unknown) {
    console.error("❌ [ACCEPT CAMPAIGN] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

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
