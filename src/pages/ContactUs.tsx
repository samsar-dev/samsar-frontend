import { useState } from "react";
 import Container from "@mui/material/Container";
import { Typography } from "@/utils/typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Paper } from "@/utils/paper";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { motion } from "framer-motion";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useTranslation } from "react-i18next";
import { apiClient } from "../api/apiClient";
import { SEO } from "@/utils/seo";

const FormRow = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
    {children}
  </Box>
);

const FormField = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ flex: `1 1 calc(50% - 12px)`, minWidth: "250px" }}>{children}</Box>
);

const StyledPaper = ({ children, ...props }) => (
  <Box
    component={Paper}
    sx={{
      p: 4,
      borderRadius: (theme) => theme.shape.borderRadius,
      boxShadow: (theme) => theme.shadows[4],
      height: '100%',
    }}
    {...props}
  >
    {children}
  </Box>
);

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

const ContactUs = () => {
  const { t } = useTranslation("footer");
  const pageTitle = t('contact_page.meta_title', 'اتصل بنا - سمسار');
  const pageDescription = t('contact_page.meta_description', 'تواصل مع فريق سمسار للحصول على الدعم الفني أو الاستفسارات المتعلقة بالسيارات والعقارات في سوريا. نحن هنا لمساعدتك على مدار الساعة');
  const pageKeywords = t('contact_page.meta_keywords', 'اتصل بنا, تواصل مع سمسار, دعم فني, استفسارات, شكاوى, اقتراحات, معلومات الاتصال, وسائل التواصل');
  
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    open: boolean;
    success: boolean;
    message: string;
  }>({ open: false, success: false, message: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) errors.subject = "Subject is required";
    if (!formData.message.trim()) errors.message = "Message is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started", { formData });

    if (!validateForm()) {
      console.log("Form validation failed", { formErrors });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Sending request to server...");
      const response = await apiClient.post("/contact", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Server response:", response.data);

      if (response.data.success) {
        setSubmitStatus({
          open: true,
          success: true,
          message:
            "Your message has been sent successfully! We will get back to you soon.",
        });
        // Reset form on success
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(response.data.error || "Failed to send message");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send message. Please try again.";
      setSubmitStatus({
        open: true,
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSubmitStatus((prev) => ({ ...prev, open: false }));
  };

  // Form submission handler is defined above in the file

  return (
    <Box sx={{ py: 8, bgcolor: "background.default" }} dir="rtl">
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
          <Typography
            variant="h2"
            component="h1"
            align="center"
            sx={{
              fontWeight: 700,
              mb: 4,
              fontSize: { xs: 32, md: 40 },
            }}
          >
            {t("contact_page.title")}
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            align="center"
            sx={{
              mb: 6,
              maxWidth: 700,
              mx: "auto",
              typography: "body1",
            }}
          >
            {t("contact_page.subtitle")}
          </Typography>
        </motion.div>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          <Box
            sx={{
              flex: "1 1 100%",
              "@media (min-width: 900px)": { flex: "1 1 calc(60% - 32px)" },
            }}
          >
            <StyledPaper>
              <form onSubmit={handleSubmit} noValidate>
                <FormRow>
                  <FormField>
                    <TextField
                      required
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label={t("contact_page.form.firstName")}
                      variant="outlined"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={!!formErrors.firstName}
                      helperText={formErrors.firstName}
                      disabled={isSubmitting}
                    />
                  </FormField>
                  <FormField>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      name="lastName"
                      label={t("contact_page.form.lastName")}
                      variant="outlined"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={!!formErrors.lastName}
                      helperText={formErrors.lastName}
                      disabled={isSubmitting}
                    />
                  </FormField>
                </FormRow>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    name="email"
                    label={t("contact_page.form.email")}
                    type="email"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    disabled={isSubmitting}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    required
                    fullWidth
                    id="subject"
                    name="subject"
                    label={t("contact_page.form.subject")}
                    variant="outlined"
                    value={formData.subject}
                    onChange={handleChange}
                    error={!!formErrors.subject}
                    helperText={formErrors.subject}
                    disabled={isSubmitting}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    required
                    fullWidth
                    id="message"
                    name="message"
                    label={t("contact_page.form.message")}
                    multiline
                    rows={6}
                    variant="outlined"
                    value={formData.message}
                    onChange={handleChange}
                    error={!!formErrors.message}
                    helperText={formErrors.message}
                    disabled={isSubmitting}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<SendIcon />}
                  fullWidth
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress
                        size={24}
                        color="inherit"
                        style={{ marginRight: 8 }}
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <SendIcon sx={{ mr: 1 }} />
                      {t("contact_page.form.sendButton")}
                    </>
                  )}
                </Button>

                <Snackbar
                  open={submitStatus.open}
                  autoHideDuration={6000}
                  onClose={handleCloseSnackbar}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                  <Alert
                    onClose={handleCloseSnackbar}
                    severity={submitStatus.success ? "success" : "error"}
                    sx={{ width: "100%" }}
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={handleCloseSnackbar}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  >
                    {submitStatus.message}
                  </Alert>
                </Snackbar>
              </form>
            </StyledPaper>
          </Box>
          <Box
            sx={{
              flex: "1 1 100%",
              "@media (min-width: 900px)": { flex: "1 1 calc(40% - 32px)" },
            }}
          >
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <StyledPaper>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: 600, mb: 4 }}
                  >
                    {t("contact_page.contactInfo.title")}
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}
                  >
                    <LocationOnIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {t("contact_page.contactInfo.office.label")}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {t("contact_page.contactInfo.office.address1")}
                        <br />
                        {t("contact_page.contactInfo.office.address2")}
                        <br />
                        {t("contact_page.contactInfo.office.address3")}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <PhoneIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {t("contact_page.contactInfo.phone.label")}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {t("contact_page.contactInfo.phone.number")}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <EmailIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {t("contact_page.contactInfo.email.label")}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {t("contact_page.contactInfo.email.address")}
                      </Typography>
                    </Box>
                  </Box>
                </StyledPaper>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <StyledPaper>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: 600, mb: 4 }}
                  >
                    {t("contact_page.businessHours.title")}
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Box
                    sx={{
                      "& > div": {
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                      },
                    }}
                  >
                    <Box>
                      <Typography component="span" sx={{ fontWeight: 500 }}>
                        {t("contact_page.businessHours.weekdays")}
                      </Typography>
                    </Box>
                    <Typography>
                      {t("contact_page.businessHours.weekdaysTime")}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      "& > div": {
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                        color: "text.secondary",
                      },
                    }}
                  >
                    <Box>
                      <Typography component="span">
                        {t("contact_page.businessHours.saturday")}
                      </Typography>
                    </Box>
                    <Typography>
                      {t("contact_page.businessHours.saturdayTime")}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      "& > div": {
                        display: "flex",
                        justifyContent: "space-between",
                        color: "text.secondary",
                      },
                    }}
                  >
                    <Box>
                      <Typography component="span">
                        {t("contact_page.businessHours.sunday")}
                      </Typography>
                    </Box>
                    <Typography>
                      {t("contact_page.businessHours.sundayTime")}
                    </Typography>
                  </Box>
                </StyledPaper>
              </motion.div>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactUs;