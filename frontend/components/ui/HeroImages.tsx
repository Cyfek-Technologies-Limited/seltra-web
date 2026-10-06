import React from "react";

export default function HeroImages() {
  return (
    <div className="relative flex items-center justify-center  py-20 ">
      {/* Left Group */}
      <div className="flex flex-col gap-6">
        {/* Top-left circle */}
        <div className="w-40 h-40 border-[1px] border-primary-hover rounded-full overflow-hidden bg-gray-200 ">
          <img
            src="/hero/6.jpg"
            alt="Left Circle"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Bottom-left boxy image */}
        <div className="w-40 h-40 border-[1px] border-primary-hover object-cover rounded-xl overflow-hidden bg-gray-200">
          <img
            src="/hero/10.jpg"
            alt="Left Box"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Center Overlap Image */}
      <div className="absolute left-[25%] rounded-lg z-20 border-[1px] border-primary-hover shadow-lg shadow-primary-hover ">
        <div className="w-[150px] flex justify-center bg-white gap-1 items-center h-20 rounded-lg overflow-hidden shadow-lg bg-gray-200">
          <div className=" font-bold flex items-start rounded-fullbg-accent text-black text-sm justify-center rounded-[8px] animate-spinSlow h-[40px] w-[40px]">
            <img
              src="/logo/7.png"
              alt="Right Circle"
              className="bg-primary h-[90%] object-cover"
            />
          </div>
          <span className="text-xl font-bold text-black mt-1">Seltra</span>
        </div>
      </div>

      {/* Right Group */}
      <div className="flex flex-col gap-6 ml-10">
        {/* Top-right squarish big image */}
        <div className="w-56 h-40 border-[1px] border-primary-hover  border-[1px] border-primary-hover rounded-2xl overflow-hidden bg-gray-200">
          <img
            src="/hero/4.jpg"
            alt="Right Big"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Bottom-right circle + Pay Bills */}
        <div className="relative">
          <div className="w-40 h-40 border-[1px] border-primary-hover rounded-full overflow-hidden bg-gray-200 ">
            <img
              src="/hero/3.png"
              alt="Right Circle"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Small text box above circle */}
          <div className="absolute font-bold flex items-center  -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-sm px-4 py-1 rounded-[8px] shadow-md h-[40px]">
            Run Ads
          </div>
        </div>
      </div>
    </div>
  );
}
