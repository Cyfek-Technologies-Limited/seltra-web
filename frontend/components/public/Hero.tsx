import {
  ArrowRight,
  DollarSign,
  Eye,
  Hand,
  Share2,
  Target,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import HeroImages from "../ui/HeroImages";

const hero = {
  advertiser: {
    title: "Give your brand the visibility it deserves",
    subtitle:
      "Advertisers create targeted campaigns, while everyday users, acting as `Publishers,` effortlessly share these ads across their personal social media networks.",
    ctaText: "Get Started",
    ctaLink: "/auth/signup?role=advertiser",
    secondaryText: "See publisher options",
  },
  publisher: {
    title: "Get paid to post ads on your social media",
    subtitle:
      "Get paid to post ads on your social media. This is the easiest way to make money online. No skill or experience needed. Just Data and your smart phone",
    ctaText: "Start Earning",
    ctaLink: "/auth/signup?role=publisher",
    secondaryText: "Learn how advertisers reach people",
  },
};

// Replace this with your actual WhatsApp group invite link
const WHATSAPP_GROUP_LINK =
  "https://chat.whatsapp.com/CW1TbVaHTjO0fzKMTyRjsF?mode=gi_t";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Hero = () => {
  const [role, setRole] = useState("publisher");
  const [hasSwitched, setHasSwitched] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  return (
    <section className="relative bg-primary text-white min-h-[90vh] overflow-hidden py-[100px]">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-accent opacity-80" />
        <div
          className="absolute -bottom-40 left-[-10%] w-[120%] h-[60vh] rounded-t-full bg-gradient-to-r from-primary to-accent opacity-10 blur-3xl transform-gpu"
          aria-hidden
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="lg:flex items-center gap-12">
          {/* Left: Text content */}
          <div className="w-full lg:flex-[0.6]">
            {/* Role Toggle */}
            <div className="flex items-center gap-2 mb-6 justify-start">
              <div className="text-sm text-white mr-2">I want to be a</div>
              <div className="flex rounded-full bg-white/5 p-1 shadow-sm relative">
                <div className="relative">
                  <button
                    onClick={() => {
                      setRole("publisher");
                      setHasSwitched(true);
                    }}
                    aria-pressed={role === "publisher"}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition relative ${
                      role === "publisher"
                        ? "bg-white text-foreground shadow-sm"
                        : "text-white hover:bg-white/3"
                    }`}
                  >
                    Publisher
                  </button>
                  {!hasSwitched && role !== "publisher" && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                      <Hand className="w-5 h-5 text-white" />
                      <span className="text-xs mt-1 text-white font-medium">
                        Tap
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setRole("advertiser");
                      setHasSwitched(true);
                    }}
                    aria-pressed={role === "advertiser"}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      role === "advertiser"
                        ? "bg-white text-foreground shadow-sm"
                        : "text-white hover:bg-white/3"
                    }`}
                  >
                    Advertiser
                  </button>
                  {!hasSwitched && role !== "advertiser" && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                      <Hand className="w-5 h-5 text-white" />
                      <span className="text-xs mt-1 text-white font-medium">
                        Tap
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic Title & Subtitle */}
            <h1 className="text-xl md:text-2xl capitalize lg:text-3xl font-semibold my-12 bg-clip-text w-full bg-gradient-to-r from-primary to-accent">
              {role === "advertiser"
                ? hero.advertiser.subtitle
                : hero.publisher.subtitle}
            </h1>

            {/* CTA Buttons */}
            <div className="flex gap-4 items-start sm:items-center">
              <Button
                size="lg"
                className="border-[0.3px] border-black/20 shadow-md bg-accent text-white shadow-card hover:shadow-elevated transition-all duration-300"
                asChild
              >
                <Link href="auth/signup">
                  {role === "advertiser" ? (
                    <>
                      <Target className="w-5 h-5 mr-2 inline" />
                      {hero.advertiser.ctaText}
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5 mr-2 inline" />
                      {hero.publisher.ctaText}
                    </>
                  )}
                </Link>
              </Button>

              <Button
                size="lg"
                variant="link"
                className="shadow-accent-hover border-primary/20 bg-white border-[0.3px] border-black/20 shadow-md hover:bg-primary/5"
                asChild
              >
                <Link href="/how-it-works" className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  How it works
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Image */}
          <div className="lg:flex-[0.4] lg:flex lg:mt-0 mt-10 justify-center">
            <div className="lg:h-[500px] rounded-2xl overflow-hidden">
              <img src={"/09.png"} className="subtle-float" />
            </div>

            {/* WhatsApp floating badge — replaces the 2.5M badge */}
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="hidden animate-bounce lg:flex absolute -right-6 top-6 items-center gap-2 bg-white/6 hover:bg-[#20bb5a] transition-colors rounded-xl px-4 py-3 shadow-lg border border-white/10 cursor-pointer"
            >
              <WhatsAppIcon className="w-6 h-6 text-white flex-shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-white text-sm">
                  Join our Group
                </div>
                {/* <div className="text-xs text-white/80">
                  Learn & earn with us
                </div> */}
              </div>
            </button>

            <div className="absolute left-8 -bottom-8 bg-white/6 rounded-full px-3 py-2 text-sm border border-white/8 animate-bounce">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-accent" />
                <span className="text-sm">Share-ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curve effect at bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-24"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="white"
            fillOpacity="1"
            d="M0,224L60,213.3C120,203,240,181,360,160C480,139,600,117,720,133.3C840,149,960,203,1080,229.3C1200,256,1320,256,1380,256L1440,256L1440,320L0,320Z"
          />
        </svg>
      </div>

      {/* WhatsApp Group Modal */}
      {showWhatsAppModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowWhatsAppModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowWhatsAppModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg">
                <WhatsAppIcon className="w-9 h-9 text-white" />
              </div>
            </div>

            {/* Content */}
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Join Our WhatsApp Community
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Join our free WhatsApp group where we teach you exactly how to use
              Seltra, share tips on maximising your earnings, and answer all
              your questions in real time.
            </p>

            {/* Benefits */}
            <div className="space-y-2 mb-6">
              {[
                "Step-by-step guidance on how to use the platform",
                "Tips to maximise your earnings",
                "Real-time support and Q&A",
                "Be the first to know about new campaigns",
              ].map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="text-[#25D366] font-bold mt-0.5">✓</span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href={WHATSAPP_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bb5a] text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              onClick={() => setShowWhatsAppModal(false)}
            >
              <WhatsAppIcon className="w-5 h-5" />
              Join the Group — It's Free
            </a>

            <p className="text-xs text-gray-400 text-center mt-3">
              You'll be redirected to WhatsApp to join
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
