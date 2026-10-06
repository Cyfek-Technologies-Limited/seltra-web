import Image from "next/image";
import React from "react";

const Icon = ({ w, h, src, style }: any) => {
  return (
    <img
      width={w || 26}
      height={h || 26}
      src={src || "/signUp/checkbox.svg"}
      alt="img"
      className={`${style} `}
    />
  );
};

export default Icon;
