"use client"

import type React from "react"

import { useState } from "react"
import type { PublisherCampaign } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileUploadZone } from "@/components/file-upload-zone"
import { useToast } from "@/hooks/use-toast"
import { Upload, LinkIcon, MessageSquare, Clock, AlertTriangle } from "lucide-react"

interface ProofUploadModalProps {
  publisherCampaign: PublisherCampaign
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProofUploadModal({ publisherCampaign, open, onOpenChange }: ProofUploadModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [postLink, setPostLink] = useState("")
  const [caption, setCaption] = useState(publisherCampaign.campaign.text_template)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const { campaign, time_remaining_hours } = publisherCampaign

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      toast({
        title: "Upload Required",
        description: "Please upload at least one screenshot or image as proof.",
        variant: "destructive",
      })
      return
    }

    if (!postLink.trim()) {
      toast({
        title: "Link Required",
        description: "Please provide a link to your published post.",
        variant: "destructive",
      })
      return
    }

    if (!caption.trim()) {
      toast({
        title: "Caption Required",
        description: "Please provide the caption text you used for the post.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Proof Submitted Successfully!",
      description: "Your proof has been submitted for review. You'll be notified once it's approved.",
    })

    // Reset form
    setFiles([])
    setPostLink("")
    setCaption(campaign.text_template)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const isUrgent = time_remaining_hours <= 6

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Proof of Publication
          </DialogTitle>
          <DialogDescription>Submit proof that you've published the campaign content as required.</DialogDescription>
        </DialogHeader>

        {/* Campaign Info */}
        <Card
          className={`mb-4 ${isUrgent ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50" : ""}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-sm">{campaign.title}</h4>
                <p className="text-xs text-muted-foreground">{campaign.brand}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {campaign.category}
              </Badge>
            </div>

            {time_remaining_hours > 0 && (
              <div className={`flex items-center gap-2 text-xs ${isUrgent ? "text-red-600" : "text-muted-foreground"}`}>
                {isUrgent ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                <span>
                  {time_remaining_hours < 24
                    ? `${time_remaining_hours} hours remaining`
                    : `${Math.floor(time_remaining_hours / 24)} days remaining`}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="proof-files" className="text-sm font-medium">
              Screenshots/Images *
            </Label>
            <FileUploadZone files={files} onFilesChange={setFiles} />
            <p className="text-xs text-muted-foreground">
              Upload screenshots of your published post. Accepted formats: JPG, PNG, PDF (max 5MB each)
            </p>
          </div>

          {/* Post Link */}
          <div className="space-y-2">
            <Label htmlFor="post-link" className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Post Link *
            </Label>
            <Input
              id="post-link"
              type="url"
              placeholder="https://instagram.com/p/your-post-id"
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Direct link to your published post</p>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption" className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Caption Text *
            </Label>
            <Textarea
              id="caption"
              placeholder="Enter the exact caption you used for the post..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">Copy and paste the exact caption you used for the post</p>
          </div>

          {/* Requirements Reminder */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h5 className="font-medium text-sm mb-2">Campaign Requirements</h5>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {campaign.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    {requirement}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Proof"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
