import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const updateUserSchema = z
  .object({
    verified: z.boolean().optional(),
    platforms: z.record(z.string(), z.boolean()).optional(), // Fixed: added key and value types
  })
  .refine(
    (data) => data.verified !== undefined || data.platforms !== undefined,
    {
      message: "At least one field (verified or platforms) must be provided",
    }
  );

// lib/zod-schema.ts
export const createCampaignSchema = z.object({
  title: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  amountPaid: z.number().positive("amountPaid must be positive"),
  targetViews: z.number().int().positive("Target views must be positive"),
  platform: z.enum([
    "whatsapp",
    "instagram",
    "twitter",
    "linkedin",
    "facebook",
    "ticktok",
    "all",
  ]),
  adCreative: z.object({
    fileUrl: z.string().url("Valid file URL is required"),
    text: z.string().optional(),
  }),
});

export const updateCampaignSchema = z.object({
  title: z.string().min(1, "Campaign name is required").optional(),
  description: z.string().optional(),
});

export const updateProfileSchema = z.object({
  platforms: z
    .object({
      whatsapp: z.boolean().optional(),
      instagram: z.boolean().optional(),
      twitter: z.boolean().optional(),
      linkedin: z.boolean().optional(),
    })
    .optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
});
