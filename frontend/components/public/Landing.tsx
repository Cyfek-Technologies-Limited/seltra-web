"use client";
import React from "react";

import Hero from "@/components/public/Hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  Shield,
  BarChart3,
  DollarSign,
  Megaphone,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import AboutSection from "./About";
import WhyChooseSeltra from "./WhyChooseAdhive";

const Landing = () => {
  return (
    <div className="overflow-x-hidden">
      <Hero />

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
          >
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Quick overview — sign up, create or accept campaigns, verify
              views.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: 1,
                title: "Sign Up",
                text: "Create an Advertiser or Publisher account in seconds.",
              },
              {
                step: 2,
                title: "Create or Share",
                text: "Advertisers create campaigns; Publishers share verified ads to their social media .",
              },
              {
                step: 3,
                title: "Verify & Payout",
                text: "Upload screenshots, OCR verifies views — payouts are processed fast.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: false }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" asChild>
              <Link href="/how-it-works">
                Learn More Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
          >
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground">
              Everything you need for successful advertising
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Eye,
                title: "Real View Tracking",
                desc: "OCR extracts and verifies view counts from screenshots.",
              },
              {
                icon: Shield,
                title: "Fraud Protection",
                desc: "Verification systems ensure authentic views and protect advertiser spend.",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                desc: "Track performance across campaigns and publishers in real time.",
              },
              {
                icon: DollarSign,
                title: "Instant Payouts",
                desc: "Fast, secure payments for publishers after verification.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: false }}
                whileHover={{
                  y: -10,
                  boxShadow: "0 20px 30px rgba(0,0,0,0.15)",
                }}
              >
                <div className="bg-primary text-white h-full transition-all rounded-xl overflow-hidden">
                  <CardHeader>
                    <f.icon className="w-10 h-10 bg-accent p-2 rounded-full text-primary mb-3" />
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white">
                      {f.desc}
                    </CardDescription>
                  </CardContent>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <WhyChooseSeltra />

      {/* CTA Section */}
      <section className="py-16 px-5 bg-gradient-to-r from-primary/90 to-accent/90 text-white">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="mb-8">
              Choose your path and join thousands of satisfied users
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Megaphone,
                title: "I Want to Advertise",
                desc: "Reach thousands of real users with verified views and transparent reporting.",
                link: "/auth/signup?role=advertiser",
                buttonText: "Start Advertising",
              },
              {
                icon: DollarSign,
                title: "I Want to Earn",
                desc: "Make money sharing ads on your social media with verified views and quick payouts.",
                link: "/auth/signup?role=publisher",
                buttonText: "Start Earning",
              },
            ].map((cta, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: false }}
                whileHover={{ y: -10 }}
              >
                <Card className="text-center shadow-lg bg-white text-primary p-8 rounded-2xl hover:shadow-accent transition-all">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <cta.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{cta.title}</h3>
                  <p className="text-muted-foreground mb-6">{cta.desc}</p>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-accent text-white"
                      asChild
                    >
                      <Link href={cta.link}>{cta.buttonText}</Link>
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
