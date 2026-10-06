"use client";

import {
  Check,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Smartphone,
  MessageCircle,
  Share2,
  Globe,
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

export default function PublisherPricing() {
  const earningPlans = [
    {
      name: "WhatsApp/Telegram",
      price: "₦3",
      perView: "per view",
      description: "Earn from your personal status updates",
      popular: false,
      features: [
        "✓ 100 views: ₦300",
        "✓ 500 views: ₦1,500",
        "✓ 1,000 views: ₦3,000",
        "Easy status posting",
        "High view rates",
        "Personal network reach",
      ],
      icon: <MessageCircle className="w-8 h-8" />,
      example: "Post 2 ads/day × 50 views = ₦300 daily",
    },
    {
      name: "Social Platforms",
      price: "₦4.5",
      perView: "per view",
      description: "Instagram, Twitter, Facebook posts",
      popular: true,
      features: [
        "✓ 100 views: ₦450",
        "✓ 500 views: ₦2,250",
        "✓ 1,000 views: ₦4,500",
        "Visual content friendly",
        "Broader audience reach",
        "Multiple post formats",
      ],
      icon: <Share2 className="w-8 h-8" />,
      example: "Post 1 ad/day × 100 views = ₦450 daily",
    },
    {
      name: "All Platforms",
      price: "₦7",
      perView: "per view",
      description: "Maximum earnings across all platforms",
      popular: false,
      features: [
        "✓ 100 views: ₦700",
        "✓ 500 views: ₦3,500",
        "✓ 1,000 views: ₦7,000",
        "Post on 2+ platforms",
        "Combine audience reach",
        "Highest earning potential",
      ],
      icon: <Globe className="w-8 h-8" />,
      example: "Post on WhatsApp + Instagram = ₦7/view",
    },
  ];

  const earningsExamples = [
    {
      scenario: "Student with 200 WhatsApp contacts",
      daily: "₦600",
      weekly: "₦4,200",
      monthly: "₦18,000",
      description: "Posting 2 ads daily to your status",
    },
    {
      scenario: "Influencer with 1K Instagram followers",
      daily: "₦1,350",
      weekly: "₦9,450",
      monthly: "₦40,500",
      description: "Posting 3 ads daily to your stories",
    },
    {
      scenario: "Professional using multiple platforms",
      daily: "₦2,100",
      weekly: "₦14,700",
      monthly: "₦63,000",
      description: "Cross-posting to WhatsApp + Instagram",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-1 text-sm bg-green-100 text-green-800"
          >
            For Publishers
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Turn Your Social Media
            <br />
            <span className="text-green-600">Into Income</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Earn money for every view on your social media posts. Your audience
            pays your bills.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <DollarSign className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">₦3-₦7</div>
            <div className="text-gray-600">Per View</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <Smartphone className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">4+</div>
            <div className="text-gray-600">Platforms</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <TrendingUp className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">Instant</div>
            <div className="text-gray-600">Payouts</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <Users className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">1000+</div>
            <div className="text-gray-600">Active Campaigns</div>
          </div>
        </div>

        {/* Earning Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {earningPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 transition-all hover:shadow-lg ${
                plan.popular
                  ? "border-green-500 shadow-lg scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    Highest Demand
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full text-green-600">
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

                <ul className="space-y-3 mb-6">
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

                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-green-800 font-medium">
                    {plan.example}
                  </p>
                </div>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                  size="lg"
                >
                  Start Earning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Earnings Calculator */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Earnings Calculator</CardTitle>
            <CardDescription>
              See how much you can earn based on your audience size
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {earningsExamples.map((example, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg"
                >
                  <h3 className="font-semibold text-lg mb-3">
                    {example.scenario}
                  </h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span>Daily:</span>
                      <span className="font-bold text-green-600">
                        {example.daily}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly:</span>
                      <span className="font-bold text-green-600">
                        {example.weekly}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly:</span>
                      <span className="font-bold text-green-600">
                        {example.monthly}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{example.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600 text-sm">
                Create your publisher account in 2 minutes
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Campaigns</h3>
              <p className="text-gray-600 text-sm">
                Pick ads that match your audience
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-orange-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Post & Earn</h3>
              <p className="text-gray-600 text-sm">
                Share ads on your social media
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold text-purple-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Get Paid</h3>
              <p className="text-gray-600 text-sm">
                Receive instant payments to your bank
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-2">
                How often do I get paid?
              </h3>
              <p className="text-gray-600">
                Payments are processed instantly. You can withdraw your earnings
                anytime once you reach the minimum payout threshold.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-2">
                What's the minimum payout?
              </h3>
              <p className="text-gray-600">
                You can withdraw once you reach ₦1,000. We support direct bank
                transfers and mobile money.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-2">
                Can I choose which ads to post?
              </h3>
              <p className="text-gray-600">
                Absolutely! You have full control over which campaigns you
                participate in based on your preferences and audience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
