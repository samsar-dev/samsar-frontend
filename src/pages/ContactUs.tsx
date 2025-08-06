import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/components/common/toast";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiClient } from "../api/apiClient";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

const ContactUs = () => {
  const { t } = useTranslation("footer");
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      console.log("Form validation failed", formErrors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const response = await apiClient.post("/contact", formData);
      console.log("Contact form submitted successfully", response.data);

      toast.success(t("contact_page.successMessage"), {
        duration: 5000,
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Contact form submission error", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        t("contact_page.errorMessage");
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 mb-12 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{t("contact_page.title")}</h1>
          <p className="text-xl opacity-90">{t("contact_page.subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Alert className="mb-4">{t("contact_page.formInfo")}</Alert>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {t("contact_page.formTitle")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("contact_page.form.firstName")}
                    </label>
                    <Input
                      placeholder={t("contact_page.form.firstName")}
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={formErrors.firstName ? "border-red-500" : ""}
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("contact_page.form.lastName")}
                    </label>
                    <Input
                      placeholder={t("contact_page.form.lastName")}
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={formErrors.lastName ? "border-red-500" : ""}
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("contact_page.form.email")}
                    </label>
                    <Input
                      type="email"
                      placeholder={t("contact_page.form.email")}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("contact_page.form.subject")}
                    </label>
                    <Input
                      placeholder={t("contact_page.form.subject")}
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={formErrors.subject ? "border-red-500" : ""}
                    />
                    {formErrors.subject && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.subject}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("contact_page.form.message")}
                  </label>
                  <Textarea
                    placeholder={t("contact_page.form.message")}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={formErrors.message ? "border-red-500" : ""}
                  />
                  {formErrors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("contact_page.form.submitting")}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t("contact_page.form.submit")}
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          <div>
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">
                {t("contact_page.contactInfo.title")}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {t("contact_page.contactInfo.address.label")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contact_page.contactInfo.address.value")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {t("contact_page.contactInfo.phone.label")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contact_page.contactInfo.phone.number")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {t("contact_page.contactInfo.email.label")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contact_page.contactInfo.email.address")}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {t("contact_page.businessHours.title")}
              </h3>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {t("contact_page.businessHours.weekdays")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t("contact_page.businessHours.weekdaysTime")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("contact_page.businessHours.saturday")}</span>
                  <span className="text-sm">
                    {t("contact_page.businessHours.saturdayTime")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("contact_page.businessHours.sunday")}</span>
                  <span className="text-sm">
                    {t("contact_page.businessHours.sundayTime")}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
