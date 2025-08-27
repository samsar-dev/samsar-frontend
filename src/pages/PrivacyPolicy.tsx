import { Typography } from "@/utils/typography";
import { Shield, FileText, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SEO } from "@/utils/seo";

const PrivacyPolicy = () => {
  const pageTitle = "Privacy Policy - Samsar";
  const pageDescription = "Learn about Samsar's privacy policy and how we protect your personal data when using our platform for real estate and vehicles in Syria";
  const pageKeywords = "privacy policy, data protection, privacy and security, personal information, user protection, terms of use, email marketing, GDPR compliance";

  type SectionItem = {
    key: string;
    title?: string; // Add title as an optional property since it's used in the mapping
    icon: JSX.Element;
    content: JSX.Element;
  };


  const sections: SectionItem[] = [
    {
      key: "information_we_collect",
      title: "1. Information We Collect",
      icon: <Shield className="w-10 h-10 text-primary mb-4" />,
      content: (
        <>
          <Typography variant="body1" paragraph>
            We collect information you provide directly to us, such as when you create an account, list items for sale, or contact us for support.
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li>Personal information (name, email address, phone number)</li>
            <li>Account credentials and profile information</li>
            <li>Listing information (property/vehicle details, photos, descriptions)</li>
            <li>Communication data (messages, support inquiries)</li>
            <li>Payment information (processed securely by third-party providers)</li>
            <li>Device and usage information (IP address, browser type, usage patterns)</li>
          </ul>
          <Typography variant="body1" mt={2}>
            We may also collect information automatically through cookies and similar technologies when you use our platform.
          </Typography>
        </>
      ),
    },
    {
      key: "how_we_use",
      title: "2. How We Use Your Information",
      icon: <Shield className="w-10 h-10 text-primary mb-4" />,
      content: (
        <>
          <Typography variant="body1" paragraph>
            We use the information we collect for various purposes, including:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li>Providing and maintaining our platform services</li>
            <li>Processing transactions and managing your account</li>
            <li>Communicating with you about your account and transactions</li>
            <li>Sending important service notifications and updates</li>
            <li>Providing customer support and responding to inquiries</li>
            <li>Improving our platform and developing new features</li>
            <li>Detecting and preventing fraud and security threats</li>
            <li>Complying with legal obligations and enforcing our terms</li>
          </ul>
        </>
      ),
    },
    {
      key: "email_marketing",
      title: "3. Email Communications and Marketing",
      icon: <Mail className="w-10 h-10 text-primary mb-4" />,
      content: (
        <>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Transactional Emails
          </Typography>
          <Typography variant="body1" paragraph>
            We send transactional emails that are necessary for our service, including:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li>Account verification and password reset emails</li>
            <li>Transaction confirmations and receipts</li>
            <li>Important account and security notifications</li>
            <li>Service updates and maintenance notifications</li>
          </ul>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Marketing Emails
          </Typography>
          <Typography variant="body1" paragraph>
            We may send marketing emails only to users who have explicitly consented to receive them. These include:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li>Newsletter updates about new features and platform improvements</li>
            <li>Promotional offers and special deals</li>
            <li>Market insights and industry news</li>
          </ul>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Email Collection and Consent
          </Typography>
          <Typography variant="body1" paragraph>
            We collect email addresses through:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Account Registration:</strong> Required for platform access and transactional communications</li>
            <li><strong>Newsletter Signup:</strong> Optional opt-in during registration or through dedicated signup forms</li>
            <li><strong>Contact Forms:</strong> When you voluntarily provide your email for support or inquiries</li>
          </ul>
          <Typography variant="body1" paragraph>
            <strong>Important:</strong> We never purchase, rent, or acquire email lists from third parties. All email addresses in our system are collected directly from users with their explicit knowledge and consent.
          </Typography>
        </>
      ),
    },
    {
      key: "information_sharing",
      title: "4. Information Sharing and Disclosure",
      icon: <FileText className="w-10 h-10 text-primary mb-4" />,
      content: (
        <>
          <Typography variant="body1" paragraph>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li>With service providers who assist us in operating our platform (payment processors, hosting providers, email service providers)</li>
            <li>When required by law or to protect our rights and safety</li>
            <li>In connection with a business transfer or merger (with prior notice)</li>
            <li>With your explicit consent for specific purposes</li>
          </ul>
          <Typography variant="body1" mt={2}>
            All third-party service providers are bound by confidentiality agreements and are prohibited from using your information for any purpose other than providing services to us.
          </Typography>
        </>
      ),
    },
    {
      key: "your_choices",
      title: "5. Your Rights and Choices",
      icon: <Mail className="w-10 h-10 text-primary mb-4" />,
      content: (
        <>
          <Typography variant="body1" paragraph>
            You have several rights regarding your personal information and email communications:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Email Unsubscribe:</strong> You can unsubscribe from marketing emails at any time by clicking the unsubscribe link in any marketing email or by contacting us directly. Note that you cannot unsubscribe from essential transactional emails required for platform operation.</li>
            <li><strong>Account Access:</strong> You can access and update your account information at any time through your profile settings.</li>
            <li><strong>Data Deletion:</strong> You can request deletion of your account and associated data by contacting our support team.</li>
            <li><strong>Data Portability:</strong> You can request a copy of your personal data in a machine-readable format.</li>
            <li><strong>Correction:</strong> You can request correction of inaccurate personal information.</li>
            <li><strong>Consent Withdrawal:</strong> You can withdraw consent for marketing communications at any time without affecting the lawfulness of processing based on consent before withdrawal.</li>
          </ul>
          <Typography variant="body1" paragraph>
            <strong>Retention Policy:</strong> We retain email addresses for marketing purposes only as long as you maintain an active account and have not unsubscribed. Inactive accounts (no login for 2+ years) are automatically removed from marketing lists.
          </Typography>
        </>
      ),
    },
    {
      key: "data_security",
      title: "6. Data Security and International Transfers",
      icon: <Shield className="w-10 h-10 text-primary mb-4" />,
      content: (
        <>
          <Typography variant="body1" paragraph>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </Typography>
          <ul className="list-disc pl-6 mb-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Secure data centers and hosting infrastructure</li>
          </ul>
          <Typography variant="body1" paragraph>
            Our platform may transfer and process your information in countries other than your own. We ensure that such transfers comply with applicable data protection laws and provide adequate protection for your personal information.
          </Typography>
        </>
      ),
    },
  ];

  return (
    <div
      className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8"
      dir="ltr"
    >
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
      />
      <div className="animate-fadeInUp">
        <Typography
          variant="h1"
          component="h1"
          align="center"
          sx={{
            mb: 4,
            fontSize: { xs: "2rem", md: "2.5rem" },
            fontWeight: 700,
          }}
        >
          Privacy Policy
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 8, maxWidth: 800, mx: "auto" }}
        >
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 6 }}>
          Welcome to Samsar, a marketplace platform for vehicles and real estate in Syria. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our platform. By using our services, you agree to the collection and use of information in accordance with this policy.
        </Typography>
      </div>

      <div className="max-w-4xl mx-auto">
        {sections.map((section, index) => (
          <div
            key={section.key}
            className="animate-fadeInUp transition-all duration-500 delay-100"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Card className="p-6 md:p-8 mb-6 border rounded-lg transition-shadow hover:shadow-lg">
              <div className="mb-4">
                {section.icon}
                {section.title && (
                  <Typography
                    variant="h2"
                    component="h2"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    {section.title}
                  </Typography>
                )}
                {section.content}
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div
        className="animate-fadeInUp transition-all duration-500 delay-400"
        style={{ animationDelay: "0.4s" }}
      >
        <Card className="p-6 md:p-8 mb-6 border rounded-lg max-w-4xl mx-auto">
          <Typography
            variant="h2"
            component="h2"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            7. Changes to This Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.
          </Typography>
          <Typography
            variant="h3"
            component="h3"
            className="font-semibold mt-4 mb-2"
          >
            8. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, your data rights, or our data practices, please contact us:
          </Typography>
          <Typography variant="body1" paragraph>
            Email:{" "}
            <a
              href="mailto:privacy@samsar.app"
              className="text-primary hover:underline"
            >
              privacy@samsar.app
            </a>
            <br />
            General Contact:{" "}
            <a
              href="mailto:contact@samsar.app"
              className="text-primary hover:underline"
            >
              contact@samsar.app
            </a>
            <br />
            Phone: +963 11 123 4567
            <br />
            Address: Damascus, Syria
          </Typography>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
