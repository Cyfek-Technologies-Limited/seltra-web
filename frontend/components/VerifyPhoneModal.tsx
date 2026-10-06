import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export function VerifyPhoneModal({ open, onClose, phone }: any) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneValue, setPhoneValue] = useState(phone || "");
  const [otp, setOtp] = useState<string[]>(Array(5).fill(""));
  const [loading, setLoading] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setStep("phone");
      setOtp(Array(5).fill(""));
      setPhoneValue(phone || "");
    }
  }, [open, phone]);

  const headers = () => {
    const h: HeadersInit = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    };
    const token = localStorage.getItem("auth-token");
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  async function startVerification() {
    if (!phoneValue) {
      return toast({
        title: "Enter a valid phone number",
        variant: "destructive",
      });
    }

    setLoading(true);
    const res = await fetch(`${BASE_URL}/verify-phone/start`, {
      method: "POST",
      headers: headers(),
      credentials: "include",
      body: JSON.stringify({ phone: phoneValue }),
    });
    setLoading(false);

    if (!res.ok) {
      return toast({
        title: "Failed to send code. Please try again",
        variant: "destructive",
      });
    }

    setOtp(Array(5).fill(""));
    setStep("otp");
  }

  async function confirmOtp() {
    const code = otp.join("");
    if (code.length < 5) return;

    setLoading(true);
    const res = await fetch(`${BASE_URL}/verify-phone/confirm`, {
      method: "POST",
      headers: headers(),
      credentials: "include",
      body: JSON.stringify({ code }),
    });
    setLoading(false);

    if (!res.ok) {
      return toast({
        title: "Invalid code",
        variant: "destructive",
      });
    }

    toast({ title: "Phone verified 🎉" });
    onClose();
    const response = await res.json();
    const user = response.data;
    console.log("user", user);
    if (user?.roles.includes("PUBLISHER")) {
      router.push("/dashboard/publisher");
    } else if (user?.roles.includes("ADVERTISER")) {
      router.push("/dashboard/advertiser");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Phone Number</DialogTitle>
        </DialogHeader>

        {step === "phone" && (
          <>
            <Input
              placeholder="+2348012345678"
              value={phoneValue}
              onChange={(e) => setPhoneValue(e.target.value)}
            />

            <Button
              className="w-full mt-4"
              onClick={startVerification}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Code"}
            </Button>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="text-sm text-muted-foreground text-center">
              Code sent to <strong>{phoneValue}</strong>
            </p>

            <div className="flex gap-2 justify-center mt-3">
              {otp.map((val, i) => (
                <Input
                  key={i}
                  maxLength={1}
                  className="w-12 text-center text-xl"
                  value={val}
                  onChange={(e) => {
                    const copy = [...otp];
                    copy[i] = e.target.value.replace(/\D/, "");
                    setOtp(copy);
                  }}
                />
              ))}
            </div>

            <Button
              className="w-full mt-4"
              onClick={confirmOtp}
              disabled={otp.join("").length < 5 || loading}
            >
              {loading ? "Verifying..." : "Confirm"}
            </Button>

            <div className="flex justify-between mt-3 text-sm">
              <button
                className="underline"
                onClick={() => {
                  setStep("phone");
                  setOtp(Array(5).fill(""));
                }}
              >
                Edit phone number
              </button>

              <button
                className="underline"
                onClick={startVerification}
                disabled={loading}
              >
                Resend code
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
