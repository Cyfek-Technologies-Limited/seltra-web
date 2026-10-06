// lib/ocr.ts - Updated March 2026 version (fixed Sharp threshold options)
import satori from "satori";
import { readFileSync } from "fs";
import { join } from "path";
import { createWorker, PSM } from "tesseract.js";
import sharp from "sharp";

export function generateProofCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SELTRA-${code}`;
}

interface PreprocessConfig {
  suffix: string;
  negate: boolean;
  threshold: number;
  brightness: number;
  median?: number; // optional
  useClahe?: boolean;
  sharpenSigma?: number;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

import React from "react";

export async function stampImageWithCode(
  inputBuffer: Buffer,
  proofCode: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const image = sharp(inputBuffer);
  const { width = 1080, height = 1920, format } = await image.metadata();

  const fontSize = Math.max(28, Math.round(width * 0.035));
  const padding = Math.round(width * 0.03);
  const boxWidth = Math.round(width * 0.42);
  const boxHeight = Math.round(fontSize * 2.2);
  const x = width - boxWidth - padding;
  const y = height - boxHeight - padding;

  const fontPath = join(process.cwd(), "public", "fonts", "Roboto-Bold.ttf");
  const fontData = readFileSync(fontPath);

  const element = React.createElement(
    "div",
    {
      style: {
        width: boxWidth,
        height: boxHeight,
        backgroundColor: "rgba(0,0,0,0.65)",
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        paddingLeft: 20,
      },
    },
    React.createElement(
      "span",
      {
        style: {
          color: "white",
          fontSize,
          fontWeight: "bold",
          fontFamily: "Roboto",
          letterSpacing: 1,
        },
      },
      proofCode
    )
  );

  const svg = await satori(element, {
    width: boxWidth,
    height: boxHeight,
    fonts: [
      {
        name: "Roboto",
        data: fontData,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const overlayPng = await sharp(Buffer.from(svg)).png().toBuffer();

  const composite = await image
    .composite([{ input: overlayPng, top: y, left: x }])
    [format === "png" ? "png" : format === "webp" ? "webp" : "jpeg"]({
      quality: format === "webp" ? 92 : 90,
    })
    .toBuffer();

  return {
    buffer: composite,
    contentType: `image/${
      format === "png" ? "png" : format === "webp" ? "webp" : "jpeg"
    }`,
  };
}

export async function stampVideoWithCode(
  videoBuffer: Buffer,
  videoUrl: string,
  proofCode: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const stampUrl = "https://video-stamping-microservice.onrender.com"; // your Render URL
  const secret = "any-long-random-string-i-choose";

  if (!stampUrl) throw new Error("VIDEO_STAMP_SERVICE_URL not set");
  if (!secret) throw new Error("STAMP_SERVICE_SECRET not set");

  const response = await fetch(`${stampUrl}/stamp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ videoUrl, proofCode }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Video stamp service error: ${err}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType: "video/mp4" };
}

export async function generateProofCard(
  proofCode: string,
  campaignTitle: string
): Promise<Buffer> {
  const width = 1080;
  const height = 1080;

  // We already solved the font issue with Satori — reuse it here
  const fontPath = join(process.cwd(), "public", "fonts", "Roboto-Bold.ttf");
  const fontData = readFileSync(fontPath);

  const element = React.createElement(
    "div",
    {
      style: {
        width,
        height,
        backgroundColor: "#0f172a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      },
    },
    React.createElement(
      "div",
      { style: { color: "#94a3b8", fontSize: 28, fontFamily: "Roboto" } },
      "Seltra Proof of Post"
    ),
    React.createElement(
      "div",
      {
        style: {
          color: "white",
          fontSize: 22,
          fontFamily: "Roboto",
          textAlign: "center",
          padding: "0 60px",
          opacity: 0.7,
        },
      },
      campaignTitle
    ),
    React.createElement(
      "div",
      {
        style: {
          backgroundColor: "#1e293b",
          borderRadius: 20,
          padding: "24px 48px",
          marginTop: 16,
        },
      },
      React.createElement(
        "div",
        {
          style: {
            color: "#38bdf8",
            fontSize: 52,
            fontFamily: "Roboto",
            fontWeight: "bold",
            letterSpacing: 4,
          },
        },
        proofCode
      )
    ),
    React.createElement(
      "div",
      {
        style: {
          color: "#475569",
          fontSize: 20,
          fontFamily: "Roboto",
          marginTop: 16,
        },
      },
      "seltra.app"
    )
  );

  const svg = await satori(element, {
    width,
    height,
    fonts: [{ name: "Roboto", data: fontData, weight: 700, style: "normal" }],
  });

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function fetchRemoteImageAsBuffer(
  imageUrl: string
): Promise<Buffer> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export function normalizeText(text: string) {
  return text.toUpperCase().replace(/\s+/g, "");
}

export function doesProofCodeMatch(
  ocrText: string,
  proofCode: string
): boolean {
  const cleanOcr = normalizeText(ocrText);
  const cleanCode = normalizeText(proofCode);

  console.log("[MATCH DEBUG] raw ocr:", JSON.stringify(ocrText));
  console.log(
    "[MATCH DEBUG] clean ocr:",
    cleanOcr,
    `(length ${cleanOcr.length})`
  );
  console.log(
    "[MATCH DEBUG] clean code:",
    cleanCode,
    `(length ${cleanCode.length})`
  );

  if (cleanOcr.includes(cleanCode)) {
    console.log("[MATCH] perfect contains match");
    return true;
  }

  const startsWithSeltra = cleanOcr.startsWith("SELTRA");
  console.log("[MATCH DEBUG] startsWith SELTRA:", startsWithSeltra);

  if (startsWithSeltra && cleanOcr.length >= 11) {
    const codePart = cleanCode.replace("SELTRA-", "");
    const ocrPart = cleanOcr.replace("SELTRA", "").replace("-", "");

    console.log("[MATCH DEBUG] codePart:", codePart);
    console.log("[MATCH DEBUG] ocrPart :", ocrPart);

    const cond1 = codePart.startsWith(ocrPart);
    const cond2 = ocrPart.startsWith(codePart.slice(0, -1));

    console.log("[MATCH DEBUG] cond1 (code starts with ocr):", cond1);
    console.log("[MATCH DEBUG] cond2 (ocr starts with code[:-1]):", cond2);

    if (cond1 || cond2) {
      console.log(
        `[MATCH] High-conf partial match: "${cleanOcr}" covers most of "${cleanCode}"`
      );
      return true;
    }
  }

  // 3. Fuzzy edit distance (allow 1–2 char differences anywhere)
  const codeLen = cleanCode.length;
  if (cleanOcr.length >= codeLen - 3) {
    for (let i = 0; i <= cleanOcr.length - codeLen; i++) {
      const slice = cleanOcr.slice(i, i + codeLen);
      let diffs = 0;
      for (let j = 0; j < codeLen; j++) {
        if (slice[j] !== cleanCode[j]) diffs++;
        if (diffs > 2) break;
      }
      if (diffs <= 2) {
        console.log(
          `Fuzzy match: "${slice}" ≈ "${cleanCode}" (diffs=${diffs})`
        );
        return true;
      }
    }
  }
  console.log("[MATCH] No match found");

  return false;
}

export function extractPossibleViews(text: string): number | null {
  const matches = text.match(/\b\d{1,6}\b/g);
  if (!matches) return null;

  const numbers = matches
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);

  if (!numbers.length) return null;

  return Math.max(...numbers);
}

export async function extractTextFromImageUrl(
  imageUrl: string
): Promise<{ text: string; confidence: number }> {
  const buffer = await fetchRemoteImageAsBuffer(imageUrl);
  const original = sharp(buffer);
  const { width: origWidth = 1080 } = await original.metadata();

  const targetWidth = 1600;
  const upscaleFactor = Math.max(2.5, targetWidth / origWidth);
  const upscaled = await original
    .resize({
      width: Math.round(origWidth * upscaleFactor),
      kernel: "lanczos3",
    })
    .median(1)
    .toBuffer();

  const variants = [
    { name: "bright-soft", negate: false, threshold: 0, brightness: 1.55 },
    { name: "normal-bin", negate: false, threshold: 105, brightness: 1.3 },
    { name: "negate", negate: true, threshold: 60, brightness: 1.4 },
    { name: "strong-neg", negate: true, threshold: 75, brightness: 1.2 },
  ];

  let bestText = "";
  let bestConf = 0;
  let bestVariant = "";

  for (const v of variants) {
    let pipe = sharp(upscaled)
      .grayscale()
      .normalize()
      .modulate({ brightness: v.brightness });

    if (v.threshold > 0) pipe = pipe.threshold(v.threshold);
    if (v.negate) pipe = pipe.negate();

    // Optional: add simulated contrast or CLAHE here if needed
    // pipe = pipe.linear(1.15, -19.2); // ~15% contrast boost
    // pipe = pipe.clahe({ width: 16, height: 16, maxSlope: 2.0 });

    const processed = await pipe
      .sharpen({ sigma: 0.8 })
      .png({ quality: 100 })
      .toBuffer();

    const worker = await createWorker("eng", 1);
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- ",
      user_defined_dpi: "300",
    });

    const { data } = await worker.recognize(processed);
    await worker.terminate();

    const clean = data.text.trim();
    console.log(
      `Full OCR variant ${v.name}: conf=${
        data.confidence
      }, text="${clean.substring(0, 180)}"`
    );

    if (data.confidence > bestConf && clean.length > 8) {
      bestConf = data.confidence;
      bestText = clean;
      bestVariant = v.name;
    }
  }

  console.log(`Best full OCR: variant=${bestVariant}, conf=${bestConf}`);

  return { text: bestText, confidence: bestConf };
}

// ────────────────────────────────────────────────
//             IMPROVED VIEW COUNT EXTRACTION
// ────────────────────────────────────────────────

function extractPlausibleViewNumber(
  text: string,
  proofCode?: string
): number | null {
  let cleaned = text
    .replace(/[^0-9\s\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Try to merge split numbers (e.g. "2 5" → "25")
  const merged = cleaned.replace(/(\d)\s+(\d)/g, "$1$2");

  const digitGroups = merged
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0 && n < 100_000);

  if (digitGroups.length === 0) return null;

  digitGroups.sort((a, b) => b - a);
  let candidate = digitGroups[0];

  // If proof code present, avoid confusing with code digits
  if (proofCode) {
    const codeDigits = new Set(proofCode.match(/\d+/g) || []);
    if (codeDigits.has(String(candidate)) && digitGroups.length > 1) {
      candidate = digitGroups[1];
    }
  }

  const lower = text.toLowerCase();
  if (
    lower.includes("view") ||
    lower.includes("viewed") ||
    lower.includes("👁") ||
    lower.match(/view\s*by/i) ||
    lower.includes("seen")
  ) {
    return candidate;
  }

  // Fallback: if merged version gives reasonable number, use it
  if (merged !== cleaned && digitGroups.length > 0) {
    return candidate;
  }

  return null; // be stricter if no context words
}

interface CropRegion {
  name: string;
  leftRatio: number;
  topRatio: number;
  widthRatio: number;
  heightRatio: number;
}

interface OcrCandidate {
  region: string;
  text: string;
  confidence: number;
  extractedViews: number | null;
}

interface WhatsappViewsResult {
  best: OcrCandidate | null;
  candidates: OcrCandidate[];
  overallConfidence: number;
}

export async function extractWhatsappViewsFromImageUrl(
  imageUrl: string,
  proofCode?: string,
  minWidth = 1500
): Promise<WhatsappViewsResult> {
  const buffer = await fetchRemoteImageAsBuffer(imageUrl);

  const original = sharp(buffer);
  const { width: origWidth = 1080, height: origHeight = 1920 } =
    await original.metadata();

  const upscaleFactor = Math.max(2.5, minWidth / origWidth);
  const upscaledBuffer = await original
    .resize({
      width: Math.round(origWidth * upscaleFactor),
      kernel: "lanczos3",
    })
    .gamma(1.2)
    .median(1)
    .toBuffer();

  const image = sharp(upscaledBuffer);
  const { width, height } = await image.metadata();

  console.log("WhatsApp OCR – adaptive upscale:", {
    originalWidth: origWidth,
    upscaledTo: width,
    height,
    factor: upscaleFactor.toFixed(2),
  });

  const bottomSectionHeight = Math.floor(height * 0.32);
  const bottomY = height - bottomSectionHeight;
  console.log(`Bottom section: y=${bottomY}, height=${bottomSectionHeight}`);

  let bottomSectionBuffer: Buffer;
  try {
    bottomSectionBuffer = await image
      .clone()
      .extract({ left: 0, top: bottomY, width, height: bottomSectionHeight })
      .toBuffer();
  } catch (err) {
    console.error("Failed to extract bottom section:", err);
    return { best: null, candidates: [], overallConfidence: 0 };
  }

  const subRegions: CropRegion[] = [
    {
      name: "center-bottom-views",
      leftRatio: 0.25,
      widthRatio: 0.5,
      topRatio: 0.78,
      heightRatio: 0.22,
    },
    {
      name: "very-low-center",
      leftRatio: 0.2,
      widthRatio: 0.6,
      topRatio: 0.84,
      heightRatio: 0.16,
    },
    {
      name: "right-tight",
      leftRatio: 0.68,
      widthRatio: 0.32,
      topRatio: 0.7,
      heightRatio: 0.3,
    },
    {
      name: "right-wide",
      leftRatio: 0.6,
      widthRatio: 0.4,
      topRatio: 0.65,
      heightRatio: 0.35,
    },
    {
      name: "center-right",
      leftRatio: 0.45,
      widthRatio: 0.35,
      topRatio: 0.7,
      heightRatio: 0.3,
    },
    {
      name: "full-bottom",
      leftRatio: 0.0,
      widthRatio: 1.0,
      topRatio: 0.75,
      heightRatio: 0.25,
    },
    {
      name: "extreme-right",
      leftRatio: 0.75,
      widthRatio: 0.25,
      topRatio: 0.65,
      heightRatio: 0.35,
    },
  ];

  const candidates: OcrCandidate[] = [];

  const preprocessConfigs: PreprocessConfig[] = [
    { suffix: "-negate", negate: true, threshold: 55, brightness: 1.3 },
    { suffix: "", negate: false, threshold: 110, brightness: 1.3 },
    {
      suffix: "-soft-clahe",
      negate: false,
      threshold: 0,
      brightness: 1.5,
      useClahe: true,
      sharpenSigma: 1.2,
    },
    {
      suffix: "-very-soft",
      negate: false,
      threshold: 0,
      brightness: 1.7,
      median: 0, // even if 0, we'll skip below
      sharpenSigma: 0.8,
    },
  ];

  for (const r of subRegions) {
    for (const cfg of preprocessConfigs) {
      const left = Math.max(0, Math.round(width * r.leftRatio));
      const top = Math.max(0, Math.round(bottomSectionHeight * r.topRatio));
      const cropW = Math.max(
        100,
        Math.min(Math.round(width * r.widthRatio), width - left)
      );
      const cropH = Math.max(
        50,
        Math.min(
          Math.round(bottomSectionHeight * r.heightRatio),
          bottomSectionHeight - top
        )
      );

      if (cropW < 100 || cropH < 50) continue;

      console.log(
        `Trying crop: ${r.name}${cfg.suffix} → left=${left}, top=${top}, w=${cropW}, h=${cropH}`
      );

      let pipeline = sharp(bottomSectionBuffer)
        .extract({ left, top, width: cropW, height: cropH })
        .grayscale()
        .normalize()
        .modulate({ brightness: cfg.brightness });

      // Only apply median if explicitly defined (and > 0)
      if ("median" in cfg && cfg.median !== undefined && cfg.median >= 1) {
        pipeline = pipeline.median(cfg.median);
      }

      if (cfg.useClahe) {
        pipeline = pipeline.clahe({ width: 16, height: 16, maxSlope: 3 });
      }

      if (cfg.negate) pipeline = pipeline.negate();

      if (cfg.threshold > 0) {
        pipeline = pipeline.threshold(cfg.threshold);
      }

      if (cfg.sharpenSigma) {
        pipeline = pipeline.sharpen({ sigma: cfg.sharpenSigma });
      }

      let processedBuffer: Buffer;
      try {
        processedBuffer = await pipeline.png({ quality: 100 }).toBuffer();
      } catch (err) {
        console.warn(
          `Pipeline failed for ${r.name}${cfg.suffix}:`,
          err.message
        );
        continue;
      }

      try {
        const worker = await createWorker("eng", 1);
        await worker.setParameters({
          tessedit_pageseg_mode: PSM.SINGLE_WORD,
          tessedit_char_whitelist: "0123456789",
          user_defined_dpi: "400",
        });

        const { data } = await worker.recognize(processedBuffer);
        await worker.terminate();

        console.log(
          `RAW TESSERACT in ${r.name}${
            cfg.suffix
          }: "${data.text.trim()}" (conf ${data.confidence || 0})`
        );

        const views = extractPlausibleViewNumber(data.text, proofCode);

        candidates.push({
          region: `${r.name}${cfg.suffix}`,
          text: data.text.trim(),
          confidence: data.confidence || 0,
          extractedViews: views,
        });

        if (views !== null && data.confidence < 30) {
          console.log(
            `Low-conf candidate in ${r.name}${
              cfg.suffix
            }: "${data.text.trim()}" → ${views} views (conf ${data.confidence})`
          );
        }
      } catch (ocrErr) {
        console.warn(`Tesseract failed on ${r.name}${cfg.suffix}:`, ocrErr);
      }
    }
  }

  const valid = candidates.filter(
    (c) =>
      c.extractedViews !== null &&
      (c.confidence > 10 ||
        (c.extractedViews <= 9999 &&
          String(c.extractedViews).length <= 4 &&
          c.confidence >= 0))
  );

  const best =
    valid.length > 0
      ? valid.sort(
          (a, b) =>
            b.confidence -
            a.confidence +
            (b.extractedViews! - a.extractedViews!) * 0.05
        )[0]
      : null;

  const overallConfidence = best
    ? best.confidence
    : Math.max(0, ...candidates.map((c) => c.confidence));

  console.log("OCR SUMMARY:", {
    extractedViews: best?.extractedViews ?? null,
    bestRegion: best?.region,
    bestConfidence: best?.confidence,
    candidatesCount: candidates.length,
    validCount: valid.length,
  });

  return { best, candidates, overallConfidence };
}
