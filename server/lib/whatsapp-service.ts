// whatsapp-service.ts

// Always load environment variables
const WABA_ID = process.env.META_WA_NUMBER_ID;
const META_WA_TOKEN =
  "EAAUHH0KhLs8BQ7LzVpll9f0rejXDrzZBaozaCU1lqzXybpF7WdxOhjVlK03n0VgXDR5LMg6kmNPVWxAxmY7gpgLiVvNE6zjeLzs15AWrDDPWEUp8Lt5kTIJYANMms9GtiG1k7mk9On09xZCdADZA4IoXAhPAPxvAiiZCVVFRJDM0FWSswhQ1s8Gd17JevQZDZD";

if (!META_WA_TOKEN) {
  throw new Error("META_WA_TOKEN is not set in your environment variables");
}

/**
 * Send a WhatsApp template message via Meta Cloud API
 * @param to Recipient phone number in international format (e.g., 15551234567)
 * @param template Template name as approved in your WABA
 * @param bodyParams Array of strings to fill body parameters (POSITIONAL)
 * @param footerText Optional footer text
 * @param buttonParam Optional parameter for URL button
 */
export async function sendWhatsAppTemplate(
  to: string,
  template: string,
  bodyParams: string[] = [],
  footerText?: string,
  buttonParam?: string
) {
  if (!to) throw new Error("Recipient phone number is required");

  // Build components dynamically
  const components: any[] = [];

  // Body parameters
  if (bodyParams.length) {
    components.push({
      type: "body",
      parameters: bodyParams.map((p) => ({ type: "text", text: p })),
    });
  }

  // Footer
  if (footerText) {
    components.push({
      type: "footer",
      parameters: [{ type: "text", text: footerText }],
    });
  }

  // Button (URL button with parameter)
  if (buttonParam) {
    components.push({
      type: "button",
      sub_type: "url",
      index: 0, // first button
      parameters: [{ type: "text", text: buttonParam }],
    });
  }

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: template,
      language: { code: "en_US" },
      components,
    },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v22.0/${WABA_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${META_WA_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("WhatsApp template sending failed:", data);
      return data;
    }

    console.log("WhatsApp template sent:", data);
    return data;
  } catch (err) {
    console.error("Error sending WhatsApp template:", err);
    throw err;
  }
}

/**
 * Send seltra_campaigns WhatsApp template
 * @param to Phone number in international format
 * @param publisherName Fills {{1}}
 */
export async function sendNewCampaignTemplate(
  to: string,
  publisherName: string
) {
  if (!to) throw new Error("Recipient phone number is required");

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "seltra_campaigns",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: publisherName,
            },
          ],
        },
      ],
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/v22.0/${WABA_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${META_WA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ WhatsApp send failed:", data);
    throw new Error(data.error?.message || "WhatsApp send failed");
  }

  console.log("✅ WhatsApp sent:", data);
  return data;
}

const BATCH_SIZE = 20;
const BATCH_DELAY = 10_000;

export async function sendCampaignWhatsAppToPublishers(
  publishers: { phone: string; name: string }[]
) {
  console.log(`📲 Sending WhatsApp to ${publishers.length} publishers`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < publishers.length; i += BATCH_SIZE) {
    const batch = publishers.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async ({ phone, name }) => {
        try {
          await sendNewCampaignTemplate(phone, name || "Publisher");
          success++;
        } catch (err) {
          failed++;
          console.error(`❌ Failed for ${phone}`, err);
        }
      })
    );

    if (i + BATCH_SIZE < publishers.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY));
    }
  }

  console.log(`📊 Result: ${success} sent, ${failed} failed`);
  return { success, failed };
}
