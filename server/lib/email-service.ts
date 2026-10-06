import { Resend } from "resend";
import { prisma } from "./db.cjs";
import { emailQueue } from "./queue-service";

const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL;

// General email sending function
export async function sendEmail(email: string, subject: string, html: string) {
  try {
    console.log("📧 SENDING EMAIL TO:", email);
    console.log("📝 SUBJECT:", subject);

    const { data, error } = await resend.emails.send({
      from: "Seltra <admin@seltra.app>",
      to: [email],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("❌ Email sending failed:", error);
      return false;
    }

    console.log("✅ EMAIL SENT SUCCESSFULLY:", data);
    return true;
  } catch (error) {
    console.error("❌ Email service error:", error);
    return false;
  }
}

// Specific function for verification emails
export async function sendVerificationEmail(
  email: string,
  token: string,
  username: string
) {
  const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(
    email
  )}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; background: white; padding: 30px; border-radius: 10px; margin: 0 auto; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Verify Your Email</h1>
            <p>Hello <strong>${username}</strong>,</p>
            <p>Welcome to Seltra! Please verify your email address to activate your account.</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${verificationUrl}
            </p>
            
            <p>This verification link will expire in 24 hours.</p>
            
            <div class="footer">
                <p>If you didn't create this account, please ignore this email.</p>
                <p>Best regards,<br>The Seltra Team</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return sendEmail(email, "Verify Your Seltra Account", html);
}

// Specific function for rejecting claims
export async function sendClaimRejectedEmail(
  email: string,
  username: string,
  campaignTitle: string,
  rejectionReason: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; background: white; padding: 30px; border-radius: 10px; margin: 0 auto; }
        .reason-box { background: #fff4f4; border-left: 4px solid #dc2626; padding: 16px; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; }
        .button { background: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Claim Rejected</h1>
        <p>Hello <strong>${username}</strong>,</p>
        <p>Your proof submission for the campaign <strong>${campaignTitle}</strong> was rejected automatically.</p>

        <div class="reason-box">
          <p style="margin: 0;"><strong>Reason:</strong> ${rejectionReason}</p>
        </div>

        <p>Please make sure you post the exact assigned Advert , then submit a clear screenshot showing the post and view count.</p>

        <p style="margin: 30px 0;">
          <a href="${FRONTEND_URL}/dashboard/publisher/campaigns/my-campaigns" class="button">
            View My Campaigns
          </a>
        </p>

        <div class="footer">
          <p>If you believe this was a mistake, please contact support.</p>
          <p>Best regards,<br>The Seltra Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, "Your Seltra Claim Was Rejected", html);
}

// Specific function for approving claims
export async function sendClaimApprovedEmail(
  email: string,
  username: string,
  campaignTitle: string
) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Claim Approved</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f7fb; font-family:Arial, Helvetica, sans-serif; color:#111827;">
      <div style="width:100%; background-color:#f4f7fb; padding:32px 16px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.08); border:1px solid #e5e7eb;">

          <!-- Header -->
          <div style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); padding:36px 32px; text-align:center;">
            <div style="width:72px; height:72px; margin:0 auto 18px; background:rgba(255,255,255,0.18); border-radius:999px; text-align:center; line-height:72px; font-size:34px;">
              ✅
            </div>
            <h1 style="margin:0; font-size:30px; line-height:1.2; color:#ffffff; font-weight:700;">
              Claim Approved
            </h1>
            <p style="margin:12px 0 0; font-size:15px; line-height:1.6; color:rgba(255,255,255,0.9);">
              Great news — your campaign proof has been approved successfully.
            </p>
          </div>

          <!-- Body -->
          <div style="padding:32px;">
            <p style="margin:0 0 16px; font-size:16px; line-height:1.7; color:#111827;">
              Hello <strong>${username}</strong>,
            </p>

            <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#374151;">
              Congratulations! Your proof submission for the campaign
              <strong style="color:#111827;">${campaignTitle}</strong>
              has been approved.
            </p>

            <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:14px; padding:18px 20px; margin:0 0 24px;">
              <p style="margin:0; font-size:15px; line-height:1.7; color:#065f46;">
                Your verified views and earnings have been recorded successfully. You can continue exploring more campaigns and earning on Seltra.
              </p>
            </div>

            <div style="text-align:center; margin:28px 0 30px;">
              <a
                href="${FRONTEND_URL}/explore"
                style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; font-size:15px; font-weight:700; padding:14px 24px; border-radius:10px;"
              >
                View More Campaigns
              </a>
            </div>

            <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:14px; padding:18px 20px;">
              <p style="margin:0 0 8px; font-size:14px; font-weight:700; color:#111827;">
                Keep it up
              </p>
              <p style="margin:0; font-size:14px; line-height:1.7; color:#4b5563;">
                Continue posting the correct assigned creatives and submitting clear proof screenshots to increase your approval rate and earnings.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding:22px 32px; border-top:1px solid #e5e7eb; background:#fcfcfd;">
            <p style="margin:0 0 8px; font-size:13px; line-height:1.6; color:#6b7280;">
              Best regards,
            </p>
            <p style="margin:0; font-size:14px; font-weight:700; color:#111827;">
              The Seltra Team
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, "Your Seltra Claim Was Approved", html);
}
// Function for welcome emails
export async function sendWelcomeEmail(
  email: string,
  username: string,
  role: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; background: white; padding: 30px; border-radius: 10px; margin: 0 auto; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to SELTRA! </h1>
            <p>Hello <strong>${username}</strong>,</p>
            <p>Welcome to SELTRA! You've successfully joined as a ${role}. We're excited to have you on board.</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="https://seltra.app/dashboard/${role}" class="button">Go to Dashboard</a>
            </p>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;"> Getting Started</h3>
                <p>Here's how to make the most of SELTRA:</p>
                <ul>
                    ${
                      role === "publisher"
                        ? "<li>Browse and accept campaigns that match your audience</li>" +
                          "<li>Submit proof of posting to get paid</li>" +
                          "<li>Withdraw your earnings when you reach ₦3,000</li>"
                        : "<li>Create campaigns to promote your business</li>" +
                          "<li>Track campaign performance and analytics</li>" +
                          "<li>Reach your target audience effectively</li>"
                    }
                </ul>
            </div>
            
            <div class="footer">
                <p>Need help? Check out our <a href="https://seltra.app/help">help center</a> or contact support.</p>
                <p>Best regards,<br>The SELTRA Team</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return sendEmail(
    email,
    `Welcome to SELTRA - ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    html
  );
}

// Add this function to your existing email service
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username: string
) {
  const resetUrl = `https://seltra.app/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; background: white; padding: 30px; border-radius: 10px; margin: 0 auto; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; }
            .warning { color: #dc2626; font-size: 14px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Reset Your Password</h1>
            <p>Hello <strong>${username}</strong>,</p>
            <p>We received a request to reset your password for your Seltra account.</p>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${resetUrl}
            </p>
            
            <div class="warning">
                <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
                <p>If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
            </div>
            
            <div class="footer">
                <p>Need help? Contact our support team.</p>
                <p>Best regards,<br>The Seltra Team</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return sendEmail(email, "Reset Your Seltra Password", html);
}

// Notify publishers about new campaign
// Notify publishers about new campaign
export async function sendNewCampaignNotification(
  publisherEmails: string[],
  campaignTitle: string,
  campaignId: string,
  category: string,
  platform: string,
  targetViews: number
) {
  const subject = `New Campaign Available: ${campaignTitle}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; background: white; padding: 30px; border-radius: 10px; margin: 0 auto; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; }
            .campaign-card { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .badge { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1> New Campaign Available!</h1>
            <p>Hello Publisher,</p>
            <p>A new campaign has just been created and is ready for you to accept and start earning!</p>
            
            <div class="campaign-card">
                <h2 style="margin-top: 0;">${campaignTitle}</h2>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0;">
                    <span class="badge">${category}</span>
                    <span class="badge">${platform}</span>
                    <span class="badge">${targetViews.toLocaleString()} views</span>
                </div>
                
                <div style="background: #dcfce7; padding: 15px; border-radius: 6px; margin-top: 15px;">
                    <p style="margin: 0; color: #166534; font-size: 14px;">
                        Complete this campaign and get paid for every verified view!
                    </p>
                </div>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
                <a href="https://seltra.app/explore" class="button">Accept Campaign</a>
            </p>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">💡 Quick Tips</h4>
                <ul style="margin: 0; color: #92400e; font-size: 14px;">
                    <li>Accept campaigns that match your audience for better performance</li>
                    <li>Submit proof within 24 hours of acceptance</li>
                    <li>Earnings are credited after proof approval</li>
                    <li>Withdraw when you reach ₦3,000 minimum</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>Happy publishing! </p>
                <p>Best regards,<br>The SELTRA Team</p>
            </div>
        </div>
    </body>
    </html>
  `;

  // Use the existing bulk email function with batching
  console.log(
    "📧 SENDING CAMPAIGN NOTIFICATION TO:",
    publisherEmails.length,
    "publishers"
  );

  const results = await sendBulkEmails(publisherEmails, subject, html);

  if (results.failed > 0) {
    console.error(
      `❌ Some campaign notifications failed: ${results.failures.join(", ")}`
    );
    return results.success > 0; // Return true if at least some succeeded
  }

  console.log("✅ CAMPAIGN NOTIFICATIONS SENT SUCCESSFULLY");
  return true;
}

// Enhanced email service with better error handling and batching
export async function sendBulkEmails(
  emails: string[],
  subject: string,
  html: string,
  batchSize: number = 50,
  delayBetweenBatches: number = 1000
): Promise<{ success: number; failed: number; failures: string[] }> {
  const results = {
    success: 0,
    failed: 0,
    failures: [] as string[],
  };

  console.log(
    `📧 Starting bulk email send to ${emails.length} recipients in batches of ${batchSize}`
  );

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(emails.length / batchSize);

    console.log(
      `📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} emails)`
    );

    try {
      const { data, error } = await resend.emails.send({
        from: "campaigns@seltra.app",
        to: batch,
        subject: subject,
        html: html,
      });

      if (error) {
        console.error(`❌ Batch ${batchNumber} failed:`, error);
        results.failed += batch.length;
        results.failures.push(`Batch ${batchNumber}: ${error.message}`);

        // For Resend-specific errors, implement retry logic
        if (this.shouldRetry(error)) {
          console.log(`🔄 Retrying batch ${batchNumber} after delay...`);
          await new Promise((resolve) => setTimeout(resolve, 5000));

          // Simple retry once
          const retryResult = await resend.emails.send({
            from: "campaigns@seltra.app",
            to: batch,
            subject: subject,
            html: html,
          });

          if (!retryResult.error) {
            console.log(`✅ Batch ${batchNumber} succeeded on retry`);
            results.success += batch.length;
            results.failed -= batch.length;
            results.failures.pop();
          }
        }
      } else {
        console.log(`✅ Batch ${batchNumber} sent successfully`);
        results.success += batch.length;
      }
    } catch (error) {
      console.error(`❌ Unexpected error in batch ${batchNumber}:`, error);
      results.failed += batch.length;
      results.failures.push(`Batch ${batchNumber}: Unexpected error`);
    }

    // Delay between batches to avoid rate limiting
    if (i + batchSize < emails.length) {
      console.log(`⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  console.log(
    `📊 Bulk email completed: ${results.success} successful, ${results.failed} failed`
  );
  return results;
}
// "next-auth": "^4.24.11",

export async function sendPayoutSuccessEmail(email: string, amount: number) {
  const html = `
    <html>
      <body style="font-family: Arial; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; background: white; padding: 30px; border-radius: 10px; margin: auto;">
          <h1 style="color: #16a34a;">Payout Successful 🎉</h1>
          <p>Your payout of <strong>₦${amount.toLocaleString()}</strong> has been successfully processed.</p>
          <p>You should receive it shortly in your bank account.</p>

          <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; color: #666;">
            <p>Thank you for using SELTRA.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(email, "Your Seltra Payout Was Successful", html);
}

export async function sendPayoutProcessingEmail(email: string, amount: number) {
  const html = `
    <html>
      <body style="font-family: Arial; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; background: white; padding: 30px; border-radius: 10px; margin: auto;">
          <h1 style="color: #2563eb;">Payout is Processing ⏳</h1>
          <p>Your payout request of <strong>₦${amount.toLocaleString()}</strong> has been received and is being processed.</p>
          <p>You'll receive an update once the transfer is complete.</p>

          <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; color: #666;">
            <p>Thanks for your patience.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(email, "Your Seltra Payout is Processing", html);
}

export async function sendPayoutFailedEmail(
  email: string,
  amount: number,
  reason?: string
) {
  const html = `
    <html>
      <body style="font-family: Arial; background: #fff4f4; padding: 20px;">
        <div style="max-width: 600px; background: white; padding: 30px; border-radius: 10px; margin: auto; border-left: 5px solid #dc2626;">
          <h1 style="color: #dc2626;">Payout Failed</h1>
          <p>Your payout of <strong>₦${amount.toLocaleString()}</strong> could not be processed.</p>

          ${
            reason
              ? `<p><strong>Reason:</strong> ${reason}</p>`
              : "<p>The funds have been refunded to your Seltra wallet.</p>"
          }

          <p>If this issue continues, please contact support.</p>

          <div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; color: #666;">
            <p>Seltra Support Team</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(email, "Your Seltra Payout Failed", html);
}

// Helper function to determine if we should retry
function shouldRetry(error: any): boolean {
  if (!error) return false;

  const retryableMessages = [
    "rate limit",
    "too many requests",
    "timeout",
    "server error",
    "temporary",
  ];

  const errorMessage = error.message?.toLowerCase() || "";
  return retryableMessages.some((msg) => errorMessage.includes(msg));
}

// ========================== email marketing ================================

// Simple function to send to multiple advertisers
export async function sendPromotionalToAdvertisers(emails: string[]) {
  try {
    console.log(`📧 Sending promotional email to ${emails.length} advertisers`);
    const mainDescription =
      "Upload your business flyer or video, and thousands of real Nigerians share it on their personal social media accounts. This isn't just advertising; it's digital word-of-mouth that builds instant trust and drives genuine sales.";

    // Using Resend's batch sending
    const { data, error } = await resend.emails.send({
      from: "Seltra <support@seltra.app>",
      to: emails,
      subject: "Boost Online Sales",
      html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Grow Your Business with Seltra</title>
        <style>
            /* Same CSS as above */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; min-height: 100vh; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 10px; line-height: 1.2; }
            .header p { font-size: 1.2rem; opacity: 0.9; font-weight: 300; }
            .content { padding: 40px 30px; }
            .main-message { background: #f8fafc; padding: 30px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #2563eb; }
            .main-message h2 { color: #1e293b; font-size: 1.5rem; margin-bottom: 15px; font-weight: 600; }
            .main-message p { color: #475569; font-size: 1.1rem; line-height: 1.7; }
            .benefits-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin: 30px 0; }
            .benefit-card { background: white; padding: 25px; border-radius: 12px; border: 2px solid #e2e8f0; text-align: center; transition: transform 0.3s ease, box-shadow 0.3s ease; }
            .benefit-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .benefit-icon { font-size: 2.5rem; margin-bottom: 15px; }
            .benefit-card h3 { color: #1e293b; font-size: 1.2rem; margin-bottom: 10px; font-weight: 600; }
            .benefit-card p { color: #64748b; font-size: 0.95rem; }
            .cta-section { text-align: center; padding: 30px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 15px; margin: 30px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-size: 1.2rem; font-weight: 600; transition: transform 0.3s ease, box-shadow 0.3s ease; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3); }
            .cta-button:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(5, 150, 105, 0.4); }
            .social-proof { background: #fef7cd; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px solid #fde68a; }
            .social-proof p { color: #92400e; font-size: 1rem; font-weight: 500; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 30px 0; }
            .stat { text-align: center; padding: 20px; }
            .stat-number { font-size: 2rem; font-weight: 700; color: #2563eb; display: block; }
            .stat-label { font-size: 0.9rem; color: #64748b; font-weight: 500; }
            .footer { background: #1e293b; color: white; padding: 30px; text-align: center; }
            .footer p { margin-bottom: 10px; opacity: 0.8; }
            .footer a { color: #60a5fa; text-decoration: none; }
            @media (max-width: 600px) { .header h1 { font-size: 2rem; } .stats { grid-template-columns: 1fr; } .benefit-card { padding: 20px; } }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Grow Your Business with Seltra</h1>
                <p>Imagine thousands of real Nigerians posting your business flyer on their Social Media</p>
            </div>
            
            <div class="content">
                <div class="main-message">
                    <h2>Transform Your Advertising</h2>
                    <p>${mainDescription}</p>
                </div>
                
                <div class="stats">
                    <div class="stat">
                        <span class="stat-number">10x</span>
                        <span class="stat-label">Higher Trust</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">3.5x</span>
                        <span class="stat-label">Better Conversion</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">1000+</span>
                        <span class="stat-label">Active Publishers</span>
                    </div>
                </div>
                
                <div class="benefits-grid">
                    <div class="benefit-card">
                        <div class="benefit-icon">🤝</div>
                        <h3>Trusted Recommendations</h3>
                        <p>People trust friends more than brands. Get authentic recommendations from real people.</p>
                    </div>
                    
                    <div class="benefit-card">
                        <div class="benefit-icon">📱</div>
                        <h3>WhatsApp Status & More</h3>
                        <p>Your ads appear on personal WhatsApp statuses, Instagram, Twitter, and LinkedIn.</p>
                    </div>
                    
                    <div class="benefit-card">
                        <div class="benefit-icon">💰</div>
                        <h3>Pay Per Real View</h3>
                        <p>Only pay when real people actually see your content. No wasted ad spend.</p>
                    </div>
                </div>
                
                <div class="social-proof">
                    <p>💬 "Got 25 new customers in one week from a single campaign. This actually works!" - Sarah T., Fashion Store Owner</p>
                </div>
                
                <div class="cta-section">
                    <h3 style="color: #065f46; margin-bottom: 20px; font-size: 1.4rem;">Ready to Transform Your Marketing?</h3>
                    <p style="color: #065f46; margin-bottom: 25px; font-size: 1.1rem;">Join hundreds of businesses already growing with Seltra</p>
                    <a href="https://seltra.app/dashboard/advertiser/campaigns/create" class="cta-button">
                        Create Your First Campaign
                    </a>
                    <p style="margin-top: 15px; color: #047857; font-size: 0.9rem;">Takes less than 2 minutes to set up</p>
                </div>
            </div>
            
            <div class="footer">
                <p>📍 Made for Nigerian Businesses</p>
                <p>💌 Questions? Reply to this email - we're here to help!</p>
                <p><a href="https://seltra.app/unsubscribe">Unsubscribe</a> | <a href="https://seltra.app/privacy">Privacy Policy</a></p>
                <p style="margin-top: 20px; opacity: 0.6;">Seltra - Digital Word-of-Mouth Marketing Platform</p>
            </div>
        </div>
    </body>
    </html>
  `,
    });

    if (error) {
      console.error("❌ Promotional email failed:", error);
      return false;
    }

    console.log("✅ Promotional emails sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Promotional email error:", error);
    return false;
  }
}

// Simple function to get advertiser emails
export async function getAdvertiserEmails() {
  // This is a simplified version - you'd use your actual database query
  try {
    const { prisma } = await import("./db.cjs");

    const advertisers = await prisma.user.findMany({
      where: {
        roles: {
          has: "ADVERTISER",
        },
        emailVerified: {
          not: null,
        },
      },
      select: {
        email: true,
      },
      take: 1000, // Limit for safety
    });

    return advertisers.map((a) => a.email).filter(Boolean);
  } catch (error) {
    console.error("❌ Error getting advertiser emails:", error);
    return [];
  }
}

// Simple function to send to multiple publishers
export async function sendPromotionalToPublishers(emails: string[]) {
  try {
    console.log(`📧 Sending promotional email to ${emails.length} publishers`);

    const mainDescription =
      "Start earning money by sharing campaigns on your social media! Join thousands of publishers who are making real income by posting content they believe in.";

    // Using Resend's batch sending
    const { data, error } = await resend.emails.send({
      from: "Seltra <opportunities@seltra.app>",
      to: emails,
      subject:
        "💰 Start Earning Money on Your Social Media - As a Seltra Publisher",
      html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Earn Money with Seltra</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; min-height: 100vh; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 10px; line-height: 1.2; }
            .header p { font-size: 1.2rem; opacity: 0.9; font-weight: 300; }
            .content { padding: 40px 30px; }
            .main-message { background: #f8fafc; padding: 30px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #059669; }
            .main-message h2 { color: #1e293b; font-size: 1.5rem; margin-bottom: 15px; font-weight: 600; }
            .main-message p { color: #475569; font-size: 1.1rem; line-height: 1.7; }
            .benefits-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin: 30px 0; }
            .benefit-card { background: white; padding: 25px; border-radius: 12px; border: 2px solid #e2e8f0; text-align: center; transition: transform 0.3s ease, box-shadow 0.3s ease; }
            .benefit-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .benefit-icon { font-size: 2.5rem; margin-bottom: 15px; }
            .benefit-card h3 { color: #1e293b; font-size: 1.2rem; margin-bottom: 10px; font-weight: 600; }
            .benefit-card p { color: #64748b; font-size: 0.95rem; }
            .cta-section { text-align: center; padding: 30px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 15px; margin: 30px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-size: 1.2rem; font-weight: 600; transition: transform 0.3s ease, box-shadow 0.3s ease; box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3); }
            .cta-button:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(37, 99, 235, 0.4); }
            .earnings-example { background: #fef7cd; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px solid #fde68a; }
            .earnings-example p { color: #92400e; font-size: 1rem; font-weight: 500; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 30px 0; }
            .stat { text-align: center; padding: 20px; }
            .stat-number { font-size: 2rem; font-weight: 700; color: #059669; display: block; }
            .stat-label { font-size: 0.9rem; color: #64748b; font-weight: 500; }
            .footer { background: #1e293b; color: white; padding: 30px; text-align: center; }
            .footer p { margin-bottom: 10px; opacity: 0.8; }
            .footer a { color: #60a5fa; text-decoration: none; }
            .how-it-works { background: #f0f9ff; padding: 25px; border-radius: 12px; margin: 25px 0; }
            .how-it-works h3 { color: #0369a1; margin-bottom: 15px; }
            .step { display: flex; align-items: center; margin-bottom: 15px; }
            .step-number { background: #2563eb; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; }
            @media (max-width: 600px) { .header h1 { font-size: 2rem; } .stats { grid-template-columns: 1fr; } .benefit-card { padding: 20px; } }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Earn Money with Seltra</h1>
                <p>Turn Your Social Media into a Source of Income</p>
            </div>
            
            <div class="content">
                <div class="main-message">
                    <h2>Start Earning Today!</h2>
                    <p>${mainDescription}</p>
                </div>
                
                <div class="stats">
                    <div class="stat">
                        <span class="stat-number">₦3-₦10</span>
                        <span class="stat-label">Per View</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">₦3,000+</span>
                        <span class="stat-label">Monthly Potential</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">500+</span>
                        <span class="stat-label">Active Campaigns</span>
                    </div>
                </div>

                <div class="how-it-works">
                    <h3>How It Works</h3>
                    <div class="step">
                        <div class="step-number">1</div>
                        <div>
                            <strong>Browse Campaigns</strong>
                            <p>Choose from hundreds of campaigns that match your audience</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div>
                            <strong>Share Content</strong>
                            <p>Post campaign content on your WhatsApp status, Instagram, etc.</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div>
                            <strong>Submit Proof</strong>
                            <p>Take a screenshot and submit as proof of posting</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <div>
                            <strong>Get Paid</strong>
                            <p>Earn money for every verified view on your content</p>
                        </div>
                    </div>
                </div>
                
                <div class="benefits-grid">
                    <div class="benefit-card">
                        <div class="benefit-icon">💸</div>
                        <h3>Flexible Earnings</h3>
                        <p>Earn ₦3-₦10 for every view on your shared content. Work on your own schedule.</p>
                    </div>
                    
                    <div class="benefit-card">
                        <div class="benefit-icon">📱</div>
                        <h3>Use Your Existing Platforms</h3>
                        <p>Share on WhatsApp, Instagram, Twitter, LinkedIn - wherever you're already active.</p>
                    </div>
                    
                    <div class="benefit-card">
                        <div class="benefit-icon">⚡</div>
                        <h3>Quick Payouts</h3>
                        <p>Withdraw your earnings when you reach ₦3,000. Fast and reliable payments.</p>
                    </div>
                </div>
                
                <div class="earnings-example">
                    <p>💬 "I made ₦15,000 last month just by posting on my WhatsApp status! This is perfect for students." - Chinedu, University Student</p>
                </div>
                
                <div class="cta-section">
                    <h3 style="color: #1e3a8a; margin-bottom: 20px; font-size: 1.4rem;">Ready to Start Earning?</h3>
                    <p style="color: #1e3a8a; margin-bottom: 25px; font-size: 1.1rem;">Join thousands of publishers already earning with Seltra</p>
                    <a href="https://seltra.app/explore" class="cta-button">
                        Browse Available Campaigns
                    </a>
                    <p style="margin-top: 15px; color: #2563eb; font-size: 0.9rem;">Start earning in minutes!</p>
                </div>

                <div style="background: #f1f5f9; padding: 20px; border-radius: 10px; margin-top: 25px;">
                    <h4 style="color: #475569; margin-bottom: 10px;">🎁 Bonus: Refer Friends & Earn More!</h4>
                    <p style="color: #64748b; font-size: 0.95rem;">Get extra earnings when you refer friends to join Seltra as publishers.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>📍 Perfect for Students, Content Creators, and Social Media Users</p>
                <p>💌 Questions? Reply to this email - we're here to help!</p>
                <p><a href="https://seltra.app/unsubscribe">Unsubscribe</a> | <a href="https://seltra.app/privacy">Privacy Policy</a></p>
                <p style="margin-top: 20px; opacity: 0.6;">Seltra - Earn Money Sharing Content You Love</p>
            </div>
        </div>
    </body>
    </html>
      `,
    });

    if (error) {
      console.error("❌ Publisher promotional email failed:", error);
      return false;
    }

    console.log("✅ Publisher promotional emails sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Publisher promotional email error:", error);
    return false;
  }
}

// Simple function to get publisher emails
export async function getPublisherEmails() {
  try {
    const { prisma } = await import("./db.cjs");

    const publishers = await prisma.user.findMany({
      where: {
        roles: {
          has: "PUBLISHER",
        },
        emailVerified: {
          not: null,
        },
      },
      select: {
        email: true,
      },
      take: 1000, // Limit for safety
    });

    return publishers.map((p) => p.email).filter(Boolean);
  } catch (error) {
    console.error("❌ Error getting publisher emails:", error);
    return [];
  }
}

// Function to get inactive publishers (haven't accepted campaigns recently)
export async function getInactivePublisherEmails() {
  try {
    const { prisma } = await import("./db.cjs");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactivePublishers = await prisma.user.findMany({
      where: {
        roles: {
          has: "PUBLISHER",
        },
        emailVerified: {
          not: null,
        },
        OR: [
          // Publishers with no earnings history
          {
            publisher: {
              earningsHistory: {
                none: {},
              },
            },
          },
          // Publishers who haven't earned in the last 30 days
          {
            publisher: {
              earningsHistory: {
                every: {
                  claimedAt: {
                    lt: thirtyDaysAgo,
                  },
                },
              },
            },
          },
        ],
      },
      select: {
        email: true,
      },
      take: 500,
    });

    return inactivePublishers.map((p) => p.email).filter(Boolean);
  } catch (error) {
    console.error("❌ Error getting inactive publisher emails:", error);
    return [];
  }
}
