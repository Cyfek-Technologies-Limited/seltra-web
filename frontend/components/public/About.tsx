"use client";
import Image from "next/image";

const AboutSection = () => {
  return (
    <section className="bg-[#0b3350] text-white py-16 px-6 md:px-12 lg:px-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
        {/* Left Image + About */}
        <div className="flex flex-col items-center md:items-start space-y-8">
          <div className="relative w-56 h-56 rounded-full p-[4px] bg-gradient-to-tr from-cyan-400 to-purple-500">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0b3350]">
              <Image
                src="/warehouse-driver.jpg" // <-- replace with your image
                alt="Worker"
                width={400}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">ABOUT US</h2>
            <p className="text-sm text-gray-300 mb-2">
              Cancer is one of the zodiac constellations and is located in the
              northern celestial hemisphere. Its name means crab in Latin.
            </p>
            <p className="text-sm text-gray-300">
              Cancer is a medium-sized constellation, and its stars are quite
              faint, its brightest star being Beta Cancri.
            </p>
          </div>
        </div>

        {/* Middle: What We Do */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
            WHAT WE DO
          </h2>
          <ul className="space-y-5">
            {[
              {
                icon: "🏺",
                title: "Pisces",
                text: "Pisces is a zodiac constellation.",
              },
              {
                icon: "💧",
                title: "Aquarius",
                text: "Aquarius means “the water-bearer”.",
              },
              {
                icon: "🚛",
                title: "Aries",
                text: "Aries is the first sign of the zodiac.",
              },
              {
                icon: "🛳️",
                title: "Cancer",
                text: "Cancer constellation is visible in spring.",
              },
              {
                icon: "⭐",
                title: "Sirius",
                text: "Sirius is the brightest star.",
              },
            ].map((item, i) => (
              <li key={i} className="flex items-start space-x-4">
                <div className="flex items-center justify-center bg-white text-[#0b3350] rounded-full w-10 h-10 text-lg">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{`${i + 1}. ${item.title}`}</h4>
                  <p className="text-gray-300 text-sm">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Our Services */}
        <div className="flex flex-col items-center md:items-start space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">OUR SERVICES</h2>
            <p className="text-sm text-gray-300 mb-2">
              Aries is located in the northern celestial hemisphere, between
              Pisces and Taurus. It’s one of the 48 constellations named by
              Ptolemy and remains one of the 88 modern constellations.
            </p>
            <p className="text-sm text-gray-300">
              Aries has a medium size, and it is a faint constellation, as it
              has only four bright stars, the most shining star being Hamal.
            </p>
          </div>

          <div className="relative w-56 h-56 rounded-full p-[4px] bg-gradient-to-tr from-cyan-400 to-purple-500">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0b3350]">
              <Image
                src="/warehouse-worker.jpg" // <-- replace with your image
                alt="Warehouse worker"
                width={400}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="mt-12">
        <div className="h-24 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-t-[60%_60%_0_0]"></div>
      </div>
    </section>
  );
};

export default AboutSection;
