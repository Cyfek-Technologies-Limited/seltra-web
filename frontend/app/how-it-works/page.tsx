import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Share2,
  Eye,
  DollarSign,
  Upload,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Smartphone,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";

<section className="relative bg-[#16a34a] text-white">
  <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
    {/* Left: Text content */}
    <div>
      <h1 className="text-5xl font-bold leading-tight">
        Run Smarter Ads. Get Real Results.
      </h1>
      <p className="mt-4 text-lg">
        Stop wasting money on ads that don’t convert. With our platform, your
        campaigns go directly to active WhatsApp users—giving you guaranteed
        visibility and measurable impact.
      </p>
      <ul className="mt-6 space-y-3 text-base">
        <li>✅ Pay only for real views—no hidden charges</li>
        <li>✅ Reach thousands of verified WhatsApp users instantly</li>
        <li>✅ Track performance in real time with detailed insights</li>
      </ul>
      <button className="mt-8 px-8 py-4 bg-white text-green-700 font-semibold rounded-full shadow hover:bg-gray-100 transition">
        Start Advertising Today
      </button>
    </div>

    {/* Right: Your existing hero image (keep or replace with AI image) */}
    <div className="flex justify-center md:justify-end">
      <img
        src="/images/advertiser-hero.png"
        alt="Advertiser Hero"
        className="w-full max-w-md"
      />
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
      ></path>
    </svg>
  </div>
</section>;

export default function HowItWorks() {
  const publisherSteps = [
    {
      step: "1",
      title: "Sign Up as Publisher",
      description: "Create your account and connect your bank details",
      icon: Users,
      color: "text-primary",
    },
    {
      step: "2",
      title: "Share Ads  ",
      description: "Post approved ads to your social media page and get views",
      icon: Share2,
      color: "text-accent",
    },
    {
      step: "3",
      title: "Earn Per Views",
      description: "Get paid for every verified view on the post",
      icon: Eye,
      color: "text-success",
    },
    {
      step: "4",
      title: "Withdraw Earnings",
      description:
        "Cash out your earnings to your bank account or mobile wallet",
      icon: Wallet,
      color: "text-primary",
    },
  ];

  const advertiserSteps = [
    {
      step: "1",
      title: "Create Advertiser Account",
      description: "Sign up and set up your business profile",
      icon: Target,
      color: "text-primary",
    },
    {
      step: "2",
      title: "Create Campaign",
      description: "Add campaign details, and set your target audience",
      icon: Zap,
      color: "text-accent",
    },
    {
      step: "3",
      title: "Upload or Generate Flyer",
      description:
        "Upload your ad creative or use our AI flyer generator (coming soon)",
      icon: Upload,
      color: "text-success",
    },
    {
      step: "4",
      title: "Launch & Pay Per View",
      description:
        "Your ads go live and you pay only for verified views from real people",
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  const benefits = [
    {
      title: "Real People, Real Views",
      description:
        "Every view is from a verified user, not bots or fake accounts",
      icon: CheckCircle,
    },
    {
      title: "Transparent Pricing",
      description:
        "Clear rates per views. No hidden fees or confusing packages",
      icon: DollarSign,
    },
    {
      title: "Instant Reach",
      description:
        "Your ads start appearing on status updates within hours of approval",
      icon: Zap,
    },
    {
      title: "Mobile-First",
      description:
        "Designed for the way people actually use their phones and social media",
      icon: Smartphone,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />

      <main className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            How Seltra Works
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Two Ways to Use Seltra
          </h1>
          <p className="text-xl text-primary max-w-3xl mx-auto">
            Whether you want to earn money sharing ads or reach real people with
            your business, Seltra makes it simple and transparent.
          </p>
        </div>

        {/* Publisher Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-primary">
              For Publishers: Earn Money
            </h2>
            <p className="text-lg text-primary">
              Share ads on your social media and get paid per views
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {publisherSteps.map((step, index) => (
              <Card
                key={index}
                className="relative  border-[2px] shadow-lg hover:shadow-elevated transition-all duration-300"
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {step.step}
                    </span>
                  </div>
                  <step.icon className={`w-8 h-8 mx-auto mb-2 ${step.color}`} />
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-sm text-black">
                    {step.description}
                  </CardDescription>
                </CardContent>
                {index < publisherSteps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-8 h-8" />
                )}
              </Card>
            ))}
          </div>

          <Card className="shadow-card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-success" />
                Publisher Earning System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Daily</div>
                  <div className="text-sm text-muted-foreground">Payouts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">5%</div>
                  <div className="text-sm text-muted-foreground">
                    Referral Bonus
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Advertiser Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-accent">
              For Advertisers: Reach Real People
            </h2>
            <p className="text-lg text-muted-foreground">
              Create campaigns and reach authentic users with your business
              message
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {advertiserSteps.map((step, index) => (
              <Card
                key={index}
                className="relative shadow-card hover:shadow-elevated transition-all duration-300"
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {step.step}
                    </span>
                  </div>
                  <step.icon className={`w-8 h-8 mx-auto mb-2 ${step.color}`} />
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-sm">
                    {step.description}
                  </CardDescription>
                </CardContent>
                {index < advertiserSteps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-8 h-8" />
                )}
              </Card>
            ))}
          </div>

          <Card className="shadow-card bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Advertiser Pricing System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    Pay Per View
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Only for verified views
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Instant</div>
                  <div className="text-sm text-muted-foreground">
                    Campaign Approval
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">Real</div>
                  <div className="text-sm text-muted-foreground">Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Seltra?</h2>
            <p className="text-lg text-primary">
              The most transparent and effective way to connect advertisers with
              real people
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="shadow-card hover:shadow-elevated transition-all duration-300 text-center"
              >
                <CardHeader>
                  <benefit.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-black">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="shadow-card bg-gradient-to-r from-primary via-accent to-primary p-8 text-white">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">
                Ready to Get Started?
              </CardTitle>
              <CardDescription className="text-white/90 text-lg">
                Join thousands of users already earning and advertising on
                Seltra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/auth/signup">
                    Start as Publisher
                    <Users className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  asChild
                >
                  <Link href="/auth/signup">
                    Start as Advertiser
                    <Target className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
