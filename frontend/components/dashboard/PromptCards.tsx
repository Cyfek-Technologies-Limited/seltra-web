import { User, Sparkles, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const prompts = [
  {
    id: 3,
    title: "Grow Audience",
    description: "Get more customers with targeted campaigns.",
    icon: "/vectors/1.jpg",
    type: "button",
    actionLabel: "Create Campaign",
    actionPath: "/create-campaign",
    bgColor: "bg-white",
  },
  // {
  //   id: 1,
  //   title: "Complete Profile",
  //   description: "Add your business details to increase trust and visibility.",
  //   icon: <User className="w-5 h-5 text-primary" />,
  //   type: "link",
  //   actionLabel: "Go to Profile",
  //   actionPath: "/profile",
  //   bgColor: "bg-primary-subtle",
  // },
  {
    id: 2,
    title: "Track campaigns",
    description: "Monitor performance and Keep track of your ads",
    icon: "/vectors/4.jpg",
    type: "button",
    actionLabel: "Monitor Ad",
    actionPath: "/campaigns",
    bgColor: "bg-[#ffd9d8]",
  },
];

export default function PromptCards() {
  return (
    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
      {prompts.map((prompt) => (
        <Card
          key={prompt.id}
          className={`h-[120px] ${prompt.bgColor} shadow-md shadow-warning p-2 flex items-center`}
        >
          <img
            src={prompt.icon}
            className="w-[6rem] h-[6rem] text-primary object-center flex-[0.5]"
          />
          <div className="flex-1">
            <div className=" flex text-lg text-primary items-center gap-2 my-3 font-bold">
              {prompt.title}
            </div>
            <div className="flex flex-col gap-5 ">
              <p className="text-sm text-muted-foreground -my-3">
                {prompt.description}
              </p>

              <Link
                href={prompt.actionPath}
                className="w-fit text-sm text-primary-hover hover:text-accent font-semibold "
              >
                {prompt.actionLabel}
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
