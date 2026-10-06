// lib/file-compression.ts - UPDATED
import imageCompression from "browser-image-compression";

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  fileType?: string;
}

export class FileCompressor {
  static defaultImageOptions: CompressionOptions = {
    maxSizeMB: 5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  static defaultVideoOptions = {
    maxSizeMB: 50,
  };

  /**
   * Compress an image file to meet size requirements
   */
  static async compressImage(
    file: File,
    options?: Partial<CompressionOptions>
  ): Promise<File> {
    try {
      const compressionOptions: CompressionOptions = {
        ...this.defaultImageOptions,
        ...options,
      };

      console.log(
        `🟡 Compressing image: ${file.name} (${this.formatFileSize(file.size)})`
      );

      const compressedFile = await imageCompression(file, compressionOptions);

      console.log(
        `✅ Image compressed: ${compressedFile.name} (${this.formatFileSize(
          compressedFile.size
        )})`
      );

      return compressedFile;
    } catch (error) {
      console.error("❌ Image compression failed:", error);
      throw new Error("Failed to compress image");
    }
  }

  /**
   * Process video file with better user guidance
   */
  static async processVideo(
    file: File
  ): Promise<{ file: File; needsServerCompression: boolean }> {
    console.log(
      `🟡 Processing video: ${file.name} (${this.formatFileSize(file.size)})`
    );

    const maxSize = this.defaultVideoOptions.maxSizeMB * 1024 * 1024;

    if (file.size > maxSize) {
      // Instead of rejecting, we'll allow upload but flag for server compression
      return {
        file,
        needsServerCompression: true,
      };
    }

    // Basic video validation
    if (!file.type.startsWith("video/")) {
      throw new Error("Please upload a valid video file (MP4, MOV, etc.)");
    }

    return {
      file,
      needsServerCompression: false,
    };
  }

  /**
   * Auto-compress any file based on its type
   */
  static async compressFile(
    file: File
  ): Promise<{ file: File; needsServerCompression: boolean }> {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (isImage) {
      const compressedFile = await this.compressImage(file);
      return { file: compressedFile, needsServerCompression: false };
    } else if (isVideo) {
      return await this.processVideo(file);
    } else {
      throw new Error(
        "Unsupported file type. Please upload an image or video."
      );
    }
  }

  /**
   * Check if file needs compression
   */
  static needsCompression(file: File): {
    needsCompression: boolean;
    type: "image" | "video";
  } {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (
      isImage &&
      file.size > this.defaultImageOptions.maxSizeMB * 1024 * 1024
    ) {
      return { needsCompression: true, type: "image" };
    }

    if (
      isVideo &&
      file.size > this.defaultVideoOptions.maxSizeMB * 1024 * 1024
    ) {
      return { needsCompression: true, type: "video" };
    }

    return { needsCompression: false, type: isImage ? "image" : "video" };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)}KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  /**
   * Get compression recommendations for a file
   */
  static getCompressionInfo(file: File): {
    needsCompression: boolean;
    needsServerCompression: boolean;
    currentSize: string;
    targetSize: string;
    type: "image" | "video" | "other";
    recommendations: string[];
  } {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    const currentSize = this.formatFileSize(file.size);
    const compressionCheck = this.needsCompression(file);

    let targetSize = "";
    let recommendations: string[] = [];

    if (isImage) {
      targetSize = `${this.defaultImageOptions.maxSizeMB}MB`;
      if (compressionCheck.needsCompression) {
        recommendations = [
          "Image will be automatically compressed",
          "For best quality, compress before uploading",
        ];
      }
    } else if (isVideo) {
      targetSize = `${this.defaultVideoOptions.maxSizeMB}MB`;
      if (compressionCheck.needsCompression) {
        recommendations = [
          "Videos over 20MB will be compressed on our server",
          "This may take a few minutes",
          "Original quality may be reduced for faster delivery",
        ];
      } else {
        recommendations = [
          "Video is within size limits",
          "Will be delivered at original quality",
        ];
      }
    }

    return {
      needsCompression: compressionCheck.needsCompression,
      needsServerCompression:
        compressionCheck.needsCompression && compressionCheck.type === "video",
      currentSize,
      targetSize,
      type: compressionCheck.type,
      recommendations,
    };
  }

  /**
   * Get video compression tips for users
   */
  static getVideoCompressionTips(): string[] {
    return [
      "Use MP4 format with H.264 codec for best compatibility",
      "Keep videos under 30 seconds for social media",
      "Resolution: 720p or 1080p is ideal",
      "Frame rate: 24-30 fps",
      "Bitrate: 2-5 Mbps for good quality",
      "Use free tools like HandBrake or online compressors",
    ];
  }
}
