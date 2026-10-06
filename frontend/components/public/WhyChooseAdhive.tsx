"use client";

import { ArrowRight } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const sections = [
  {
    title: "Faster Reach — Instantly Connect With Real People",
    description:
      "We facilitate word-of-mouth advertising by having thousands of people share a business's flyer or video on their personal social media accounts like WhatsApp, TikTok, Instagram, and Facebook.",
    image: "/hero/4.jpg",
    cta: "Create An Ad",
    link: "/how-it-works",
    landmark: true,
  },
  {
    title: "Earn While You Share — Make Money From Every Verified View",
    description:
      "Publishers make money with zero stress — just share ads and earn from every verified view ",
    image: "/hero/12.jpg",
    cta: "Start Earning",
    link: "/signup",
    landmark: true,
  },
  {
    title: "Safe & Secure — Verified Ads & Guaranteed Payments",
    description:
      "All ads are verified, payments are secure, and our platform protects against scams and fraud — peace of mind guaranteed.",
    image: "/hero/pay.jpg",
    cta: "See How It Works",
    link: "/how-it-works",
    landmark: true,
  },
  {
    title: "Transparent Results — Real-Time Analytics For Everyone",
    description:
      "Advertisers see real-time view counts while publishers track earnings — complete transparency for all users.",
    image: "/hero/ana.jpg",
    cta: "Track My Campaigns",
    link: "/dashboard",
    landmark: true,
  },
];

const WhyChooseSeltra = () => {
  return (
    <section className="py-16 px-[45px] bg-muted/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Seltra?
          </h2>
          <p className="text-muted-foreground text-lg">
            The smartest way to advertise and earn on social media
          </p>
        </motion.div>

        {sections.map((item, index) => (
          <div
            key={index}
            className="lg:flex odd:flex-row-reverse gap-12 items-center my-32"
          >
            {/* Left: Text */}
            <motion.div
              className="flex-[0.5]"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: false }}
            >
              <h3 className="text-2xl md:text-4xl font-[700] text-primary leading-[50px] mb-4">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-lg mb-6">
                {item.description}
              </p>
              <div className="flex gap-5 items-center my-5">
                <Button
                  size="lg"
                  variant="cta"
                  className="border-primary/20 hover:bg-primary/5"
                  asChild
                >
                  <Link href={item.link}>{item.cta}</Link>
                </Button>
                {/* 
                <motion.div
                  className="flex items-center gap-1 cursor-pointer"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: false }}
                >
                  <p className="text-accent font-bold">Learn More</p>
                  <ArrowRight className="w-4 h-4 text-accent" />
                </motion.div> */}
              </div>
            </motion.div>

            {/* Right: Floating Image */}
            <motion.div
              className="flex justify-center flex-[0.5]"
              animate={{ y: [0, -15, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src={item.image}
                alt={item.title}
                width={500}
                height={500}
                className="rounded-r-[190px] rounded-b-[30px] rounded-t-[10px] border-[10px] shadow-lg hover:shadow-accent shadow-primary w-full object-cover h-[500px] max-w-[500px]"
              />
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseSeltra;
