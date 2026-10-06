import React, { useEffect, useState } from "react";
import { TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AlertCircle, CheckCircle, Clock, Eye, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface PublisherEarning {
  id: string;
  publisher: {
    user: {
      email: string;
      username: string | null;
    };
    verified: boolean;
  };
  views: number;
  amount: number;
  status: string;
  claimedAt: string;
  approvedAt: string | null;
  proofImages: string[];
  proofUrls: string[];
}

interface CampaignAnalytics {
  totalPublishers: number;
  totalViews: number;
  totalSpent: number;
  completionRate: number;
  averageViewsPerPublisher: number;
  publishersByStatus: {
    pending: number;
    approved: number;
    paid: number;
    rejected: number;
  };
}

const PublishersTab = ({ campaignId }) => {
  const [publishers, setPublishers] = useState<PublisherEarning[]>([]);
  const [activePublisher, setActivePublisher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const { user } = useAuth();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  useEffect(() => {
    loadCampaignDetails();
  }, [user, campaignId]);

  const loadCampaignDetails = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // 🔥 IPHONE FIX: Add Authorization header from localStorage if available
      const localStorageToken = localStorage.getItem("auth-token");
      if (localStorageToken) {
        console.log("📱 Using localStorage token for iPhone");
        headers["Authorization"] = `Bearer ${localStorageToken}`;
      }

      const response = await fetch(
        `${BASE_URL}/publisher/campaigns/${campaignId}`, // Note: Confirm if path should be /campaigns/${campaignId} instead—see note below
        {
          method: "GET",
          headers,
          credentials: "include", // Keep for cookie fallback
        }
      );
      console.log("response", response);

      if (response.ok) {
        const data = await response.json();
        setPublishers(data.data.publishers);
        console.log("publishers", data);
        setAnalytics(data.data.analytics);
        setIsLoading(false);
      } else {
        toast({
          title: "Task Failed",
          description: "Failed to load campaign details",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to load campaign details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load campaign details",
        variant: "destructive",
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getClaimStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, label: "Pending", icon: Clock },
      APPROVED: {
        variant: "default" as const,
        label: "Approved",
        icon: CheckCircle,
      },
      PAID: { variant: "success" as const, label: "Paid", icon: CheckCircle },
      REJECTED: {
        variant: "destructive" as const,
        label: "Rejected",
        icon: AlertCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const IconComponent = config.icon;

    return (
      <Badge variant="default" className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div>
      {" "}
      <TabsContent value="publishers">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Publishers
            </CardTitle>
            <CardDescription>
              Complete list of publishers who have claimed this campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            {publishers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Publishers Yet</p>
                <p>
                  Publishers will appear here once they start claiming your
                  campaign
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics?.publishersByStatus.pending || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pending Review
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics?.publishersByStatus.approved || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Paid</p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-4">
                  {publishers.map((publisher) => (
                    <div
                      key={publisher.id}
                      className="lg:flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="lg:flex items-center gap-4 flex-1">
                        <div className="lg:flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            {publisher.publisher.user.username ||
                              publisher.publisher.user.email}
                          </p>
                          {publisher.publisher.verified && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{publisher.views.toLocaleString()} views</span>
                          {/* <span>{formatCurrency(publisher.amount)}</span> */}
                          <span>Claimed {formatDate(publisher.claimedAt)}</span>
                        </div>
                        {publisher.proofUrls?.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {publisher.proofUrls.map((url, index) => (
                              <Button
                                key={index}
                                variant="link"
                                className="p-0 h-auto text-xs"
                                onClick={() => window.open(url, "_blank")}
                              >
                                View Proof {index + 1}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {getClaimStatusBadge(publisher.status)}
                        {publisher.proofImages?.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActivePublisher(publisher)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Proofs
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
};

export default PublishersTab;
