import { Typography } from "@/utils/typography";
import {
  FileText,
  Shield,
  Scale,
  Info,
  Star,
  Mail,
  Building,
} from "lucide-react";
import { Card } from "@/components/ui/card";

import { SEO } from "@/utils/seo";

const TermsOfService = () => {
  // SEO Meta Tags
  const pageTitle = "Terms of Service - Samsar";
  const pageDescription = "Read the terms and conditions governing the use of Samsar platform. Please read these terms carefully before using the platform.";
  const pageKeywords = "terms of service, terms and conditions, usage policy, website rules, user agreement, user rights and obligations, privacy protection, email marketing compliance";
  const sections = [
    {
      title: "1. Introduction",
      icon: <FileText className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            Welcome to Samsar, a marketplace platform for vehicles and real estate in Syria ("Platform"). These Terms of
            Service ("Terms") govern your access to and use of our website and
            services. Please read these Terms carefully before using the
            Platform.
          </Typography>
          <Typography component="p" paragraph>
            By accessing or using the Platform, you agree to be bound by these
            Terms and our Privacy Policy. If you do not agree to these Terms,
            you may not access or use the Platform. These Terms constitute a legally binding agreement between you and Samsar.
          </Typography>
        </>
      ),
    },
    {
      title: "2. User Obligations and Acceptable Use",
      icon: <Scale className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            Our Platform allows users to list, buy, and sell vehicles and real
            estate properties. When using these features, you agree to:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate and complete information in all listings</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Not engage in any fraudulent, misleading, or deceptive practices</li>
            <li>Not post any content that is illegal, offensive, or infringes on others' rights</li>
            <li>Not use the Platform for spam or unsolicited communications</li>
            <li>Respect other users' privacy and data protection rights</li>
            <li>Not attempt to circumvent our security measures or access unauthorized areas</li>
          </ul>
          <Typography component="p" paragraph sx={{ fontWeight: 600 }}>
            We reserve the right to remove any listings that violate these Terms
            or that we determine, in our sole discretion, to be inappropriate. Repeated violations may result in account suspension or termination.
          </Typography>
        </>
      ),
    },
    {
      title: "3. Account Registration",
      icon: <Building className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            To access certain features of the Platform, you may be required to
            create an account. When creating an account, you agree to:
          </Typography>
          <ul className="list-disc pl-4">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>
              Be responsible for all activities that occur under your account
            </li>
            <li>
              Immediately notify us of any unauthorized use of your account
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Email Communications and Marketing",
      icon: <Mail className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Email Collection and Consent
          </Typography>
          <Typography component="p" paragraph>
            By creating an account on our Platform, you consent to receive transactional emails necessary for platform operation. These include account verification, security notifications, transaction confirmations, and important service updates.
          </Typography>
          <Typography component="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Marketing Communications
          </Typography>
          <Typography component="p" paragraph>
            We may send marketing emails (newsletters, promotional offers, platform updates) only to users who have explicitly opted in to receive such communications. You can:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li>Opt in to marketing emails during account registration or through your profile settings</li>
            <li>Unsubscribe from marketing emails at any time using the unsubscribe link in any marketing email</li>
            <li>Contact us directly to manage your email preferences</li>
          </ul>
          <Typography component="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Anti-Spam Compliance
          </Typography>
          <Typography component="p" paragraph>
            We maintain strict anti-spam policies and comply with applicable email marketing laws. We:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li>Never purchase, rent, or acquire email lists from third parties</li>
            <li>Only send marketing emails to users who have explicitly consented</li>
            <li>Provide clear and easy unsubscribe mechanisms in all marketing emails</li>
            <li>Honor unsubscribe requests immediately and automatically</li>
            <li>Maintain suppression lists to prevent sending to users who have unsubscribed</li>
          </ul>
          <Typography component="p" paragraph>
            <strong>Important:</strong> You cannot unsubscribe from essential transactional emails required for platform security and operation.
          </Typography>
        </>
      ),
    },
    {
      title: "5. Payment Terms and Fees",
      icon: <Info className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            Certain features of the Platform may require payment of fees. All
            fees are in USD and are non-refundable unless otherwise stated. You
            are responsible for paying all applicable taxes.
          </Typography>
          <Typography component="p" paragraph>
            We use third-party payment processors to facilitate transactions. By
            making a payment through the Platform, you agree to the terms and
            conditions and privacy policy of the applicable payment processor.
          </Typography>
        </>
      ),
    },
    {
      title: "6. Featured Offers Service (Coming Soon)",
      icon: <Star className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            We plan to introduce featured listing services that will allow users to promote their listings for increased visibility. Details about pricing, terms, and conditions for these services will be provided before launch.
          </Typography>
        </>
      ),
    },
    {
      title: "7. Privacy & Security",
      icon: <Shield className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            Your privacy is important to us. Our Privacy Policy explains how we
            collect, use, and protect your personal information. By using the
            Platform, you consent to our collection and use of your information
            as described in the Privacy Policy.
          </Typography>
          <Typography component="p" paragraph>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. You agree to immediately notify us of any unauthorized use
            of your account or any other breach of security.
          </Typography>
        </>
      ),
    },
    {
      title: "8. Intellectual Property",
      icon: <FileText className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            The Platform and its entire contents, features, and functionality
            (including but not limited to all information, software, text,
            displays, images, video, and audio, and the design, selection, and
            arrangement thereof) are owned by us, our licensors, or other
            providers of such material and are protected by copyright,
            trademark, patent, trade secret, and other intellectual property or
            proprietary rights laws.
          </Typography>
          <Typography component="p" paragraph>
            You may use the Platform for your personal, non-commercial use only.
            You must not reproduce, distribute, modify, create derivative works
            of, publicly display, publicly perform, republish, download, store,
            or transmit any of the material on our Platform, except as follows:
          </Typography>
          <ul className="list-disc pl-4">
            <li>
              Your computer may temporarily store copies of such materials in
              RAM incidental to your accessing and viewing those materials.
            </li>
            <li>
              You may store files that are automatically cached by your Web
              browser for display enhancement purposes.
            </li>
            <li>
              You may print or download one copy of a reasonable number of pages
              of the Platform for your own personal, non-commercial use.
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "9. Limitation of Liability",
      icon: <Star className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            To the maximum extent permitted by law, in no event shall we be
            liable for any indirect, punitive, incidental, special,
            consequential, or exemplary damages, including without limitation
            damages for loss of profits, goodwill, use, data, or other
            intangible losses, that result from the use of, or inability to use,
            the Platform.
          </Typography>
          <Typography component="p" paragraph>
            In no event shall our total liability to you for all damages,
            losses, and causes of action exceed the amount you have paid us in
            the past six (6) months, or, if greater, one hundred U.S. dollars
            (USD $100).
          </Typography>
        </>
      ),
    },
    {
      title: "10. Termination and Account Suspension",
      icon: <Scale className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            We reserve the right to suspend or terminate your account at any time for violations of these Terms, including but not limited to:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li>Sending spam or unsolicited communications through our platform</li>
            <li>Providing false or misleading information in listings</li>
            <li>Engaging in fraudulent or illegal activities</li>
            <li>Violating other users' rights or our community guidelines</li>
            <li>Attempting to circumvent our security measures</li>
          </ul>
          <Typography component="p" paragraph>
            Upon termination, your access to the Platform will be immediately revoked, and we may delete your account data in accordance with our Privacy Policy. You may also terminate your account at any time by contacting our support team.
          </Typography>
        </>
      ),
    },
    {
      title: "11. Changes to Terms",
      icon: <FileText className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            We may modify these Terms from time to time to reflect changes in our services, legal requirements, or business practices. We will notify users of material changes by:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li>Posting the updated Terms on our Platform</li>
            <li>Sending email notifications to registered users</li>
            <li>Displaying prominent notices on our Platform</li>
          </ul>
          <Typography component="p" paragraph>
            Your continued use of the Platform after such modifications constitutes acceptance of the updated Terms. If you do not agree to the modified Terms, you should discontinue use of the Platform.
          </Typography>
        </>
      ),
    },
    {
      title: "12. Contact Information",
      icon: <Mail className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            If you have any questions about these Terms, email marketing practices, or need to manage your communication preferences, please contact us at:
          </Typography>
          <Typography component="p" paragraph>
            General Contact:{" "}
            <a href="mailto:contact@samsar.app" className="text-primary">
              contact@samsar.app
            </a>
            <br />
            Legal & Privacy:{" "}
            <a href="mailto:legal@samsar.app" className="text-primary">
              legal@samsar.app
            </a>
            <br />
            Email Preferences:{" "}
            <a href="mailto:unsubscribe@samsar.app" className="text-primary">
              unsubscribe@samsar.app
            </a>
            <br />
            Phone: +963 11 123 4567
            <br />
            Address: Damascus, Syria
          </Typography>
          <Typography component="p" paragraph>
            <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </>
      ),
    },
  ];

  return (
    <div className="py-8 bg-background">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
      />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeInUp">
          <Typography
            variant="h2"
            component="h1"
            align="center"
            className="font-bold mb-3"
          >
            Terms of Service
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            className="mb-8 max-w-800 mx-auto"
          >
            Please read these Terms of Service carefully before using our
            Platform. These terms include important information about email communications and marketing compliance.
          </Typography>
        </div>

        <div className="max-w-5xl mx-auto">
          {sections.map((section, index) => (
            <div
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="p-6 md:p-8 mb-4 border rounded-lg">
                <div className="flex items-center mb-3">
                  {section.icon}
                  <Typography variant="h4" component="h2" className="font-bold">
                    {section.title}
                  </Typography>
                </div>
                {section.content}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
