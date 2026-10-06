// app/about/page.tsx

"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Rocket,
  Users,
  BarChart3,
  Sparkles,
  Target,
  Heart,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center pt-24 pb-10 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        >
          Transforming Digital Marketing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 max-w-2xl text-lg text-gray-600"
        >
          Seltra connects <span className="font-semibold">Advertisers</span>{" "}
          with
          <span className="font-semibold"> Publishers</span> to create a
          smarter, more transparent, and more impactful way to run ads.
        </motion.p>
      </section>

      {/* Mission Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12  items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Our Mission
            </h2>

            <p className="text-lg text-slate-700 mb-4">
              Everyone with a social media presence should have the opportunity
              to monetize their digital space, and every business, no matter how
              small, should be able to advertise without breaking the bank.
            </p>

            <p className="text-lg text-slate-700 ">
              We aim to democratize digital advertising by building a seamless,
              accessible, and trustworthy platform that connects advertisers
              with a vast network of micro-publishers across Nigeria.
            </p>
          </div>
          <Card className="bg-primary rounded-2xl p-12 text-white">
            <div className="text-5xl font-bold mb-2">₦100B+</div>
            <div className="text-xl mb-8">Potential Market Size</div>
            <div className="text-5xl font-bold mb-2">200M+</div>
            <div className="text-xl">Active Social Media Users in Africa</div>
          </Card>
        </div>
      </div>

      {/* Vision / Story Section */}
      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-6"
        >
          Our Vision
        </motion.h2>
        <p className="text-gray-700 leading-relaxed text-lg">
          We believe digital marketing should be simple, transparent, and
          rewarding. With Seltra, campaigns aren’t just ads—they’re
          opportunities. We’re building the bridge that connects brands and
          people in a way that benefits everyone.
        </p>
      </section>

      {/* Problem We're Solving */}
      <section className="bg-gray-100 py-20 px-20">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          The Problems We're Solving
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              For Content Creators
            </h3>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>
                  No accessible monetization for social media beyond sponsored
                  posts
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>High payout thresholds on global platforms</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>
                  Difficult verification processes and poor local support
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              For Small Businesses
            </h3>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Social media ads are too expensive and complex</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Need for authentic and grassroots-level advertising</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Limited access to hyper-local targeting options</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Seltra Section */}
      <div className="mb-20 px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Why Seltra?</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <Rocket size={36} />,
                title: "For Advertisers",
                desc: "Reach engaged audiences through authentic channels.",
              },
              {
                icon: <Users size={36} />,
                title: "For Publishers",
                desc: "Turn your network into a sustainable income stream.",
              },
              {
                icon: <BarChart3 size={36} />,
                title: "For Everyone",
                desc: "Data-driven insights and transparent performance tracking.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow"
              >
                <div className="text-indigo-600 mb-4">{item.icon}</div>
                <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-20 px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          What We Stand For
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Trust & Transparency
            </h3>
            <p className="text-slate-600">
              Every transaction is tracked, every metric is visible, and every
              payout is guaranteed.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Simplicity First
            </h3>
            <p className="text-slate-600">
              If it takes more than 3 clicks or requires tech expertise, we
              haven't done our job.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Local First
            </h3>
            <p className="text-slate-600">
              Built for Africa, by Africans. We understand the market because we
              live it.
            </p>
          </div>
        </div>
      </div>

      {/* Vision */}
      <div className="text-center mb-20">
        <TrendingUp className="w-16 h-16 text-blue-600 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-slate-900 mb-6">
          Our Vision for the Future
        </h2>
        <p className="text-xl text-slate-700 max-w-3xl mx-auto mb-8">
          To become the leading hyper-local advertising network in Nigeria and
          across Africa, creating thousands of income opportunities while
          helping businesses of all sizes reach their communities authentically
          and affordably.
        </p>
        <div className="flex justify-center gap-8 text-left max-w-2xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">100K+</div>
            <div className="text-slate-600">Publishers by 2026</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
            <div className="text-slate-600">Active Advertisers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">10+</div>
            <div className="text-slate-600">African Countries</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary to-secondary my-20 rounded-2xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Be Part of the Movement?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Whether you want to earn from your social media or reach your local
          community, AdFlow is here for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors">
            Start Earning Today
          </button>
          <button className="bg-accent text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors">
            Launch Your Campaign
          </button>
        </div>
      </Card>

      {/* Footer */}
      <div className="bg-slate-900 text-slate-300 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="mb-2">
            © 2025 Seltra. Making digital advertising accessible to everyone.
          </p>
          <p className="text-sm text-slate-400">
            Powered by FayTech, Lagos, Nigeria
          </p>
        </div>
      </div>
    </div>
  );
}
