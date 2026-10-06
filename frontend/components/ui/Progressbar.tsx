import React from "react";
import { Progress } from "./progress";

const Progressbar = ({ campaign }) => {
  const progress =
    campaign.targetViews > 0
      ? (campaign.views / campaign.targetViews) * 100
      : 0;
  const calculatedProgress =
    progress !== undefined
      ? progress
      : campaign.targetViews > 0
      ? Math.round((campaign.views / campaign.targetViews) * 100)
      : 0;
  return (
    <div className="">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">Views</span>
        <span className="font-medium text-black">
          {campaign.views?.toLocaleString()} /{" "}
          {campaign.targetViews?.toLocaleString()}
        </span>
      </div>
      <Progress value={calculatedProgress} />
      <div className="text-xs text-muted-foreground mt-1">
        {Math.round(calculatedProgress)}% complete
      </div>
    </div>
  );
};

export default Progressbar;
