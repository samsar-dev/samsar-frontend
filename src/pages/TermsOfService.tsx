import Container from "@mui/material/Container";
import { Typography } from "@/utils/typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { motion } from "framer-motion";
import Gavel from "@mui/icons-material/Gavel";
import Description from "@mui/icons-material/Description";
import AccountBalance from "@mui/icons-material/AccountBalance";
import Security from "@mui/icons-material/Security";
import Policy from "@mui/icons-material/Policy";
import ContactSupport from "@mui/icons-material/ContactSupport";
import Star from "@mui/icons-material/Star";
import InfoIcon from "@mui/icons-material/Info";

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
      icon: <Description sx={{ color: "primary.main", mr: 2 }} />,
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
      title: "2. User Accounts",
      icon: <AccountBalance sx={{ color: "primary.main", mr: 2 }} />,
      content: (
        <>
          <Typography component="p" paragraph>
            To access certain features of the Platform, you may be required to
            create an account. When creating an account, you agree to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>•</ListItemIcon>
              <ListItemText primary="Provide accurate, current, and complete information" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>•</ListItemIcon>
              <ListItemText primary="Maintain the security of your account credentials" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>•</ListItemIcon>
              <ListItemText primary="Be responsible for all activities that occur under your account" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>•</ListItemIcon>
              <ListItemText primary="Immediately notify us of any unauthorized use of your account" />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      title: "3. Listings and Transactions",
      icon: <Gavel sx={{ color: "primary.main", mr: 2 }} />,
      content: (
        <>
          <Typography component="p" paragraph>
            Our Platform allows users to list, buy, and sell vehicles and real
            estate properties. When using these features, you agree to:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>•</ListItemIcon>
              <ListItemText primary="Provide accurate and complete information in all listings" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>•</ListItemIcon>
              <ListItemText primary="Comply with all applicable laws and regulations" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>•</ListItemIcon>
              <ListItemText primary="Not engage in any fraudulent, misleading, or deceptive practices" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>•</ListItemIcon>
              <ListItemText primary="Not post any content that is illegal, offensive, or infringes on others' rights" />
            </ListItem>
          </List>
          <Typography component="h4" sx={{ fontWeight: 600 }}>
            We reserve the right to remove any listings that violate these Terms
            or that we determine, in our sole discretion, to be inappropriate.
          </Typography>
        </>
      ),
    },
    {
      title: "4. Fees and Payments",
      icon: <Policy sx={{ color: "primary.main", mr: 2 }} />,
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
      icon: <Star sx={{ color: "primary.main", mr: 2 }} />,
    },
    {
      title: "5. Privacy and Security",
      icon: <Security sx={{ color: "primary.main", mr: 2 }} />,
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
      icon: <Description sx={{ color: "primary.main", mr: 2 }} />,
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
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>•</ListItemIcon>
              <ListItemText primary="Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>•</ListItemIcon>
              <ListItemText primary="You may store files that are automatically cached by your Web browser for display enhancement purposes." />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>•</ListItemIcon>
              <ListItemText primary="You may print or download one copy of a reasonable number of pages of the Platform for your own personal, non-commercial use." />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      title: "7. Limitation of Liability",
      icon: <Security sx={{ color: "primary.main", mr: 2 }} />,
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
      title: "8. Changes to These Terms",
      icon: <ContactSupport sx={{ color: "primary.main", mr: 2 }} />,
      content: (
        <>
          <Typography component="p" paragraph>
            We may update these Terms from time to time. If we make material
            changes, we will notify you by email or by posting a notice on the
            Platform prior to the effective date of the changes. Your continued
            use of the Platform following the posting of revised Terms means
            that you accept and agree to the changes.
          </Typography>
        </>
      ),
    },
    {
      title: "9. Contact Us",
      icon: <ContactSupport sx={{ color: "primary.main", mr: 2 }} />,
      content: (
        <>
          <Typography component="p" paragraph>
            If you have any questions about these Terms, please contact us at:
          </Typography>
          <Typography component="p" paragraph>
            Email:{" "}
            <Link href="mailto:contact@samsar.app" color="primary">
              contact@samsar.app
            </Link>
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
    <Box sx={{ py: 8, bgcolor: "background.default" }}>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={pageKeywords}
      />
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h2" component="h1" align="center" sx={{ fontWeight: 700, mb: 3 }}>
            Terms of Service
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 8, maxWidth: 800, mx: "auto" }}>
            Please read these Terms of Service carefully before using our
            Platform.
          </Typography>
        </motion.div>

        <Box sx={{ maxWidth: 1000, mx: "auto" }}>
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 5 },
                  mb: 4,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  {section.icon}
                  <Typography
                    variant="h4"
                    component="h2"
                    sx={{ fontWeight: 600 }}
                  >
                    {section.title}
                  </Typography>
                </Box>
                {section.content}
              </Paper>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default TermsOfService;
