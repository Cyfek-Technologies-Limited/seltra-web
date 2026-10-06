// app/payment/video-generation/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, CreditCard, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function VideoGenerationPayment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const productName = searchParams.get("productName") || "";
  const productDescription = searchParams.get("productDescription") || "";
  const category = searchParams.get("category") || "";
  const platform = searchParams.get("platform") || "";
  const price = parseInt(searchParams.get("price") || "15000");

  //   useEffect(() => {
  //     if (!productName || !productDescription) {
  //       toast({
  //         title: "Invalid request",
  //         description: "Please complete campaign details first",
  //         variant: "destructive",
  //       });
  //       router.back();
  //     }
  //   }, [productName, productDescription, router]);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Integrate with your payment provider (Paystack/Flutterwave)
      // This is a simplified example
      const paymentResponse = await fetch("/api/payments/video-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          productDescription,
          category,
          platform,
          amount: price,
          type: "video-generation",
        }),
      });

      if (paymentResponse.ok) {
        const { paymentUrl } = await paymentResponse.json();
        // Redirect to payment gateway
        window.location.href = paymentUrl;
      } else {
        throw new Error("Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaign
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-6 h-6" />
            AI Video Generation
          </CardTitle>
          <CardDescription>
            Generate professional video ads for your campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="font-medium">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Product:</span>
                <span className="font-medium">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform:</span>
                <Badge variant="outline">{platform}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Service:</span>
                <span>AI Video Generation</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>₦{price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Features Included */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">What's Included:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 15-second professional video ad</li>
              <li>• Optimized for {platform} platform</li>
              <li>• Text overlays and animations</li>
              <li>• Background music and effects</li>
              <li>• High-quality 1080p resolution</li>
              <li>• Downloadable MP4 file</li>
              <li>• Reusable for multiple campaigns</li>
            </ul>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {isProcessing ? "Processing..." : `Pay ₦${price.toLocaleString()}`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You'll be redirected to a secure payment page
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
