import { Typography } from "@/utils/typography";
import { FileText, Shield, Scale, Info, Star, Mail, Building } from "lucide-react";
import { Card } from "@/components/ui/card";

import { useTranslation } from "react-i18next";
import { SEO } from "@/utils/seo";

const TermsOfService = () => {
  const { t } = useTranslation();

  // SEO Meta Tags
  const pageTitle = t("terms.meta_title", "شروط وأحكام الاستخدام - سمسار");
  const pageDescription = t(
    "terms.meta_description",
    "تعرف على الشروط والأحكام المنظمة لاستخدام منصة سمسار. يرجى قراءة هذه الشروط بعناية قبل استخدام المنصة.",
  );
  const pageKeywords = t(
    "terms.meta_keywords",
    "شروط الاستخدام, الشروط والأحكام, سياسة الاستخدام, قوانين الموقع, اتفاقية المستخدم, حقوق وواجبات المستخدمين, حماية الخصوصية, سمسار",
  );
  const sections = [
    {
      title: "1. Introduction",
      icon: <FileText className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            Welcome to our marketplace platform ("Platform"). These Terms of
            Service ("Terms") govern your access to and use of our website and
            services. Please read these Terms carefully before using the
            Platform.
          </Typography>
          <Typography component="p" paragraph>
            By accessing or using the Platform, you agree to be bound by these
            Terms and our Privacy Policy. If you do not agree to these Terms,
            you may not access or use the Platform.
          </Typography>
        </>
      ),
    },
    {
      title: "2. User Obligations",
      icon: <Scale className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            Our Platform allows users to list, buy, and sell vehicles and real
            estate properties. When using these features, you agree to:
          </Typography>
          <ul className="list-disc pl-4">
            <li>Provide accurate and complete information in all listings</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Not engage in any fraudulent, misleading, or deceptive practices</li>
            <li>Not post any content that is illegal, offensive, or infringes on others' rights</li>
          </ul>
          <Typography component="h4" sx={{ fontWeight: 600 }}>
            We reserve the right to remove any listings that violate these Terms
            or that we determine, in our sole discretion, to be inappropriate.
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
            <li>Be responsible for all activities that occur under your account</li>
            <li>Immediately notify us of any unauthorized use of your account</li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Content Guidelines",
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
      title: "5. Featured Offers Service (Coming Soon)",
      icon: <Star className="text-primary mr-2" />,
    },
    {
      title: "5. Privacy & Security",
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
      title: "6. Intellectual Property",
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
            <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials.</li>
            <li>You may store files that are automatically cached by your Web browser for display enhancement purposes.</li>
            <li>You may print or download one copy of a reasonable number of pages of the Platform for your own personal, non-commercial use.</li>
          </ul>
        </>
      ),
    },
    {
      title: "7. Limitation of Liability",
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
      title: "8. Contact Information",
      icon: <Mail className="text-primary mr-2" />,
      content: (
        <>
          <Typography component="p" paragraph>
            If you have any questions about these Terms, please contact us at:
          </Typography>
          <Typography component="p" paragraph>
            Email:{" "}
            <a href="mailto:contact@samsar.app" className="text-primary">
              contact@samsar.app
            </a>
            <br />
            Phone: +1 (555) 987-6543
            <br />
            Address: 123 Marketplace Street, New York, NY 10001, United States
          </Typography>
          <Typography component="p" paragraph>
            <strong>Effective Date:</strong> June 5, 2025
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
          <Typography variant="h2" component="h1" align="center" className="font-bold mb-3">
            Terms of Service
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" className="mb-8 max-w-800 mx-auto">
            Please read these Terms of Service carefully before using our
            Platform.
          </Typography>
        </div>

        <div className="max-w-5xl mx-auto">
          {sections.map((section, index) => (
            <div className="animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
              <Card className="p-6 md:p-8 mb-4 border rounded-lg">
                <div className="flex items-center mb-3">
                  {section.icon}
                  <Typography
                    variant="h4"
                    component="h2"
                    className="font-bold"
                  >
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
