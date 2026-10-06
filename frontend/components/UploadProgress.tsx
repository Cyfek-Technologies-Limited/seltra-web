// components/UploadProgress.tsx
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, Upload, File, Clock, Zap, Badge } from "lucide-react";

interface UploadProgressProps {
  progress: {
    percentage: number;
    loaded: number;
    total: number;
    speed: number;
    timeRemaining: number;
  };
  isUploading: boolean;
  fileName: string;
  fileType: "image" | "video";
  onCancel?: () => void;
}

export function UploadProgress({
  progress,
  isUploading,
  fileName,
  fileType,
  onCancel,
}: UploadProgressProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="w-full p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <File className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium truncate max-w-[200px]">
            {fileName}
          </span>
          <Badge className="text-xs">{fileType.toUpperCase()}</Badge>
        </div>
        {isUploading && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            {isUploading ? "Uploading..." : "Processing..."}
          </span>
          <span>{progress.percentage}%</span>
        </div>
        <Progress value={progress.percentage} className="h-2" />

        {/* Stats */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>
                {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
              </span>
            </div>

            {progress.speed > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{formatBytes(progress.speed)}/s</span>
              </div>
            )}

            {progress.timeRemaining > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(progress.timeRemaining)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Message */}
      {progress.percentage === 100 && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-center">
          <p className="text-sm text-green-800 font-medium">Upload Complete!</p>
        </div>
      )}
    </div>
  );
}
