"use client"

import type { Proof, PublisherCampaign } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, ExternalLink, MessageSquare, Calendar, FileImage, Clock } from "lucide-react"

interface ProofDetailsModalProps {
  proof: Proof & { publisherCampaign?: PublisherCampaign }
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove?: () => void
  onReject?: () => void
  adminNotes?: string
  onAdminNotesChange?: (notes: string) => void
  isProcessing?: boolean
}

export function ProofDetailsModal({
  proof,
  open,
  onOpenChange,
  onApprove,
  onReject,
  adminNotes = "",
  onAdminNotesChange,
  isProcessing = false,
}: ProofDetailsModalProps) {
  const { publisherCampaign } = proof

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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!publisherCampaign) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge variant="secondary">{publisherCampaign.campaign.category}</Badge>
            <Badge className={`${getStatusColor(proof.status)}`}>{proof.status}</Badge>
          </div>

          <DialogTitle className="text-xl text-balance">Proof Review: {publisherCampaign.campaign.title}</DialogTitle>

          <DialogDescription className="text-base">
            Campaign by <span className="font-medium">{publisherCampaign.campaign.brand}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Proof Image */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Proof Screenshot
            </h4>
            <div className="aspect-video rounded-lg overflow-hidden bg-muted border">
              <img
                src={proof.proof_url || "/placeholder.svg"}
                alt="Proof screenshot"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Submission Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium text-sm">Post Link</p>
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
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium text-sm">Submitted</p>
                  <p className="text-sm text-muted-foreground">{formatDate(proof.submitted_at)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium text-sm">Campaign End Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(publisherCampaign.campaign.end_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Caption */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Caption Text
            </h4>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm leading-relaxed">{proof.caption}</p>
            </div>
          </div>

          {/* Campaign Requirements */}
          <div>
            <h4 className="font-medium mb-3">Campaign Requirements</h4>
            <ul className="space-y-2">
              {publisherCampaign.campaign.requirements.map((requirement, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Notes Section */}
          {proof.status === "pending" && onAdminNotesChange && (
            <div className="space-y-2">
              <Label htmlFor="admin-notes" className="text-sm font-medium">
                Admin Notes (Optional)
              </Label>
              <Textarea
                id="admin-notes"
                placeholder="Add feedback or notes for the publisher..."
                value={adminNotes}
                onChange={(e) => onAdminNotesChange(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                These notes will be sent to the publisher if you reject the proof.
              </p>
            </div>
          )}

          {/* Existing Admin Notes */}
          {proof.admin_notes && proof.status !== "pending" && (
            <div>
              <h4 className="font-medium mb-2">Admin Notes</h4>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">{proof.admin_notes}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Close
          </Button>

          {proof.status === "pending" && onApprove && onReject && (
            <>
              <Button onClick={onReject} variant="destructive" disabled={isProcessing}>
                <XCircle className="h-4 w-4 mr-2" />
                {isProcessing ? "Processing..." : "Reject"}
              </Button>
              <Button
                onClick={onApprove}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isProcessing ? "Processing..." : "Approve"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
