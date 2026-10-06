"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Phone,
  Mail,
  Video,
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  Shield,
  Download,
  Clock,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function AdvertiserSupport() {
  const [searchQuery, setSearchQuery] = useState("");

  const contactMethods = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "WhatsApp Support",
      description: "Fast responses via WhatsApp chat",
      details: "+234 916 516 5583",
      action: "Chat Now",
      href: "https://wa.me/09165165583",
      color: "bg-green-50 text-green-600 border-green-200",
      available: "24/7",
      keywords: ["whatsapp", "chat", "instant", "message", "support"],
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Speak directly with our team",
      details: "+234 916 516 5583",
      action: "Call Now",
      href: "tel:+234 916 516 5583",
      color: "bg-blue-50 text-blue-600 border-blue-200",
      available: "Mon-Fri, 9AM-6PM",
      keywords: ["phone", "call", "speak", "direct", "voice"],
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Detailed assistance via email",
      details: "support@seltra.com",
      action: "Send Email",
      href: "mailto:support@seltra.com",
      color: "bg-orange-50 text-orange-600 border-orange-200",
      available: "24-48 hour response",
      keywords: ["email", "mail", "detailed", "assistance", "support"],
    },
  ];

  const helpCategories = [
    {
      icon: <Video className="w-6 h-6" />,
      title: "Getting Started",
      description: "Learn how to set up and run your first campaign",
      guides: [
        {
          title: "How to Create Your First Campaign",
          description: "Step-by-step guide to launching your first ad",
          href: "/demo",
          video: true,
          duration: "5 min",
          keywords: [
            "create",
            "first",
            "campaign",
            "launch",
            "start",
            "begin",
            "new",
            "ad",
          ],
        },
        {
          title: "Setting Up Your Advertiser Account",
          description: "Complete profile setup and verification",
          href: "/demo",
          video: true,
          duration: "3 min",
          keywords: [
            "account",
            "setup",
            "profile",
            "verification",
            "register",
            "signup",
          ],
        },
      ],
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Pricing & Payments",
      description: "Understand costs, billing, and payment methods",
      guides: [
        {
          title: "How Much Does a Campaign Cost?",
          description: "Complete pricing breakdown per platform",
          href: "/dashboard/advertiser/pricing",
          video: false,
          duration: "2 min read",
          keywords: [
            "pricing",
            "cost",
            "price",
            "how much",
            "money",
            "budget",
            "payment",
          ],
        },
        {
          title: "Payment Methods & Billing",
          description: "Accepted payment methods and billing cycles",
          href: "/academy/payment-methods",
          video: true,
          duration: "4 min",
          keywords: [
            "payment",
            "billing",
            "methods",
            "card",
            "transfer",
            "pay",
          ],
        },
      ],
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Audience & Targeting",
      description: "Reach the right people with your campaigns",
      guides: [
        {
          title: "How to Target Your Audience",
          description: "Demographic and geographic targeting options",
          href: "/demo",
          video: true,
          duration: "8 min",
          keywords: [
            "target",
            "audience",
            "demographic",
            "geographic",
            "reach",
            "people",
          ],
        },
      ],
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Analytics & Performance",
      description: "Track and improve your campaign results",
      guides: [
        {
          title: "Understanding Campaign Analytics",
          description: "How to read and interpret your campaign data",
          href: "/demo",
          video: true,
          duration: "7 min",
          keywords: [
            "analytics",
            "data",
            "performance",
            "metrics",
            "results",
            "tracking",
          ],
        },
      ],
    },
  ];

  const quickActions = [
    {
      title: "Create New Campaign",
      description: "Launch a new advertising campaign",
      href: "/dashboard/advertiser/campaigns/create",
      icon: <TrendingUp className="w-5 h-5" />,
      keywords: ["create", "campaign", "new", "launch"],
    },
    {
      title: "View Pricing",
      description: "See detailed pricing information",
      href: "/pricing/advertiser",
      icon: <DollarSign className="w-5 h-5" />,
      keywords: ["pricing", "cost", "price", "view"],
    },
    {
      title: "Campaign Analytics",
      description: "Check your campaign performance",
      href: "/dashboard/advertiser/analytics",
      icon: <FileText className="w-5 h-5" />,
      keywords: ["analytics", "performance", "campaign", "data"],
    },
  ];

  const faqs = [
    {
      question: "How quickly will my campaign start?",
      answer: "Campaigns starts immediately payment is confirmed.",
      keywords: ["start", "quickly", "approval", "payment", "time"],
    },
    {
      question: "Can I pause my campaign?",
      answer:
        "Yes, you can pause and resume campaigns at any time from your dashboard.",
      keywords: ["pause", "resume", "stop", "campaign", "dashboard"],
    },
    {
      question: "What's the minimum campaign budget?",
      answer: "You can start with as little as ₦2,500 for 500 views.",
      keywords: ["minimum", "budget", "cost", "views", "start"],
    },
    {
      question: "How are views counted?",
      answer:
        "We count unique views verified through our tracking system across all platforms.",
      keywords: ["views", "counted", "unique", "tracking", "platforms"],
    },
    {
      question: "Can I target specific locations?",
      answer:
        "Yes, you can target by city, state, or region across Nigeria and Africa.",
      keywords: ["target", "locations", "city", "state", "region", "nigeria"],
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept bank transfers, cards, and popular payment platforms in Nigeria.",
      keywords: ["payment", "methods", "bank", "transfer", "card", "accept"],
    },
  ];

  // Search functionality
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        contactMethods,
        helpCategories,
        quickActions,
        faqs,
        hasResults: true,
      };
    }

    const query = searchQuery.toLowerCase().trim();

    // Filter contact methods
    const filteredContacts = contactMethods.filter(
      (contact) =>
        contact.keywords.some((keyword) => keyword.includes(query)) ||
        contact.title.toLowerCase().includes(query) ||
        contact.description.toLowerCase().includes(query)
    );

    // Filter help categories and guides
    const filteredCategories = helpCategories
      .map((category) => ({
        ...category,
        guides: category.guides.filter(
          (guide) =>
            guide.keywords.some((keyword) => keyword.includes(query)) ||
            guide.title.toLowerCase().includes(query) ||
            guide.description.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.guides.length > 0);

    // Filter quick actions
    const filteredQuickActions = quickActions.filter(
      (action) =>
        action.keywords.some((keyword) => keyword.includes(query)) ||
        action.title.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query)
    );

    // Filter FAQs
    const filteredFaqs = faqs.filter(
      (faq) =>
        faq.keywords.some((keyword) => keyword.includes(query)) ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );

    const hasResults =
      filteredContacts.length > 0 ||
      filteredCategories.length > 0 ||
      filteredQuickActions.length > 0 ||
      filteredFaqs.length > 0;

    return {
      contactMethods: filteredContacts,
      helpCategories: filteredCategories,
      quickActions: filteredQuickActions,
      faqs: filteredFaqs,
      hasResults,
    };
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="px-4 py-1">
          Help & Support
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          How can we help you?
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get instant help through our support channels or explore our knowledge
          base
        </p>
      </div>

      {/* Search Bar */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, guides, or contact information..."
              className="pl-10 pr-10 py-3 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredData.hasResults
                ? `Found ${
                    filteredData.helpCategories.flatMap((cat) => cat.guides)
                      .length +
                    filteredData.contactMethods.length +
                    filteredData.quickActions.length +
                    filteredData.faqs.length
                  } results for "${searchQuery}"`
                : `No results found for "${searchQuery}"`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* No Results State */}
      {searchQuery && !filteredData.hasResults && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find any help articles matching "{searchQuery}"
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Try searching for:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "campaign",
                  "pricing",
                  "payment",
                  "account",
                  "views",
                  "support",
                ].map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="secondary"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setSearchQuery(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Methods - Only show if no search or has results */}
      {(!searchQuery || filteredData.contactMethods.length > 0) && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredData.contactMethods.map((method, index) => (
              <Card key={index} className={`border-2 ${method.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {method.icon}
                    <div>
                      <CardTitle className="text-lg">{method.title}</CardTitle>
                      <CardDescription>{method.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">{method.details}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {method.available}
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <a href={method.href}>{method.action}</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Help Center - Only show if no search or has results */}
      {(!searchQuery || filteredData.helpCategories.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Help Center</h2>
            {!searchQuery && (
              <Badge variant="outline" className="text-sm">
                {helpCategories.flatMap((cat) => cat.guides).length} Guides
                Available
              </Badge>
            )}
          </div>

          <div className="space-y-6">
            {filteredData.helpCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {category.title}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.guides.map((guide, guideIndex) => (
                      <div
                        key={guideIndex}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
                        onClick={() => (window.location.href = guide.href)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {guide.title}
                            </h3>
                            {guide.video && (
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <Video className="w-3 h-3" />
                                Video
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {guide.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {guide.duration}
                          </span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section - Only show if no search or has results */}
      {(!searchQuery || filteredData.faqs.length > 0) && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredData.faqs
                .slice(0, searchQuery ? filteredData.faqs.length : 6)
                .map((faq, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
