const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const axios = require("axios");
const fs = require("fs");
const { execSync } = require("child_process");
const { randomUUID } = require("crypto");

ffmpeg.setFfmpegPath(ffmpegPath);

try {
  execSync("apt-get install -y fonts-dejavu-core 2>/dev/null || true");
  console.log("Fonts installed");
} catch (e) {
  console.log("Font install skipped");
}

const FONT_FALLBACKS = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
];

function getAvailableFont() {
  for (const f of FONT_FALLBACKS) {
    if (fs.existsSync(f)) return f;
  }
  return null;
}

const app = express();
app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
  if (req.path === "/health") return next();
  if (req.headers.authorization !== `Bearer ${process.env.STAMP_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.get("/health", (_, res) => {
  res.json({ ok: true, font: getAvailableFont() || "NOT FOUND" });
});

app.post("/stamp", async (req, res) => {
  const { videoUrl, proofCode } = req.body;
  if (!videoUrl || !proofCode) {
    return res.status(400).json({ error: "videoUrl and proofCode required" });
  }

  const fontPath = getAvailableFont();
  if (!fontPath) {
    return res.status(500).json({ error: "No font available" });
  }

  const id = randomUUID();
  const inputPath = `/tmp/input_${id}.mp4`;
  const outputPath = `/tmp/output_${id}.mp4`;

  try {
    // 1. Download
    console.log("Downloading:", videoUrl);
    const response = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      timeout: 60000,
    });
    fs.writeFileSync(inputPath, Buffer.from(response.data));
    console.log("Downloaded:", response.data.byteLength, "bytes");

    // 2. Probe dimensions
    const metadata = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    const videoStream = metadata.streams.find((s) => s.codec_type === "video");
    const vw = videoStream.width;
    const vh = videoStream.height;
    console.log("Dimensions:", vw, "x", vh);

    // 3. Compute hardcoded pixel positions — NO iw/ih variables
    const boxW = 300;
    const boxH = 65;
    const boxX = vw - boxW - 10;
    const boxY = vh - boxH - 10;
    const textX = boxX + 10;
    const textY = boxY + 38;

    const safeCode = proofCode.replace(/['"\\:,\[\]]/g, "");

    // FFmpeg filter escaping for font path:
    // colons must be escaped as \: and backslashes as \\
    const escapedFont = fontPath
      .replace(/\\/g, "/") // normalize to forward slashes
      .replace(/:/g, "\\:"); // escape colons for filter syntax

    // Build filter with ALL hardcoded integers — no expressions
    const filterStr = [
      `drawbox=x=${boxX}:y=${boxY}:w=${boxW}:h=${boxH}:color=black@0.65:t=fill`,
      `drawtext=fontfile='${escapedFont}':text='${safeCode}':fontsize=32:fontcolor=white:x=${textX}:y=${textY}`,
    ].join(",");

    console.log("Filter:", filterStr);
    console.log("Positions: box=", boxX, boxY, "text=", textX, textY);

    // 4. Run FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          `-c:v`,
          `libx264`,
          `-c:a`,
          `aac`,
          `-preset`,
          `ultrafast`,
          `-crf`,
          `23`,
          `-pix_fmt`,
          `yuv420p`,
          `-y`,
        ])
        .videoFilter(filterStr)
        .output(outputPath)
        .on("start", (cmd) => console.log("CMD:", cmd))
        .on("stderr", (line) => console.log("FF:", line))
        .on("end", resolve)
        .on("error", (err, _, stderr) => {
          console.error("FFmpeg failed:", stderr);
          reject(new Error(stderr || err.message));
        })
        .run();
    });

    // 5. Send back
    const stamped = fs.readFileSync(outputPath);
    console.log("Done, size:", stamped.length);
    res.set("Content-Type", "video/mp4");
    res.send(stamped);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  }
});

app.listen(process.env.PORT || 3001, () =>
  console.log("Ready on port", process.env.PORT || 3001)
);
