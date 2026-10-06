import { useRouter } from "next/navigation";
import React from "react";

const CustomButton = ({ text, submitFn, route, small }: any) => {
  const router = useRouter();

  const handleOnClick = (e) => {
    e.preventDefault();

    if (route) {
      router.push(route);
    } else {
      submitFn();
    }
  };

  return (
    <button
      onClick={handleOnClick}
      className={`${
        small ? "h-[25.28px] w-[95.52px]" : "h-[45px] "
      } cursor-pointer bg-[#2FC22B] flex items-center justify-center py-[15px] px-[10px] rounded-[10px]`}
    >
      <p
        className={`font-[500] ${
          small ? "text-[10px]" : "text-[16px]"
        } text-helvetica`}
      >
        {text}
      </p>
    </button>
  );
};

export default CustomButton;
