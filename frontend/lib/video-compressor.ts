// lib/video-compressor.ts
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlob } from "@ffmpeg/util";

export class VideoCompressor {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async load() {
    if (this.isLoaded) return;

    this.ffmpeg = new FFmpeg();

    try {
      await this.ffmpeg.load();
      this.isLoaded = true;
      console.log("✅ FFmpeg loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load FFmpeg:", error);
      throw new Error("Video compression not available");
    }
  }

  async compressVideo(file: File, targetSizeMB: number = 20): Promise<Blob> {
    if (!this.ffmpeg || !this.isLoaded) {
      await this.load();
    }

    console.log(
      `🎥 Compressing video: ${file.name} (${this.formatFileSize(
        file.size
      )}) to ${targetSizeMB}MB`
    );

    try {
      // Write input file to FFmpeg
      await this.ffmpeg.writeFile("input.mp4", await fetchFile(file));

      // Calculate target bitrate (rough estimation)
      const targetSizeBytes = targetSizeMB * 1024 * 1024;
      const duration = await this.getVideoDuration(file);
      const targetBitrate =
        Math.floor((targetSizeBytes * 8) / duration) - 128000; // Subtract audio bitrate

      // Compression options optimized for social media
      const args = [
        "-i",
        "input.mp4",
        "-c:v",
        "libx264",
        "-crf",
        "23", // Quality factor (23 is good balance)
        "-preset",
        "medium", // Encoding speed
        "-maxrate",
        `${Math.max(2000, targetBitrate / 1000)}k`, // Max bitrate
        "-bufsize",
        "4000k", // Buffer size
        "-vf",
        "scale=720:-2", // Scale to 720p, maintain aspect ratio
        "-r",
        "30", // Frame rate
        "-c:a",
        "aac",
        "-b:a",
        "128k", // Audio bitrate
        "-movflags",
        "+faststart", // Optimize for web playback
        "-y", // Overwrite output
        "output.mp4",
      ];

      // Execute compression
      await this.ffmpeg.exec(args);

      // Read compressed file
      const compressedData = await this.ffmpeg.readFile("output.mp4");
      const compressedBlob = new Blob([compressedData], { type: "video/mp4" });

      console.log(
        `✅ Video compressed: ${this.formatFileSize(compressedBlob.size)}`
      );

      // Clean up
      await this.ffmpeg.deleteFile("input.mp4");
      await this.ffmpeg.deleteFile("output.mp4");

      return compressedBlob;
    } catch (error) {
      console.error("❌ Video compression failed:", error);
      throw new Error(
        "Failed to compress video. Please try a smaller file or different format."
      );
    }
  }

  private async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)}KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  // Quick compression for very large files
  async quickCompress(file: File, maxSizeMB: number = 20): Promise<Blob> {
    const targetSize = await this.estimateTargetSize(file, maxSizeMB);
    return this.compressVideo(file, targetSize);
  }

  private async estimateTargetSize(
    file: File,
    maxSizeMB: number
  ): Promise<number> {
    const currentSizeMB = file.size / (1024 * 1024);

    if (currentSizeMB <= maxSizeMB) {
      return currentSizeMB;
    }

    // Estimate compression ratio based on file size
    if (currentSizeMB > 100) return Math.max(15, maxSizeMB * 0.7); // Aggressive compression for very large files
    if (currentSizeMB > 50) return Math.max(18, maxSizeMB * 0.8); // Moderate compression
    return maxSizeMB; // Light compression
  }

  // Check if compression is likely to succeed
  canCompress(file: File): { canCompress: boolean; reason?: string } {
    const maxSupportedSize = 500 * 1024 * 1024; // 500MB max for compression

    if (file.size > maxSupportedSize) {
      return {
        canCompress: false,
        reason: `File too large (${this.formatFileSize(
          file.size
        )}). Maximum supported size is 500MB.`,
      };
    }

    if (!file.type.startsWith("video/")) {
      return {
        canCompress: false,
        reason: "File is not a video",
      };
    }

    return { canCompress: true };
  }
}
