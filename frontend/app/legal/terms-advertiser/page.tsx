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

export default function AdvertiserTermsPage() {
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
              Advertiser Terms of Service
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
                  By creating an advertising campaign on Seltra ("Platform"),
                  you agree to be bound by these Terms of Service, our Privacy
                  Policy, and all applicable laws and regulations of the Federal
                  Republic of Nigeria.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  2. Campaign Approval Process
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All campaigns undergo review within 24-48 hours</li>
                  <li>
                    We reserve the right to reject any campaign without
                    explanation
                  </li>
                  <li>
                    Approved campaigns may still be removed if they violate
                    terms later
                  </li>
                  <li>
                    Modifications to approved campaigns require re-approval
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. Payment Terms</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Payment:</strong> Full payment required before
                    campaign activation
                  </li>
                  <li>
                    <strong>No Refunds:</strong> All payments are final and
                    non-refundable
                  </li>
                  <li>
                    <strong>Payment Methods:</strong> Paystack, Flutterwave,
                    bank transfer
                  </li>
                  <li>
                    <strong>Taxes:</strong> Advertisers responsible for all
                    applicable taxes
                  </li>
                  <li>
                    <strong>Pricing:</strong> We reserve right to change pricing
                    with notice
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  4. Prohibited Content
                </h2>
                <p>We do not allow campaigns containing:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>False, misleading, or deceptive claims</li>
                  <li>Illegal products, services, or activities</li>
                  <li>Adult content, pornography, or explicit material</li>
                  <li>Hate speech, discrimination, or harassment</li>
                  <li>Violence, terrorism, or harmful activities</li>
                  <li>Unapproved financial or investment schemes</li>
                  <li>Content infringing intellectual property rights</li>
                  <li>Malware, spyware, or harmful software</li>
                  <li>Content violating platform-specific policies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  5. Intellectual Property Rights
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Advertisers warrant they own or have rights to all ad
                    content
                  </li>
                  <li>
                    Advertisers grant Seltra license to display ads on publisher
                    platforms
                  </li>
                  <li>
                    Advertisers indemnify Seltra against IP infringement claims
                  </li>
                  <li>
                    Seltra's platform technology and branding remain proprietary
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  6. Performance Disclaimer
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We do not guarantee specific performance results</li>
                  <li>Actual impressions and engagement may vary</li>
                  <li>External factors may affect campaign performance</li>
                  <li>Publishers are independent contractors, not employees</li>
                  <li>We are not liable for publisher actions or content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  7. Campaign Metrics & Analytics
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    We provide estimated metrics based on publisher reporting
                  </li>
                  <li>Metrics are for informational purposes only</li>
                  <li>We cannot verify 100% accuracy of all impressions</li>
                  <li>Analytics data is provided "as is" without warranties</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  8. Data Protection
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    We comply with Nigeria Data Protection Regulation (NDPR)
                  </li>
                  <li>
                    Campaign data is processed for platform operation only
                  </li>
                  <li>We implement reasonable security measures</li>
                  <li>Advertisers must comply with data protection laws</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  9. Termination & Suspension
                </h2>
                <p>We may suspend or terminate campaigns for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violation of these terms or applicable laws</li>
                  <li>Poor quality or misleading ad content</li>
                  <li>Payment issues or fraudulent activity</li>
                  <li>Legal or regulatory requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  10. Limitation of Liability
                </h2>
                <p>
                  Seltra's total liability shall not exceed the amount paid for
                  the specific campaign in question. We are not liable for
                  indirect, incidental, or consequential damages.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  11. Indemnification
                </h2>
                <p>
                  Advertisers agree to indemnify and hold harmless Seltra from
                  any claims, damages, or losses arising from their campaigns,
                  content, or violation of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  12. Governing Law & Dispute Resolution
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Governing Law:</strong> Laws of the Federal Republic
                    of Nigeria
                  </li>
                  <li>
                    <strong>Jurisdiction:</strong> Courts of Lagos State,
                    Nigeria
                  </li>
                  <li>
                    <strong>Dispute Resolution:</strong> Amicable settlement,
                    then mediation, then arbitration
                  </li>
                </ul>
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
