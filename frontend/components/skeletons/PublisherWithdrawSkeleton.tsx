"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";

export function PublisherWithdrawSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-4 w-60" />
      </div>

      <div className="lg:flex gap-8">
        {/* Left Column */}
        <div className="flex-[0.7] space-y-6">
          {/* Account Balance Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-52" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <Skeleton className="h-8 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
                <div className="p-4 border rounded-lg">
                  <Skeleton className="h-8 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              </div>

              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>

          {/* Withdrawal Form Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-52 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Amount Input */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-40" />
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="grid grid-cols-4 gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Bank Info */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>

              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex-[0.3] space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
