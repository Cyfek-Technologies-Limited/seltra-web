// app/dashboard/publisher/withdraw/page.tsx - UPDATED WITH CONSISTENT MINIMUM AND MORE LOGS
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCampaigns } from "@/hooks/useCampaigns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  DollarSign,
  Banknote,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Shield,
  Info,
} from "lucide-react";
import { Roller } from "@/components/ui/ReusableComponents";
import Link from "next/link";
import {
  getPublisherDashboard,
  initiateWithdrawal,
} from "@/lib/functions/publishers/earnings";
import { toast } from "@/hooks/use-toast";

interface WithdrawalData {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  isVerified: boolean;
}

export default function WithdrawPage() {
  const { user, userLoading } = useAuth();
  const [withdrawalData, setWithdrawalData] = useState<WithdrawalData | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<any>([]);
  const [loadWithdrawData, setLoadWithdrawData] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingWithdrawal, setPendingWithdrawal] = useState<{
    amount: number;
  } | null>(null);

  const MIN_WITHDRAWAL = 100; // Consistent minimum

  const handleWithdrawWithVerification = async () => {
    if (!withdrawalData) return;

    const withdrawAmount = parseFloat(amount);

    console.log(
      `[FRONTEND] Starting withdrawal validation for amount: ${withdrawAmount}`
    );

    // Validation - PREVENT BACKEND CALL IF INVALID
    if (!withdrawAmount || withdrawAmount <= 0) {
      console.log(`[FRONTEND] Invalid amount: ${withdrawAmount}`);
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount < MIN_WITHDRAWAL) {
      console.log(
        `[FRONTEND] Amount below minimum: ${withdrawAmount} < ${MIN_WITHDRAWAL}`
      );
      toast({
        title: "Minimum Amount Required",
        description: `Minimum withdrawal amount is ₦${MIN_WITHDRAWAL.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    // ✅ CRITICAL: Prevent backend call if insufficient balance
    if (withdrawAmount > withdrawalData.availableBalance) {
      console.log(
        `[FRONTEND] Insufficient balance: ${withdrawAmount} > ${withdrawalData.availableBalance}`
      );
      toast({
        title: "Insufficient Balance",
        description: `You cannot withdraw more than your available balance of ${formatCurrency(
          withdrawalData.availableBalance
        )}`,
        variant: "destructive",
      });
      return;
    }

    if (
      !withdrawalData.bankName ||
      !withdrawalData.accountNumber ||
      !withdrawalData.accountName
    ) {
      console.log(`[FRONTEND] Missing bank details`);
      toast({
        title: "Bank Account Required",
        description: "Please add your bank account details first",
        variant: "destructive",
      });
      return;
    }

    // Only show verification modal if all checks pass
    console.log(
      `[FRONTEND] All validations passed, showing confirmation modal`
    );
    setPendingWithdrawal({ amount: withdrawAmount });
    setShowVerificationModal(true);
  };

  const confirmWithdrawal = async () => {
    if (!pendingWithdrawal) return;

    console.log(
      `[FRONTEND] Confirming withdrawal for amount: ${pendingWithdrawal.amount}`
    );
    setIsSubmitting(true);
    try {
      const success = await initiateWithdrawal(pendingWithdrawal.amount);
      if (success) {
        console.log(`[FRONTEND] Withdrawal initiated successfully`);
        setAmount("");
        await loadWithdrawalData();
        setShowVerificationModal(false);
        setPendingWithdrawal(null);
      } else {
        console.log(`[FRONTEND] Withdrawal initiation failed`);
      }
    } catch (error) {
      console.error(`[FRONTEND] Error during withdrawal confirmation:`, error);
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user?.isPublisher) {
      loadWithdrawalData();
    }
  }, [user]);

  const loadWithdrawalData = async () => {
    console.log(`[FRONTEND] Loading withdrawal data`);
    try {
      const data = await getPublisherDashboard();
      setWithdrawalData(data.account);
      setProfileData(data);
      console.log("[FRONTEND] Withdrawal data loaded:", data);
      console.log("profile data:", data);
    } catch (error) {
      console.error("[FRONTEND] Failed to load withdrawal data:", error);
    } finally {
      setLoadWithdrawData(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) return;

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;

    setAmount(numericValue);

    // Real-time validation feedback (optional)
    const enteredAmount = parseFloat(numericValue);
    if (enteredAmount > (withdrawalData?.availableBalance || 0)) {
      console.log(
        `[FRONTEND] ⚠️ Amount exceeds available balance: ${enteredAmount} > ${withdrawalData?.availableBalance}`
      );
    }
  };

  const handleQuickAmount = (percentage: number) => {
    if (!withdrawalData) return;

    const calculatedAmount = withdrawalData.availableBalance * percentage;

    // Ensure quick amount doesn't exceed available balance
    const safeAmount = Math.min(
      calculatedAmount,
      withdrawalData.availableBalance
    );

    setAmount(safeAmount.toFixed(2));

    // Show toast if the calculated amount was capped
    if (calculatedAmount > withdrawalData.availableBalance) {
      toast({
        title: "Amount Adjusted",
        description: `Amount capped at your available balance of ${formatCurrency(
          withdrawalData.availableBalance
        )}`,
      });
    }
  };

  if (userLoading || loadWithdrawData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <Roller />
        </div>
      </div>
    );
  }

  if (!user?.isPublisher) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Publisher Access Required
          </h3>
          <p className="text-muted-foreground mb-4">
            You need to be a publisher to withdraw funds.
          </p>
          <Button asChild>
            <Link href="/campaigns">Explore Campaigns</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!loadWithdrawData && !withdrawalData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Failed to load withdrawal data
          </h3>
          <Button onClick={loadWithdrawalData}>Retry</Button>
        </div>
      </div>
    );
  }

  const hasBankAccount =
    withdrawalData?.bankName &&
    withdrawalData?.accountNumber &&
    withdrawalData?.accountName;

  // UPDATED: Consistent min check
  const canWithdraw =
    hasBankAccount &&
    withdrawalData?.availableBalance >= MIN_WITHDRAWAL &&
    (!amount || parseFloat(amount) <= (withdrawalData?.availableBalance || 0));

  return (
    <div className="container  px-4 pb-8 ">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/publisher" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Withdraw Funds
            </h1>
            <p className="text-muted-foreground">
              Transfer your earnings to your bank account securely.
            </p>
            <p className="text-red-500 text-[12px]">
              You need a minimum of ₦100 to be able to withdraw funds
            </p>

            {!profileData.profile.verified && (
              <div className="flex items-center  gap-4">
                <p className="text-red-500 ">
                  You need to verify your phone number to withdraw funds
                </p>
                <Link href={"/dashboard/publisher/profile"}>
                  <button className="text-sm bg-primary rounded-lg p-2 text-white">
                    Verify
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:flex gap-8">
        {/* Left Column - Withdrawal Form */}
        <div className="flex-[0.7] space-y-6">
          {/* Balance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Account Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(withdrawalData?.availableBalance)}
                  </p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(withdrawalData?.pendingBalance)}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>

              {withdrawalData?.availableBalance < MIN_WITHDRAWAL && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Minimum Withdrawal
                      </p>
                      <p className="text-sm text-amber-700">
                        You need at least ₦100 to make a withdrawal. Keep
                        earning to reach the minimum amount.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Withdrawal Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Withdrawal Request
              </CardTitle>
              <CardDescription>
                Enter the amount you want to withdraw to your bank account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="pl-10 text-lg font-medium"
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Available: {formatCurrency(withdrawalData?.availableBalance)}
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="space-y-2">
                <Label>Quick Amount</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(0.25)}
                    disabled={!canWithdraw || isSubmitting}
                  >
                    25%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(0.5)}
                    disabled={!canWithdraw || isSubmitting}
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(0.75)}
                    disabled={!canWithdraw || isSubmitting}
                  >
                    75%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(1)}
                    disabled={!canWithdraw || isSubmitting}
                  >
                    MAX
                  </Button>
                </div>
              </div>

              {/* Bank Account Status - UPDATED */}
              <div className="space-y-3">
                <Label>Bank Account</Label>
                {!hasBankAccount ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                          No Bank Account Added
                        </p>
                        <p className="text-sm text-red-700 mb-3">
                          You need to add your bank account details before you
                          can withdraw funds.
                        </p>
                        <Button
                          asChild
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Link href="/dashboard/publisher/profile">
                            Add Bank Account
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // REMOVED VERIFICATION CHECK - Always show as ready if bank account exists
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Account Ready for Withdrawal
                        </p>
                        <p className="text-sm text-green-700">
                          {withdrawalData?.bankName} •{" "}
                          {withdrawalData?.accountNumber}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Payments will be processed instantly via Paystack
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Submit Button */}
              <Button
                onClick={handleWithdrawWithVerification}
                disabled={
                  !canWithdraw ||
                  !amount ||
                  isSubmitting ||
                  parseFloat(amount) > (withdrawalData?.availableBalance || 0)
                }
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing via Paystack...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    Withdraw {amount ? formatCurrency(parseFloat(amount)) : ""}
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Information */}
        <div className="flex-[0.3] space-y-6">
          {/* Withdrawal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Withdrawal Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  {profileData.profile?.verified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  <div>
                    <p className="font-medium">Phone Number Must be Verified</p>
                    <Link href={"/dashboard/publisher/profile"}>
                      {!profileData.profile?.verified && (
                        <p className="text-muted-foreground underline">
                          Verify Account
                        </p>
                      )}
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Instant Processing</p>
                    <p className="text-muted-foreground">
                      Most transfers are instant
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Minimum Amount</p>
                    <p className="text-muted-foreground">
                      ₦100 minimum withdrawal
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Withdrawals */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Banknote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No recent withdrawals</p>
                <p className="text-xs">
                  Your withdrawal history will appear here
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Need Help?
                  </p>
                  <p className="text-xs text-blue-700 mb-2">
                    Contact support for withdrawal issues
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700"
                  >
                    <a href="mailto:support@Seltra.com">Contact Support</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add this modal before the closing div */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-semibold">Confirm Withdrawal</h3>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">
                You are about to withdraw{" "}
                <strong>{formatCurrency(pendingWithdrawal?.amount)}</strong>
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  ⚠️ Important
                </p>
                <p className="text-xs text-amber-700">
                  Funds will be sent to:{" "}
                  <strong>
                    {withdrawalData?.bankName} • {withdrawalData?.accountNumber}
                  </strong>
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Please ensure this is correct. Transfers cannot be reversed.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800 mb-1">
                  ✅ Verified
                </p>
                <p className="text-xs text-green-700">
                  Account Name: <strong>{withdrawalData?.accountName}</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowVerificationModal(false);
                  setPendingWithdrawal(null);
                }}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmWithdrawal}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </div>
                ) : (
                  "Confirm Withdrawal"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
