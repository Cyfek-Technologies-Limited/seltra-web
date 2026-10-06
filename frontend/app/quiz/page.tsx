"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

const questions = [
  {
    id: 1,
    question: "What best describes your current advertising situation?",
    options: [
      "Running ads but not getting enough leads",
      "Getting traffic but very few conversions",
      "Engagement feels low-quality or fake",
      "Ads feel too expensive",
      "Not running ads yet",
    ],
  },
  {
    id: 2,
    question: "How long have you been running paid ads?",
    options: [
      "Less than 3 months",
      "3–12 months",
      "1–3 years",
      "More than 3 years",
      "I haven't run ads yet",
    ],
  },
  {
    id: 3,
    question: "What happens after someone clicks your ad?",
    options: [
      "They go straight to a signup or sales page",
      "They land on a general website page",
      "They see educational content",
      "I'm not sure",
      "I don't have a funnel yet",
    ],
  },
];

const testimonials = [
  {
    id: 1,
    name: "Chinedu Okoro",
    role: "CEO, TechBridge Africa",
    quote:
      "We scaled our e-commerce conversions by 320% using Seltra's targeted ad strategies for the Nigerian market.",
    photo:
      "https://plus.unsplash.com/premium_photo-1683121523671-9617aba661d7?w=400&h=400&fit=crop&crop=faces",
    stats: "320% conversion lift",
    location: "Lagos, Nigeria",
  },
  {
    id: 2,
    name: "Amina Suleiman",
    role: "Marketing Director, NaijaFashion Hub",
    quote:
      "Seltra helped us reduce our customer acquisition cost by 45% while doubling our reach across West Africa.",
    photo:
      "https://plus.unsplash.com/premium_photo-1682097895977-b02a99df2a27?w=400&h=400&fit=crop&crop=faces",
    stats: "45% lower CAC",
    location: "Abuja, Nigeria",
  },
  {
    id: 3,
    name: "Oluwaseun Adebayo",
    role: "Founder, AgriTech Solutions NG",
    quote:
      "From struggling with Facebook Ads to achieving consistent 7x ROAS - Seltra understood our local market nuances.",
    photo:
      "https://images.unsplash.com/photo-1631131431211-4f768d89087d?w=400&h=400&fit=crop&crop=faces",
    stats: "7x ROAS",
    location: "Ibadan, Nigeria",
  },
  {
    id: 4,
    name: "Chioma Eze",
    role: "Digital Head, Lagos FinTech",
    quote:
      "The automated optimization saved us 25 hours weekly on manual campaign adjustments across multiple platforms.",
    photo:
      "https://plus.unsplash.com/premium_photo-1661301214463-bdd017b73253?w=400&h=400&fit=crop&crop=faces",
    stats: "25 hours/week saved",
    location: "Port Harcourt, Nigeria",
  },
  {
    id: 5,
    name: "Tunde Williams",
    role: "E-commerce Manager, Jara Stores",
    quote:
      "We expanded from ₦2M to ₦15M monthly ad spend while maintaining 35% profit margins across all campaigns.",
    photo:
      "https://images.unsplash.com/photo-1495603889488-42d1d66e5523?w=400&h=400&fit=crop&crop=faces",
    stats: "7.5x scale growth",
    location: "Kano, Nigeria",
  },
  {
    id: 6,
    name: "Ngozi Okafor",
    role: "COO, EduTech West Africa",
    quote:
      "Our lead quality improved dramatically - 68% of Seltra-generated leads convert within 30 days.",
    photo:
      "https://plus.unsplash.com/premium_photo-1661301019290-e6dab0b83688?w=400&h=400&fit=crop&crop=faces",
    stats: "68% lead conversion",
    location: "Enugu, Nigeria",
  },
];

const TESTIMONIAL_ROTATION_INTERVAL = 5000;

export default function SeltraQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState({
    title: "",
    description: "",
    link: "",
  });
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (showResult) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentTestimonialIndex((prev) =>
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, TESTIMONIAL_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [showResult]);

  const goToTestimonial = (index: number, newDirection: number) => {
    setDirection(newDirection);
    setCurrentTestimonialIndex(index);
  };

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [questions[step].id]: option });
  };

  const computeResult = () => {
    const primaryAnswer = answers[1];

    if (primaryAnswer === "Running ads but not getting enough leads") {
      return {
        title: "You're Struggling With Lead Generation",
        description:
          "Your ads are running, but they aren't producing consistent, qualified leads. This usually means the message, targeting, or funnel structure isn't aligned with how users make decisions.",
        link: "/blog/why-your-ads-arent-generating-leads-and-how-to-fix-it",
      };
    }

    if (primaryAnswer === "Getting traffic but very few conversions") {
      return {
        title: "You Have Traffic, But No Conversions",
        description:
          "People are clicking, but not taking action. This is almost always a funnel and trust problem, not a traffic problem.",
        link: "/blog/are-you-getting-traffic-but-no-conversions-heres-why",
      };
    }

    if (primaryAnswer === "Engagement feels low-quality or fake") {
      return {
        title: "Your Engagement Lacks Real Intent",
        description:
          "Views and clicks don't mean much if there's no real human attention behind them. This points to low-quality inventory or poor audience alignment.",
        link: "/blog/the-engagement-illusion-how-worthless-engagement-is-destroying-your-roi",
      };
    }

    if (primaryAnswer === "Ads feel too expensive") {
      return {
        title: "Your Ad Spend Isn't Efficient",
        description:
          "High costs are usually a symptom of low relevance and weak engagement signals — not just platform pricing.",
        link: "/blog/do-you-think-social-media-ads-are-too-expensive",
      };
    }

    return {
      title: "You're Just Getting Started",
      description:
        "You're early in the process, which is actually a huge advantage. Learning the fundamentals now will save you time and money later.",
      link: "/blog/How to Create Ads That Actually Convert on Seltra",
    };
  };

  const nextStep = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const finalResult = computeResult();
      setResult(finalResult);
      setShowResult(true);
    }
  };

  return (
    <div className="min-h-screen mt-[70px] flex flex-col md:flex-row bg-white text-gray-800 font-sans">
      {/* Left Side - Quiz */}
      <div className="md:flex-[0.6] p-8 md:p-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {showResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto space-y-8"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="https://thumbs.dreamstime.com/b/email-marketing-concept-blue-background-advertising-campaign-envelope-business-icons-newsletter-design-banner-web-119731845.jpg"
                  alt="Seltra Icon"
                  width={40}
                  height={40}
                  className="rounded"
                />
                <h2 className="text-xl font-semibold">Seltra Ads Quiz</h2>
              </div>
              <h1 className="text-3xl font-bold leading-tight">
                {result.title}
              </h1>
              <p className="text-gray-600 leading-relaxed">
                {result.description}
              </p>
              <Button
                onClick={() => (window.location.href = result.link)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold rounded-md"
              >
                Learn How to Fix This
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto space-y-8"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="https://thumbs.dreamstime.com/b/email-marketing-concept-blue-background-advertising-campaign-envelope-business-icons-newsletter-design-banner-web-119731845.jpg"
                  alt="Seltra Icon"
                  width={40}
                  height={40}
                  className="rounded"
                />
                <h2 className="text-xl font-semibold">Seltra Ads Quiz</h2>
              </div>
              <h1 className="text-3xl font-bold leading-tight">
                Find out why your ads aren't generating leads.
              </h1>
              <Progress
                value={((step + 1) / questions.length) * 100}
                className="h-2 bg-gray-200 rounded-full"
              />
              <p className="text-sm text-gray-500">
                STEP {step + 1} OF {questions.length}
              </p>
              <label className="block text-gray-700 font-medium mb-4">
                {questions[step].question}
              </label>
              <div className="space-y-0 divide-y divide-gray-200">
                {questions[step].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left border border-[1px] border-black/40 mb-2 py-4 px-2 rounded-xl flex items-center justify-between ${
                      answers[questions[step].id] === option
                        ? "text-blue-600 font-medium"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    {option}
                    {answers[questions[step].id] === option && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <Button
                onClick={nextStep}
                disabled={!answers[questions[step].id]}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold rounded-md disabled:opacity-50 disabled:hover:bg-orange-600"
              >
                {step === questions.length - 1 ? "View Results" : "Next"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side - Nigerian Testimonials */}
      <div className="md:flex-[0.4] bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-8 flex flex-col justify-center items-start relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>

        <div className="relative z-10 w-full max-w-md">
          {/* Nigerian Flag Decoration */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 via-white to-green-500 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-black"></div>
            </div>
            <span className="text-sm font-medium text-white/80">
              Success Stories from Nigeria
            </span>
          </div>

          {/* Testimonial Navigation */}
          <div className="flex justify-center gap-2 mb-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() =>
                  goToTestimonial(
                    index,
                    index > currentTestimonialIndex ? 1 : -1
                  )
                }
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTestimonialIndex
                    ? "bg-yellow-400 w-8"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Animated Testimonial Container */}
          <div className="relative h-72 overflow-hidden">
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={currentTestimonialIndex}
                custom={direction}
                initial={{
                  opacity: 0,
                  x: direction > 0 ? 100 : -100,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: direction > 0 ? -100 : 100,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.5,
                }}
                className="absolute inset-0"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start mb-6">
                    <div className="relative w-20 h-20 mr-4 flex-shrink-0">
                      <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30"></div>
                      <Image
                        src={testimonials[currentTestimonialIndex].photo}
                        alt={`${testimonials[currentTestimonialIndex].name}'s photo`}
                        fill
                        className="rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-xl">
                        {testimonials[currentTestimonialIndex].name}
                      </p>
                      <p className="text-sm opacity-90">
                        {testimonials[currentTestimonialIndex].role}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <svg
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-white/70">
                          {testimonials[currentTestimonialIndex].location}
                        </span>
                      </div>
                      <div className="mt-3 inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-semibold border border-white/20">
                        {testimonials[currentTestimonialIndex].stats}
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="relative">
                      <svg
                        className="absolute -left-2 -top-2 w-6 h-6 text-yellow-400 opacity-50"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-xl italic leading-relaxed pl-4">
                        {testimonials[currentTestimonialIndex].quote}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="hidden md:flex justify-between mt-8">
                    <button
                      onClick={() =>
                        goToTestimonial(
                          currentTestimonialIndex === 0
                            ? testimonials.length - 1
                            : currentTestimonialIndex - 1,
                          -1
                        )
                      }
                      className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/20"
                      aria-label="Previous testimonial"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <span>{currentTestimonialIndex + 1}</span>
                      <span className="text-white/40">/</span>
                      <span>{testimonials.length}</span>
                    </div>
                    <button
                      onClick={() =>
                        goToTestimonial(
                          currentTestimonialIndex === testimonials.length - 1
                            ? 0
                            : currentTestimonialIndex + 1,
                          1
                        )
                      }
                      className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/20"
                      aria-label="Next testimonial"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Auto-rotation Indicator */}
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <div className="relative w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  key={currentTestimonialIndex}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: TESTIMONIAL_ROTATION_INTERVAL / 1000,
                    ease: "linear",
                  }}
                  className="absolute h-full bg-yellow-400"
                />
              </div>
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Auto-rotating
              </span>
            </div>
          </div>
        </div>

        {/* Nigerian Success Metrics */}
        <div className="relative z-10 mt-auto pt-8 border-t border-white/20 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-yellow-400 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">₦</span>
              </div>
              <div>
                <p className="font-semibold">
                  Trusted by 500+ Nigerian Businesses
                </p>
                <p className="text-sm opacity-80">
                  Average 4.1x ROAS across West Africa
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                {["Lagos", "Abuja", "Port Harcourt"].map((city) => (
                  <span
                    key={city}
                    className="px-3 py-1 bg-white/10 rounded-full text-xs"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
