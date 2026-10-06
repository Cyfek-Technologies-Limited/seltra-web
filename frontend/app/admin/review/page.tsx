"use client"

import { useState } from "react"
import { mockProofs, mockPublisherCampaigns } from "@/lib/mock-data"
import { ProofReviewCard } from "@/components/proof-review-card"
import { AdminStats } from "@/components/admin-stats"
import { ProofStatusFilter } from "@/components/proof-status-filter"
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function AdminReviewPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Get proofs with their associated campaign data
  const proofsWithCampaigns = mockProofs.map((proof) => {
    const publisherCampaign = mockPublisherCampaigns.find((pc) => pc.id === proof.publisher_campaign_id)
    return {
      ...proof,
      publisherCampaign,
    }
  })

  const filteredProofs = proofsWithCampaigns.filter((proof) => {
    if (statusFilter === "all") return true
    return proof.status === statusFilter
  })

  const stats = {
    total: mockProofs.length,
    pending: mockProofs.filter((p) => p.status === "pending").length,
    approved: mockProofs.filter((p) => p.status === "approved").length,
    rejected: mockProofs.filter((p) => p.status === "rejected").length,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          Admin Review Center
        </h1>
        <p className="text-muted-foreground">Review and approve publisher proof submissions for campaign completion.</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AdminStats
          title="Total Submissions"
          value={stats.total}
          icon={AlertTriangle}
          description="All proof submissions"
        />
        <AdminStats
          title="Pending Review"
          value={stats.pending}
          icon={Clock}
          description="Awaiting approval"
          variant="pending"
        />
        <AdminStats
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          description="Successfully approved"
          variant="approved"
        />
        <AdminStats
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          description="Rejected submissions"
          variant="rejected"
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ProofStatusFilter selectedStatus={statusFilter} onStatusChange={setStatusFilter} stats={stats} />
      </div>

      {/* Proof Review List */}
      <div className="space-y-6">
        {filteredProofs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Shield className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No proof submissions found</h3>
            <p className="text-muted-foreground">
              {statusFilter === "all"
                ? "No proof submissions have been made yet."
                : `No proof submissions with status "${statusFilter}" found.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProofs.map((proof) => (
              <ProofReviewCard key={proof.id} proof={proof} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
