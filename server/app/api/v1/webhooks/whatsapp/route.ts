import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN; // Set this in your .env file or Vercel env vars

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified!");
      return new NextResponse(challenge, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Webhook GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received webhook payload:", JSON.stringify(body, null, 2)); // Log for debugging; store in DB for production

    // Process statuses here (e.g., update your app's records)
    if (body.object === "whatsapp_business_account" && body.entry) {
      body.entry.forEach((entry: any) => {
        entry.changes.forEach((change: any) => {
          if (change.field === "messages" && change.value.statuses) {
            change.value.statuses.forEach((status: any) => {
              console.log(`Message ID: ${status.id}, Status: ${status.status}`);
              // Handle: 'sent', 'delivered', 'read', 'failed' – e.g., notify user or update UI/database
            });
          }
        });
      });
    }

    return NextResponse.json({ message: "OK" }, { status: 200 }); // Always respond 200 to acknowledge
  } catch (error) {
    console.error("Webhook POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
