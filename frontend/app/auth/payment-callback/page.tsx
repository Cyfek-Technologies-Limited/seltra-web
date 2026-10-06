// app/dashboard/campaigns/payment-callback/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCampaigns } from "@/hooks/useCampaigns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyPaymentAndCreateCampaign, isLoading } = useCampaigns();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [paymentStatus, setPaymentStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [campaign, setCampaign] = useState<any>(null);

  // PROTECTION: Refs to track execution state
  const hasVerifiedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const processedReferenceRef = useRef<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");
    const status = searchParams.get("status");

    const paymentReference = reference || trxref;

    // PROTECTION: Check if payment was cancelled
    if (status === "cancelled") {
      setPaymentStatus("error");
      setErrorMessage("Payment was cancelled by user");
      return;
    }

    // PROTECTION: Prevent duplicate execution
    if (!paymentReference) {
      setPaymentStatus("error");
      setErrorMessage("No payment reference found");
      return;
    }

    if (hasVerifiedRef.current || isProcessingRef.current) {
      console.log("🛡️ Payment verification already in progress");
      return;
    }

    if (processedReferenceRef.current === paymentReference) {
      console.log("🛡️ Payment reference already processed:", paymentReference);
      router.push("/dashboard/advertiser/campaigns/my-campaigns");
      return;
    }

    handlePaymentVerification(paymentReference);
  }, [searchParams, router]);

  const handlePaymentVerification = async (reference: string) => {
    // Set processing flags immediately
    isProcessingRef.current = true;
    hasVerifiedRef.current = true;
    processedReferenceRef.current = reference;

    try {
      console.log(
        "🟡 [PaymentCallback] Verifying payment and creating campaign...",
        reference
      );

      const verifiedCampaign = await verifyPaymentAndCreateCampaign(reference);

      if (verifiedCampaign) {
        setPaymentStatus("success");
        setCampaign(verifiedCampaign);

        // Store in session storage to prevent duplicates on refresh
        sessionStorage.setItem(`processed_${reference}`, "true");
        sessionStorage.setItem(
          `campaign_${reference}`,
          JSON.stringify(verifiedCampaign)
        );
      } else {
        setPaymentStatus("error");
        setErrorMessage("Payment verification and campaign creation failed");
        // Remove processing flag on failure to allow retry
        processedReferenceRef.current = null;
      }
    } catch (error: any) {
      console.error("🔴 [PaymentCallback] Payment verification error:", error);
      setPaymentStatus("error");
      setErrorMessage(error.message || "An unexpected error occurred");
      // Remove processing flag on error to allow retry
      processedReferenceRef.current = null;
    } finally {
      isProcessingRef.current = false;
    }
  };

  // Check session storage on component mount for existing processed payments
  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");
    if (reference && sessionStorage.getItem(`processed_${reference}`)) {
      const storedCampaign = sessionStorage.getItem(`campaign_${reference}`);
      if (storedCampaign) {
        setPaymentStatus("success");
        setCampaign(JSON.parse(storedCampaign));
        hasVerifiedRef.current = true;
      }
    }
  }, [searchParams]);

  if (paymentStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-lg font-medium">Verifying your payment...</p>
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we confirm your payment and activate your
                campaign. Do not refresh this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {paymentStatus === "success" ? (
            <div className="flex flex-col items-center space-y-4 text-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription className="text-lg">
                Your campaign "{campaign?.title}" is now active and running.
              </CardDescription>
              <div className="space-y-2 w-full">
                <Button
                  onClick={() => {
                    // Clear processing flags before navigation
                    processedReferenceRef.current = null;
                    router.push("/dashboard/advertiser/campaigns/my-campaigns");
                  }}
                  className="w-full"
                >
                  View Campaigns
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    processedReferenceRef.current = null;
                    router.push("/dashboard/advertiser");
                  }}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 text-center">
              <XCircle className="w-16 h-16 text-red-500" />
              <CardTitle className="text-2xl">Payment Failed</CardTitle>
              <CardDescription className="text-lg">
                {errorMessage ||
                  "We couldn't verify your payment. Please try again or contact support."}
              </CardDescription>
              <div className="space-y-2 w-full">
                <Button
                  onClick={() => {
                    processedReferenceRef.current = null;
                    router.push("/dashboard/advertiser/campaigns/create");
                  }}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    processedReferenceRef.current = null;
                    router.push("/dashboard/advertiser");
                  }}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
