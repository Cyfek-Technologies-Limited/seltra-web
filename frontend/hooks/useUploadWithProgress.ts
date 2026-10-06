// hooks/useUploadWithProgress.ts
import { useState, useCallback } from "react";
import { toast } from "./use-toast";

interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
  isComplete: boolean;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
}

interface UseUploadWithProgressReturn {
  uploadProgress: UploadProgress;
  isUploading: boolean;
  uploadError: string | null;
  uploadFile: (file: File) => Promise<string | null>;
  resetUpload: () => void;
  cancelUpload: () => void;
}

export function useUploadWithProgress(): UseUploadWithProgressReturn {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percentage: 0,
    loaded: 0,
    total: 0,
    isComplete: false,
    speed: 0,
    timeRemaining: 0,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentXHR, setCurrentXHR] = useState<XMLHttpRequest | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress({
        percentage: 0,
        loaded: 0,
        total: file.size,
        isComplete: false,
        speed: 0,
        timeRemaining: 0,
      });

      console.log("🟡 [useUploadWithProgress] Uploading file...", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      const formData = new FormData();
      formData.append("file", file);

      // Add auth token
      const token = localStorage.getItem("auth-token");

      let lastLoaded = 0;
      let lastTime = Date.now();

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        setCurrentXHR(xhr);

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const currentTime = Date.now();
            const timeDiff = (currentTime - lastTime) / 1000; // in seconds
            const loadedDiff = event.loaded - lastLoaded;

            // Calculate speed (bytes per second)
            const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;

            // Calculate time remaining
            const remainingBytes = event.total - event.loaded;
            const timeRemaining = speed > 0 ? remainingBytes / speed : 0;

            const percentage = Math.round((event.loaded / event.total) * 100);

            setUploadProgress({
              percentage,
              loaded: event.loaded,
              total: event.total,
              isComplete: false,
              speed,
              timeRemaining,
            });

            lastLoaded = event.loaded;
            lastTime = currentTime;

            console.log(`📊 Upload progress: ${percentage}%`, {
              speed: `${(speed / 1024 / 1024).toFixed(2)} MB/s`,
              remaining: `${Math.round(timeRemaining)}s`,
            });
          }
        });

        xhr.addEventListener("load", () => {
          setCurrentXHR(null);

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.status === "200" && response.data?.url) {
                setUploadProgress((prev) => ({
                  ...prev,
                  percentage: 100,
                  isComplete: true,
                  timeRemaining: 0,
                }));

                toast({
                  title: "Upload successful",
                  description: `File uploaded successfully (${(
                    file.size /
                    1024 /
                    1024
                  ).toFixed(1)}MB)`,
                });

                resolve(response.data.url);
              } else {
                const errorMsg = response.error || "Failed to upload file";
                setUploadError(errorMsg);
                reject(new Error(errorMsg));
              }
            } catch (parseError) {
              const errorMsg = "Failed to parse upload response";
              setUploadError(errorMsg);
              reject(new Error(errorMsg));
            }
          } else {
            const errorMsg = `Upload failed: ${xhr.status} ${xhr.statusText}`;
            setUploadError(errorMsg);
            reject(new Error(errorMsg));
          }
        });

        xhr.addEventListener("error", () => {
          setCurrentXHR(null);
          const errorMsg = "Upload failed due to network error";
          setUploadError(errorMsg);
          reject(new Error(errorMsg));
        });

        xhr.addEventListener("timeout", () => {
          setCurrentXHR(null);
          const errorMsg = "Upload timed out";
          setUploadError(errorMsg);
          reject(new Error(errorMsg));
        });

        xhr.open("POST", "/api/v1/upload/creative");

        // Set headers
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        // Set timeout (5 minutes for large files)
        xhr.timeout = 5 * 60 * 1000;

        xhr.send(formData);
      });
    } catch (error: any) {
      console.error("🔴 [useUploadWithProgress] Upload error:", error);
      setUploadError(error.message);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const cancelUpload = useCallback(() => {
    if (currentXHR) {
      currentXHR.abort();
      setCurrentXHR(null);
      setIsUploading(false);
      setUploadError("Upload cancelled");
      toast({
        title: "Upload Cancelled",
        description: "File upload was cancelled",
      });
    }
  }, [currentXHR]);

  const resetUpload = useCallback(() => {
    setUploadProgress({
      percentage: 0,
      loaded: 0,
      total: 0,
      isComplete: false,
      speed: 0,
      timeRemaining: 0,
    });
    setUploadError(null);
    setIsUploading(false);
    if (currentXHR) {
      currentXHR.abort();
      setCurrentXHR(null);
    }
  }, [currentXHR]);

  return {
    uploadProgress,
    isUploading,
    uploadError,
    uploadFile,
    resetUpload,
    cancelUpload,
  };
}
