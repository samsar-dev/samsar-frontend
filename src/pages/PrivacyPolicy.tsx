import { Typography } from "@/utils/typography";
import { Shield, FileText, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { SEO } from "@/utils/seo";

const PrivacyPolicy = () => {
  const { t } = useTranslation("footer");
  const pageTitle = t("privacy_policy.meta_title", "سياسة الخصوصية - سمسار");
  const pageDescription = t(
    "privacy_policy.meta_description",
    "تعرف على سياسة الخصوصية لموقع سمسار وكيفية حماية بياناتك الشخصية عند استخدام منصتنا للعقارات والمركبات في سوريا",
  );
  const pageKeywords = t(
    "privacy_policy.meta_keywords",
    "سياسة الخصوصية, حماية البيانات, الخصوصية والأمان, معلومات شخصية, حماية المستخدمين, شروط الاستخدام",
  );

  type SectionItem = {
    key: string;
    title?: string; // Add title as an optional property since it's used in the mapping
    icon: JSX.Element;
    content: JSX.Element;
  };

  type ChoiceItem = {
    label: string;
    text: string;
  };

  const sections: SectionItem[] = [
    {
      key: "information_we_collect",
      icon: <Shield className="w-10 h-10 text-primary mb-4" />,
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t("privacy_policy.sections.information_we_collect.description")}
          </Typography>
          <ul>
            {(
              t("privacy_policy.sections.information_we_collect.items", {
                returnObjects: true,
              }) as string[]
            ).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <Typography variant="body1" mt={2}>
            {t(
              "privacy_policy.sections.information_we_collect.additional_info",
            )}
          </Typography>
        </>
      ),
    },
    {
      key: "how_we_use",
      icon: <Shield className="w-10 h-10 text-primary mb-4" />,
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t("privacy_policy.sections.how_we_use.description")}
          </Typography>
          <ul>
            {(
              t("privacy_policy.sections.how_we_use.items", {
                returnObjects: true,
              }) as string[]
            ).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      key: "information_sharing",
      icon: <FileText className="w-10 h-10 text-primary mb-4" />,
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t("privacy_policy.sections.information_sharing.description")}
          </Typography>
          <ul>
            {(
              t("privacy_policy.sections.information_sharing.items", {
                returnObjects: true,
              }) as string[]
            ).map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <Typography variant="body1" mt={2}>
            {t("privacy_policy.sections.information_sharing.additional_info")}
          </Typography>
        </>
      ),
    },
    {
      key: "your_choices",
      icon: <Mail className="w-10 h-10 text-primary mb-4" />,
      content: (
        <>
          <Typography variant="body1" paragraph>
            {t("privacy_policy.sections.your_choices.description")}
          </Typography>
          <ul>
            {(
              t("privacy_policy.sections.your_choices.items", {
                returnObjects: true,
              }) as ChoiceItem[]
            ).map((item: ChoiceItem, index: number) => (
              <li key={index}>
                <strong>{item.label}</strong> {item.text}
              </li>
            ))}
          </ul>
        </>
      ),
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
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
          {t("privacy_policy.title", "سياسة الخصوصية")}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 8, maxWidth: 800, mx: "auto" }}
        >
          {t("privacy_policy.last_updated")}
        </Typography>
        <Typography variant="body1" paragraph sx={{ mb: 6 }}>
          {t("privacy_policy.welcome")}
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

      {/* Changes to Policy and Contact Us Section */}
      <div
        className="animate-fadeInUp transition-all duration-500 delay-400"
        style={{ animationDelay: "0.4s" }}
      >
        <Card className="p-6 md:p-8 mb-6 border rounded-lg max-w-4xl mx-auto">
          <Typography
            variant="h2"
            component="h2"
            className="font-semibold mb-3 text-center"
          >
            {t("privacy_policy.sections.changes_to_policy.title")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("privacy_policy.sections.changes_to_policy.description")}
          </Typography>
          <Typography
            variant="h3"
            component="h3"
            className="font-semibold mt-4 mb-2"
          >
            {t("privacy_policy.sections.contact_us.title")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("privacy_policy.sections.contact_us.description")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("email")}:{" "}
            <a
              href={`mailto:${t("privacy_policy.sections.contact_us.email")}`}
              className="text-primary hover:underline"
            >
              {t("privacy_policy.sections.contact_us.email")}
            </a>
            <br />
            {t("phone")}: {t("privacy_policy.sections.contact_us.phone")}
            <br />
            {t("address")}:{" "}
            {t("privacy_policy.sections.contact_us.address", {
              joinArrays: "\n",
            })}
          </Typography>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;