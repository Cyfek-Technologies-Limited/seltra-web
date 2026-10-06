"use client"

import { useState } from "react"
import type { Proof, PublisherCampaign } from "@/lib/mock-data"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ProofDetailsModal } from "@/components/proof-details-modal"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Eye, ExternalLink, MessageSquare, Clock } from "lucide-react"

interface ProofReviewCardProps {
  proof: Proof & { publisherCampaign?: PublisherCampaign }
}

export function ProofReviewCard({ proof }: ProofReviewCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [adminNotes, setAdminNotes] = useState(proof.admin_notes || "")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const { publisherCampaign } = proof

  const handleApprove = async () => {
    setIsProcessing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Proof Approved",
      description: "The proof has been approved and the publisher has been notified.",
    })

    setIsProcessing(false)
  }

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide feedback notes when rejecting a proof.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Proof Rejected",
      description: "The proof has been rejected and the publisher has been notified with your feedback.",
    })

    setIsProcessing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!publisherCampaign) {
    return null
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {publisherCampaign.campaign.category}
              </Badge>
              <Badge className={`text-xs ${getStatusColor(proof.status)}`}>{proof.status}</Badge>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Submitted {formatDate(proof.submitted_at)}
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-balance mb-1">{publisherCampaign.campaign.title}</h3>
              <p className="text-sm text-muted-foreground font-medium">{publisherCampaign.campaign.brand}</p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <img
                src={proof.proof_url || "/placeholder.svg"}
                alt="Proof screenshot"
                className="w-16 h-16 rounded-lg object-cover border"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Proof Details Preview */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Post Link</p>
                <a
                  href={proof.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                >
                  {proof.link}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Caption</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{proof.caption}</p>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          {proof.status === "pending" && (
            <div className="space-y-2">
              <Label htmlFor={`notes-${proof.id}`} className="text-sm font-medium">
                Admin Notes (Optional)
              </Label>
              <Textarea
                id={`notes-${proof.id}`}
                placeholder="Add feedback or notes for the publisher..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Existing Admin Notes */}
          {proof.admin_notes && proof.status !== "pending" && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Admin Notes</p>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">{proof.admin_notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowDetails(true)} className="flex-1 bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>

            {proof.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : "Reject"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <ProofDetailsModal
        proof={proof}
        open={showDetails}
        onOpenChange={setShowDetails}
        onApprove={proof.status === "pending" ? handleApprove : undefined}
        onReject={proof.status === "pending" ? handleReject : undefined}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        isProcessing={isProcessing}
      />
    </>
  )
}
