"use client";

import {
  Check,
  Globe,
  MessageCircle,
  Share2,
  Target,
  Users,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdvertiserPricing() {
  const plans = [
    {
      name: "WhatsApp/Telegram",
      price: "₦6",
      perView: "per view",
      description: "Reach audiences through personal status updates",
      popular: false,
      features: [
        "✓ 500 views: ₦3,000",
        "✓ 1,000 views: ₦6,000",
        "✓ 10,000 views: ₦60,000",
        "Personal, trusted audience",
        "High engagement rates",
        "Direct community reach",
      ],
      icon: <MessageCircle className="w-8 h-8" />,
      cta: "Start Campaign",
    },
    {
      name: "Social Platforms",
      price: "₦9",
      perView: "per view",
      description: "Instagram, Twitter, Facebook reach",
      popular: true,
      features: [
        "✓ 500 views: ₦4,500",
        "✓ 1,000 views: ₦9,000",
        "✓ 10,000 views: ₦90,000",
        "Broad social media exposure",
        "Visual content optimized",
        "Multi-platform presence",
      ],
      icon: <Share2 className="w-8 h-8" />,
      cta: "Most Popular",
    },
    {
      name: "All Platforms",
      price: "₦12",
      perView: "per view",
      description: "Maximum reach across all platforms",
      popular: false,
      features: [
        "✓ 500 views: ₦6,000",
        "✓ 1,000 views: ₦12,000",
        "✓ 10,000 views: ₦120,000",
        "WhatsApp + Instagram + Twitter + Facebook",
        "Complete market coverage",
        "Maximum brand visibility",
      ],
      icon: <Globe className="w-8 h-8" />,
      cta: "Go Premium",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm">
            For Advertisers
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Reach Your Audience,
            <br />
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transparent pricing with guaranteed views.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <Target className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">Targeted Reach</h3>
            <p className="text-gray-600 mt-2">
              Precise audience targeting based on location and demographics
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">Real Views</h3>
            <p className="text-gray-600 mt-2">
              Authentic engagement from verified publishers
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <Zap className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">Instant Setup</h3>
            <p className="text-gray-600 mt-2">
              Launch campaigns in minutes with real-time tracking
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 transition-all hover:shadow-lg ${
                plan.popular
                  ? "border-blue-500 shadow-lg scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full text-accent">
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">{plan.perView}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-gray-700"
                    >
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-2">
                How are views counted?
              </h3>
              <p className="text-gray-600">
                We count unique views verified through our tracking system. Each
                person who sees your ad counts as one view.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-2">
                Can I target specific locations?
              </h3>
              <p className="text-gray-600">
                Yes! You can target audiences by city, state, or region across
                Nigeria and Africa.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-2">
                What's the minimum campaign budget?
              </h3>
              <p className="text-gray-600">
                You can start with as little as ₦2,500 for 500 views. No
                long-term commitments required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
