"use client";
import Image from "next/image";
import React from "react";
import Icon from "./Icon";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { CardContent, CardDescription, CardTitle } from "./card";
import { Book, Target, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./button";
import Link from "next/link";

export const Logo = () => {
  const pathname = usePathname();

  return (
    <Image
      src={pathname.includes("/auth") ? "/logo/7.png" : "/logo/40.png"}
      className=" h-[100px] object-cover mx-auto"
      alt="Seltra logo"
      width={pathname.includes("/auth") ? 100 : 160}
      height={pathname.includes("/auth") ? 10 : 50}
    />
  );
};

export function UserAvatar({ username }: { username?: string }) {
  const firstLetter = username ? username.charAt(0).toUpperCase() : "U";

  // Randomized but consistent color based on username
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-indigo-500",
  ];
  const color =
    username && username.length
      ? colors[username.charCodeAt(0) % colors.length]
      : "bg-gray-400";

  return (
    <div
      className={`flex text-black items-center justify-center rounded-full ${color} font-semibold`}
      style={{
        width: "34px",
        height: "34px",
        fontSize: "16px",
        color: "black",
      }}
    >
      {firstLetter}
    </div>
  );
}

export const Roller = () => {
  return (
    <div className="flex items-center justify-center h-[20vh] space-x-2">
      <span className="w-3 h-3 bg-primary rounded-full animate-bounce"></span>
      <span className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </div>
  );
};

export const Spinner = () => {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-spin shadow-lg shadow-blue-400/50"></div>
    </div>
  );
};

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border-[0.3px] border-black/20 shadow-lg  text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const ImageCmp = ({ w, h, src, style }: any) => {
  return (
    <Image
      width={w || 130}
      height={h || 130}
      src={src || "/signUp/checkbox.svg"}
      alt="img"
      className={style}
    />
  );
};

export const StatsCard = ({ item }) => {
  return (
    <div className=" bg-sidebar lg:bg-primary rounded-[13px] border-[1px]  border-black/10  p-[18px] items-start lg:w-[205px] 2xl:w-[218px] h-[125px] ">
      {/* text */}
      <div className="flex justify-between">
        <div>
          <p className="font-innter font-[500] text-[10px] text-primary lg:text-white">
            {item.title || "..."}
          </p>
          <p
            className={`${
              item.value === undefined ? "animate-bounce" : ""
            } text-accent flex lg:my-[5px] 2xl:my-[13px] lg:text-[20px] 2xl:text-[24px] font-inter font-[700]`}
          >
            {item.value || "..."}
          </p>
        </div>

        <Icon src={item.icon} h={35} w={35} />
      </div>
      <div className="flex justify-between mt-3 items-center">
        <p className="font-inter text-[12px] text-primary lg:text-white">
          {item.subtitle || "..."}
        </p>
        {item.route && (
          <Link href={item?.route} className="text-white">
            {"->"}
          </Link>
        )}
      </div>
    </div>
  );
};

export const EmptyState = ({ title, text }) => {
  const { user, userLoading } = useAuth();
  const router = useRouter();

  return (
    <Card>
      <CardContent className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Target className="mx-auto h-12 w-12" />
        </div>
        <CardTitle className="text-lg font-medium mb-2">
          {title} found
        </CardTitle>
        <CardDescription className="mb-4 text-black">{text}</CardDescription>
        {user?.isAdvertiser && (
          <Button
            onClick={() =>
              router.push("/dashboard/advertiser/campaigns/create")
            }
            className="bg-gradient-to-r from-primary to-accent"
          >
            Create Your First Campaign
          </Button>
        )}
        {user?.isPublisher && (
          <Button
            onClick={() => (window.location.href = "/campaigns")}
            variant="accent"
          >
            Browse Available Campaigns
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
