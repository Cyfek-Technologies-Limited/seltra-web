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

export default function PrivacyPolicyPage() {
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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <CardDescription className="text-lg">
              NDPR-Compliant • Last Updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-sm">
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
                <p>
                  Seltra ("we," "our," "us") is committed to protecting your
                  privacy and complying with the Nigeria Data Protection
                  Regulation (NDPR) 2019. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your personal data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  2. Data Controller
                </h2>
                <p>
                  Seltra is the data controller for personal data processed
                  through our platform. Contact: privacy@seltra.app
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  3. Information We Collect
                </h2>

                <h3 className="font-semibold mt-4 mb-2">
                  Personal Information:
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, phone number</li>
                  <li>Bank account details for payments</li>
                  <li>Social media account information</li>
                  <li>Government-issued ID for verification</li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">Usage Information:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP address, browser type, device information</li>
                  <li>Campaign performance data</li>
                  <li>Publisher earnings and metrics</li>
                  <li>Communication records</li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">
                  Cookies and Tracking:
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Session cookies for platform functionality</li>
                  <li>Analytics cookies for service improvement</li>
                  <li>Advertising cookies for relevant content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  4. How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain our advertising platform</li>
                  <li>Process payments and calculate earnings</li>
                  <li>Verify publisher and advertiser accounts</li>
                  <li>Communicate about campaigns and platform updates</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal obligations under Nigerian law</li>
                  <li>Prevent fraud and ensure platform security</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  5. Legal Basis for Processing
                </h2>
                <p>We process your personal data based on:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Consent:</strong> When you explicitly agree to data
                    processing
                  </li>
                  <li>
                    <strong>Contract:</strong> To fulfill our obligations to you
                  </li>
                  <li>
                    <strong>Legal Obligation:</strong> To comply with Nigerian
                    laws
                  </li>
                  <li>
                    <strong>Legitimate Interests:</strong> For platform
                    operation and improvement
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  6. Data Sharing and Disclosure
                </h2>
                <p>We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> Payment processors,
                    cloud hosting
                  </li>
                  <li>
                    <strong>Business Partners:</strong> For integrated services
                    with consent
                  </li>
                  <li>
                    <strong>Legal Authorities:</strong> When required by
                    Nigerian law
                  </li>
                  <li>
                    <strong>Advertisers/Publishers:</strong> Limited campaign
                    performance data only
                  </li>
                </ul>
                <p className="mt-2">
                  We do not sell your personal data to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. Data Security</h2>
                <p>We implement appropriate security measures including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Regular security assessments and monitoring</li>
                  <li>Employee training on data protection</li>
                  <li>Secure data backup and recovery procedures</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  8. Data Retention
                </h2>
                <p>We retain personal data only as long as necessary for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fulfilling contractual obligations</li>
                  <li>
                    Legal and regulatory requirements (7 years for financial
                    records)
                  </li>
                  <li>Business purposes with legitimate interest</li>
                  <li>Resolving disputes and enforcing agreements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  9. Your NDPR Rights
                </h2>
                <p>Under NDPR, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Access:</strong> Request copies of your personal
                    data
                  </li>
                  <li>
                    <strong>Rectification:</strong> Correct inaccurate or
                    incomplete data
                  </li>
                  <li>
                    <strong>Erasure:</strong> Request deletion of your personal
                    data
                  </li>
                  <li>
                    <strong>Restriction:</strong> Limit processing of your data
                  </li>
                  <li>
                    <strong>Portability:</strong> Receive your data in
                    machine-readable format
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to certain processing
                    activities
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong> Withdraw consent at any
                    time
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  10. Exercising Your Rights
                </h2>
                <p>
                  To exercise your NDPR rights, contact us at
                  privacy@seltra.app. We will respond within 30 days as required
                  by law. We may need to verify your identity before processing
                  requests.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  11. International Data Transfers
                </h2>
                <p>
                  Your data may be transferred to and processed in countries
                  outside Nigeria. We ensure appropriate safeguards are in place
                  and require third parties to protect your data according to
                  NDPR standards.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  12. Cookies and Tracking Technologies
                </h2>
                <p>
                  We use cookies and similar technologies to enhance your
                  experience. You can control cookies through your browser
                  settings. Essential cookies are required for platform
                  functionality.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  13. Children's Privacy
                </h2>
                <p>
                  Our platform is not intended for users under 18 years. We do
                  not knowingly collect data from children. If we discover such
                  data, we will delete it immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  14. Data Protection Officer
                </h2>
                <p>
                  We have appointed a Data Protection Officer (DPO) to oversee
                  compliance with NDPR. Contact: dpo@seltra.app
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  15. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy. We will notify you of
                  significant changes and update the "Last Updated" date.
                  Continued use constitutes acceptance of changes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">16. Complaints</h2>
                <p>
                  If you have concerns about our data practices, contact us
                  first at privacy@seltra.app. You also have the right to lodge
                  a complaint with the National Information Technology
                  Development Agency (NITDA).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">
                  Contact Information
                </h2>
                <p>
                  Seltra
                  <br />
                  Email: privacy@seltra.app
                  <br />
                  Data Protection Officer: dpo@seltra.app
                  <br />
                  Address: Lagos, Nigeria
                  <br />
                  Phone: [Your Contact Number]
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
