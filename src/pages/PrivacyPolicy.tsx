import { Container, Box, Link, Paper } from "@mui/material";
import { Typography } from "@/utils/typography";
import { motion } from "framer-motion";
import PrivacyTip from "@mui/icons-material/PrivacyTip";
import Security from "@mui/icons-material/Security";
import Gavel from "@mui/icons-material/Gavel";
import ContactMail from "@mui/icons-material/ContactMail";
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
      icon: <PrivacyTip sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />,
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
      icon: <Security sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />,
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
      icon: <Gavel sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />,
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
      icon: <ContactMail sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />,
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
    <Container maxWidth="lg" sx={{ py: 8 }} dir="rtl">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
      </motion.div>

      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        {sections.map((section, index) => (
          <motion.div
            key={section.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                mb: 6,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                "&:hover": {
                  boxShadow: 3,
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Box sx={{ mb: 3 }}>
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
              </Box>
            </Paper>
          </motion.div>
        ))}
      </Box>

      {/* Changes to Policy and Contact Us Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 6,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            maxWidth: 900,
            mx: "auto",
            "&:hover": {
              boxShadow: 3,
            },
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{ fontWeight: 600, mb: 3, textAlign: "center" }}
          >
            {t("privacy_policy.sections.changes_to_policy.title")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("privacy_policy.sections.changes_to_policy.description")}
          </Typography>
          <Typography
            variant="h3"
            component="h3"
            sx={{ fontWeight: 600, mt: 4, mb: 2 }}
          >
            {t("privacy_policy.sections.contact_us.title")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("privacy_policy.sections.contact_us.description")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("email")}:{" "}
            <Link
              href={`mailto:${t("privacy_policy.sections.contact_us.email")}`}
              color="primary"
            >
              {t("privacy_policy.sections.contact_us.email")}
            </Link>
            <br />
            {t("phone")}: {t("privacy_policy.sections.contact_us.phone")}
            <br />
            {t("address")}:{" "}
            {t("privacy_policy.sections.contact_us.address", {
              joinArrays: "\n",
            })}
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default PrivacyPolicy;