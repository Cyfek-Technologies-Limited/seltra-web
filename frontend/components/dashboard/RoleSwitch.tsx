// components/dashboard/RoleSwitch.tsx - UPDATED FOR ADMIN WITH ALL ROLES
"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoleManager } from "@/hooks/useRoleManager";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Target, SwitchCamera, Shield } from "lucide-react";

export function RoleSwitch() {
  const { user } = useAuth();
  const { addRole, switchDashboard, isLoading, currentRole } = useRoleManager();
  const { refreshUser } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [targetRole, setTargetRole] = useState<"PUBLISHER" | "ADVERTISER">(
    "PUBLISHER"
  );

  const hasMultipleRoles = (user?.roles?.length || 0) > 1;
  const isPublisher = user?.isPublisher;
  const isAdvertiser = user?.roles.includes("advertiser");
  //   console.log("user", user);
  const isAdmin = user?.isAdmin;

  const handleBecomePublisher = () => {
    setTargetRole("PUBLISHER");
    setShowDialog(true);
  };

  const handleBecomeAdvertiser = () => {
    setTargetRole("ADVERTISER");
    setShowDialog(true);
  };

  const handleSwitchToPublisher = () => {
    switchDashboard("PUBLISHER");
  };

  const handleSwitchToAdvertiser = () => {
    switchDashboard("ADVERTISER");
  };

  const handleSwitchToAdmin = () => {
    switchDashboard("ADMIN");
  };

  const handleConfirmRole = async () => {
    const success = await addRole(targetRole);

    if (success) {
      setShowDialog(false);
      await refreshUser();
      setTimeout(() => switchDashboard(targetRole), 500);
    }
  };

  // Don't show anything if user doesn't exist
  if (!user) return null;

  // Get display name for current role
  const getCurrentRoleDisplayName = () => {
    switch (currentRole) {
      case "ADMIN":
        return "Admin";
      case "ADVERTISER":
        return "Advertiser";
      case "PUBLISHER":
        return "Publisher";
      default:
        return "Dashboard";
    }
  };

  // Check which dashboards are available for switching
  const availableDashboards = [
    {
      role: "ADMIN" as const,
      available: isAdmin,
      current: currentRole === "ADMIN",
      icon: Shield,
      color: "text-purple-400",
      name: "Admin Dashboard",
      description: "System management",
    },
    {
      role: "PUBLISHER" as const,
      available: isPublisher,
      current: currentRole === "PUBLISHER",
      icon: Users,
      color: "text-green-400",
      name: "Publisher Dashboard",
      description: "Earn by sharing ads",
    },
    {
      role: "ADVERTISER" as const,
      available: isAdvertiser,
      current: currentRole === "ADVERTISER",
      icon: Target,
      color: "text-blue-400",
      name: "Advertiser Dashboard",
      description: "Create campaigns",
    },
  ];

  // Filter out current dashboard and unavailable ones
  const switchableDashboards = availableDashboards.filter(
    (dashboard) => dashboard.available && !dashboard.current
  );

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Show switch dropdown for users with multiple roles */}
        {(hasMultipleRoles || isAdmin) && (
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <SwitchCamera className="w-4 h-4 text-black" />
              <span className="hidden lg:inline text-black">
                {getCurrentRoleDisplayName()}
              </span>
            </Button>

            {switchableDashboards.length > 0 && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-[#121212] border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {switchableDashboards.map((dashboard) => {
                  const IconComponent = dashboard.icon;
                  const handleSwitch = () => {
                    switch (dashboard.role) {
                      case "ADMIN":
                        handleSwitchToAdmin();
                        break;
                      case "PUBLISHER":
                        handleSwitchToPublisher();
                        break;
                      case "ADVERTISER":
                        handleSwitchToAdvertiser();
                        break;
                    }
                  };

                  return (
                    <button
                      key={dashboard.role}
                      onClick={handleSwitch}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-white/80 text-sm transition border-b border-white/10 last:border-b-0"
                    >
                      <IconComponent className={`w-4 h-4 ${dashboard.color}`} />
                      <div className="flex flex-col items-start">
                        <span>{dashboard.name}</span>
                        <span className="text-xs text-white/50">
                          {dashboard.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Show "Become" buttons for users with single role (non-admin) */}
        {!hasMultipleRoles && !isAdmin && (
          <>
            {!isPublisher && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBecomePublisher}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Users className="w-4 h-4 text-black" />
                <span className="hidden lg:inline text-black">
                  {isLoading ? "Adding..." : "Become Publisher"}
                </span>
              </Button>
            )}
            {!isAdvertiser && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBecomeAdvertiser}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Target className="w-4 h-4" />
                <span className="hidden lg:inline text-primary">
                  {isLoading ? "Adding..." : "Become Advertiser"}
                </span>
              </Button>
            )}
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Become a {targetRole.toLowerCase()}?</DialogTitle>
            <DialogDescription className="text-white/70">
              {targetRole === "PUBLISHER"
                ? "You'll be able to earn money by sharing ads on your social media. Share your referral code to earn even more!"
                : "You'll be able to create and run advertising campaigns to reach real users across social media platforms."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRole}
              disabled={isLoading}
              className="bg-accent hover:bg-accent/80"
            >
              {isLoading ? "Adding..." : `Yes, Become ${targetRole}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
