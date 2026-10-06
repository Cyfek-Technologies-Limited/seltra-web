import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PublisherTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">
              Publisher Terms of Service
            </CardTitle>
            <CardDescription className="text-lg">
              Last Updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-sm">
              <section>
                <h2 className="text-xl font-semibold mb-4">
                  1. Agreement to Terms
                </h2>
                <p>
                  By registering as a Publisher on Seltra ("Platform"), you
                  agree to be bound by these Terms of Service, our Privacy
                  Policy, and all applicable laws and regulations of the Federal
                  Republic of Nigeria, including the Nigeria Data Protection
                  Regulation (NDPR) 2019.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  2. Publisher Eligibility
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Must be at least 18 years old</li>
                  <li>
                    Must be a resident of Nigeria or operate primarily within
                    Nigeria
                  </li>
                  <li>
                    Must own and control the social media accounts being
                    monetized
                  </li>
                  <li>Must have authentic engagement and followers</li>
                  <li>
                    Must comply with all platform-specific terms (WhatsApp,
                    Instagram, Twitter, etc.)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  3. Publisher Responsibilities
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Post approved ad content exactly as provided without
                    modification
                  </li>
                  <li>Maintain the ad content for the specified duration</li>
                  <li>Provide accurate proof of posting when requested</li>
                  <li>Ensure content complies with all applicable laws</li>
                  <li>
                    Do not engage in fraudulent activities or artificial
                    inflation
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. Payment Terms</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Payment Schedule:</strong> Net-30 days from campaign
                    completion
                  </li>
                  <li>
                    <strong>Minimum Payout:</strong> ₦3,000
                  </li>
                  <li>
                    <strong>Payment Methods:</strong> Bank transfer, verified
                    digital wallets
                  </li>

                  <li>
                    <strong>Taxes:</strong> Publishers are responsible for
                    applicable taxes
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  5. Prohibited Content
                </h2>
                <p>Publishers must not post content that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contains false or misleading information</li>
                  <li>Promotes illegal activities or regulated substances</li>
                  <li>Contains hate speech, discrimination, or harassment</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains adult, explicit, or pornographic material</li>
                  <li>Promotes violence, terrorism, or harmful activities</li>
                  <li>Violates platform-specific community guidelines</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  6. Intellectual Property
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Advertisers retain all rights to ad creative content</li>
                  <li>
                    Publishers receive limited license to display ads as
                    specified
                  </li>
                  <li>
                    No modification or republication of ad content allowed
                  </li>
                  <li>Platform branding and technology are proprietary</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  7. Data Protection (NDPR Compliance)
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    We collect only necessary personal data for platform
                    operation
                  </li>
                  <li>
                    Data is processed in accordance with NDPR requirements
                  </li>
                  <li>
                    Publishers have right to access, correct, and delete
                    personal data
                  </li>
                  <li>
                    We implement appropriate security measures to protect data
                  </li>
                  <li>
                    Data may be shared with advertisers for campaign analytics
                    only
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">8. Termination</h2>
                <p>We may suspend or terminate your account for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violation of these terms or platform policies</li>
                  <li>Fraudulent or artificial engagement</li>
                  <li>Failure to post approved ads as required</li>
                  <li>Posting prohibited content</li>
                  <li>Legal or regulatory requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  9. Limitation of Liability
                </h2>
                <p>
                  Seltra shall not be liable for any indirect, incidental,
                  special, or consequential damages arising from your use of the
                  platform. Our total liability shall not exceed the amount paid
                  to you in the preceding 3 months.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  10. Dispute Resolution
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Negotiation:</strong> Parties shall first attempt to
                    resolve disputes amicably
                  </li>
                  <li>
                    <strong>Mediation:</strong> If unresolved, parties shall
                    seek mediation in Lagos State
                  </li>
                  <li>
                    <strong>Arbitration:</strong> Failing mediation, disputes
                    shall be referred to arbitration under Nigerian law
                  </li>
                  <li>
                    <strong>Governing Law:</strong> Laws of the Federal Republic
                    of Nigeria
                  </li>
                  <li>
                    <strong>Jurisdiction:</strong> Courts of Lagos State,
                    Nigeria
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  11. Changes to Terms
                </h2>
                <p>
                  We may modify these terms at any time. Continued use of the
                  platform after changes constitutes acceptance of the modified
                  terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Contact Information
                </h2>
                <p>
                  For questions about these Terms, contact us at:
                  <br />
                  Email: legal@seltra.app
                  <br />
                  Address: Lagos, Nigeria
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
