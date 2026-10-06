// lib/memory-monitor.ts
export class MemoryMonitor {
  static checkMemoryUsage() {
    const used = process.memoryUsage();
    const usageMB = {
      rss: Math.round(used.rss / 1024 / 1024),
      heapTotal: Math.round(used.heapTotal / 1024 / 1024),
      heapUsed: Math.round(used.heapUsed / 1024 / 1024),
    };

    // If memory usage is too high, reject new uploads
    if (usageMB.heapUsed > 500) {
      // 500MB threshold
      throw new Error("Server resources temporarily unavailable");
    }

    return usageMB;
  }
}
