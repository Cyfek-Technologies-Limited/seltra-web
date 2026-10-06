import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Upload,
  CheckCircle2,
  Eye,
  Calendar,
  Image as ImageIcon,
  Filter,
  Search,
  ArrowUpDown,
} from "lucide-react";
import ProofUploadModal from "@/components/modals/ProofUploadModal";

interface MyCampaignsTabsProps {
  runningCampaigns: any[];
  completedCampaigns: any[];
  onUploadProof: (campaignId: string, proofData: any) => void;
}

export default function MyCampaignsTabs({
  runningCampaigns,
  completedCampaigns,
  onUploadProof,
}: MyCampaignsTabsProps) {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [timers, setTimers] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterStatus, setFilterStatus] = useState("all");

  // Timer calculation function
  const calculateTimeRemaining = (acceptedAt: string) => {
    const acceptedTime = new Date(acceptedAt).getTime();
    const now = new Date().getTime();
    const timeElapsed = now - acceptedTime;
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (timeElapsed >= twentyFourHours) {
      return "Upload Available";
    }

    const timeRemaining = twentyFourHours - timeElapsed;
    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor(
      (timeRemaining % (60 * 60 * 1000)) / (60 * 1000)
    );

    return `${hours}h ${minutes}m`;
  };

  const isUploadAvailable = (acceptedAt: string) => {
    const acceptedTime = new Date(acceptedAt).getTime();
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    return now - acceptedTime >= twentyFourHours;
  };

  // Update timers every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: { [key: string]: string } = {};
      runningCampaigns.forEach((campaign) => {
        if (campaign.acceptedAt) {
          newTimers[campaign._id] = calculateTimeRemaining(campaign.acceptedAt);
        }
      });
      setTimers(newTimers);
    }, 60000); // Update every minute

    // Initial calculation
    const initialTimers: { [key: string]: string } = {};
    runningCampaigns.forEach((campaign) => {
      if (campaign.acceptedAt) {
        initialTimers[campaign._id] = calculateTimeRemaining(
          campaign.acceptedAt
        );
      }
    });
    setTimers(initialTimers);

    return () => clearInterval(interval);
  }, [runningCampaigns]);

  const handleUploadProofClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsProofModalOpen(true);
  };

  // Filter and sort functions
  const filterAndSortCampaigns = (campaigns: any[], isCompleted = false) => {
    let filtered = campaigns?.filter((campaign) =>
      campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort campaigns
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.acceptedAt || b.completedAt).getTime() -
            new Date(a.acceptedAt || a.completedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.acceptedAt || a.completedAt).getTime() -
            new Date(b.acceptedAt || b.completedAt).getTime()
          );
        case "name":
          return a.campaignName.localeCompare(b.campaignName);
        case "price":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const RunningCampaignCard = ({ campaign }: { campaign: any }) => {
    const timeRemaining = timers[campaign._id] || "Calculating...";
    const uploadAvailable =
      campaign.acceptedAt && isUploadAvailable(campaign.acceptedAt);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Flyer Thumbnail */}
            <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={campaign.flyerUrl}
                alt={campaign.campaignName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Campaign Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold line-clamp-1">
                    {campaign.campaignName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Earn: ₦{campaign.price?.toLocaleString()} per 1000 views
                  </p>
                </div>
                <Badge className="bg-success text-success-foreground">
                  Running
                </Badge>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {uploadAvailable ? (
                    <span className="text-success font-medium">
                      Upload proof available!
                    </span>
                  ) : (
                    <span>Upload available in {timeRemaining}</span>
                  )}
                </span>
              </div>

              {/* Action Button */}
              <Button
                size="sm"
                onClick={() => handleUploadProofClick(campaign)}
                disabled={!uploadAvailable}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadAvailable ? "Upload Proof" : "Upload Locked"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CompletedCampaignCard = ({ campaign }: { campaign: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Flyer Thumbnail */}
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={campaign.flyerUrl}
              alt={campaign.campaignName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Campaign Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold line-clamp-1">
                  {campaign?.campaignName}
                </h4>
                <p className="text-sm text-muted-foreground">
                  ₦{campaign.price?.toLocaleString()} per 1000 views
                </p>
              </div>
              <Badge className="bg-muted text-muted-foreground">
                Completed
              </Badge>
            </div>

            {/* Completion Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>
                  {campaign.reportedViews?.toLocaleString() || 0} views
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(campaign.completedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Proof Thumbnail */}
            {campaign.proofScreenshot && (
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Proof submitted
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              My Campaigns
            </CardTitle>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price">Highest Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="running" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="running" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Running ({runningCampaigns?.length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Completed ({completedCampaigns?.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="running" className="mt-4">
              <div className="space-y-4">
                {filterAndSortCampaigns(runningCampaigns).length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "No campaigns match your search"
                        : "No running campaigns yet"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm
                        ? "Try a different search term"
                        : "Accept campaigns from the Explore section to get started"}
                    </p>
                  </div>
                ) : (
                  filterAndSortCampaigns(runningCampaigns).map((campaign) => (
                    <RunningCampaignCard
                      key={campaign._id}
                      campaign={campaign}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <div className="space-y-4">
                {filterAndSortCampaigns(completedCampaigns, true).length ===
                0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "No campaigns match your search"
                        : "No completed campaigns yet"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm
                        ? "Try a different search term"
                        : "Complete running campaigns to see them here"}
                    </p>
                  </div>
                ) : (
                  filterAndSortCampaigns(completedCampaigns, true).map(
                    (campaign) => (
                      <CompletedCampaignCard
                        key={campaign._id}
                        campaign={campaign}
                      />
                    )
                  )
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Proof Upload Modal */}
      <ProofUploadModal
        isOpen={isProofModalOpen}
        onClose={() => {
          setIsProofModalOpen(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        onSubmitProof={onUploadProof}
      />
    </>
  );
}
