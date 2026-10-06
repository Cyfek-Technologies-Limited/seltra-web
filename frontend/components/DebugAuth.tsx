// components/DebugAuth.tsx
"use client";
import { useEffect, useState } from "react";
import { getAuthToken, isiPhoneSafari } from "@/lib/api/utils";

export default function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      isiPhoneSafari: isiPhoneSafari(),
      authToken: getAuthToken() ? "Present" : "Missing",
      localStorage:
        typeof localStorage !== "undefined" ? "Available" : "Unavailable",
      cookies: document.cookie || "No cookies",
    };
    setDebugInfo(info);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-red-500 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">🔴 AUTH DEBUG</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
}
