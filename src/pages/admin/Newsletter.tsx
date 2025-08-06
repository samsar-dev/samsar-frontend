import { useState, useEffect } from "react";
import { Form, Field } from "houseform";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Send, Code, Eye, Loader2 } from "lucide-react";
import {
  sendNewsletter,
  getNewsletterStats,
} from "@/services/newsletterService";
import type { NewsletterFormData } from "@/types/newsletter";

const Newsletter = () => {
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    lastSent: null as string | null,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isHtml, setIsHtml] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getNewsletterStats();
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load newsletter stats:", error);
        toast.error("Failed to load newsletter statistics");
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Preview will be updated via Field component changes

  const onSubmit = async (data: NewsletterFormData) => {
    if (
      !window.confirm(
        `Are you sure you want to send this newsletter to ${stats.totalSubscribers} subscribers?`,
      )
    ) {
      return;
    }

    try {
      setIsSending(true);

      const response = await sendNewsletter({
        ...data,
        isHtml,
      });

      if (response.success) {
        toast.success(
          `Newsletter sent successfully to ${response.data?.sentCount || 0} subscribers`,
        );
        if (response.data?.failedCount) {
          toast.warning(
            `Failed to send to ${response.data.failedCount} subscribers`,
          );
        }
        // Reset form manually
        // Refresh stats after sending
        const updatedStats = await getNewsletterStats();
        setStats(updatedStats);
      } else {
        throw new Error(response.message || "Failed to send newsletter");
      }
    } catch (error: any) {
      console.error("Error sending newsletter:", error);
      toast.error(error.message || "Failed to send newsletter");
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send Newsletter</CardTitle>
            </CardHeader>
            <CardContent>
              <Form onSubmit={onSubmit}>
                {() => (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data = {
                        subject: formData.get("subject") as string,
                        content: formData.get("content") as string,
                        isHtml: isHtml,
                        template: formData.get("template") as string,
                      };

                      // Manual validation
                      let hasError = false;
                      if (!data.subject) {
                        toast.error("Subject is required");
                        hasError = true;
                      }
                      if (!data.content) {
                        toast.error("Content is required");
                        hasError = true;
                      } else if (data.content.length < 10) {
                        toast.error(
                          "Content should be at least 10 characters long",
                        );
                        hasError = true;
                      }

                      if (!hasError) {
                        onSubmit(data);
                      }
                    }}
                    className="space-y-4"
                  >
                    <Field name="subject">
                      {({
                        value: subjectValue,
                        setValue: setSubjectValue,
                        errors: subjectErrors,
                      }) => (
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            name="subject"
                            value={subjectValue || ""}
                            onChange={(e) => setSubjectValue(e.target.value)}
                            className={
                              subjectErrors.length > 0 ? "border-red-500" : ""
                            }
                          />
                          {subjectErrors.length > 0 && (
                            <p className="text-sm text-red-500 mt-1">
                              {subjectErrors[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </Field>

                    <Field name="content">
                      {({
                        value: contentValue,
                        setValue: setContentValue,
                        errors: contentErrors,
                      }) => (
                        <div>
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            name="content"
                            rows={10}
                            value={contentValue || ""}
                            onChange={(e) => {
                              setContentValue(e.target.value);
                            }}
                            className={
                              contentErrors.length > 0 ? "border-red-500" : ""
                            }
                          />
                          {contentErrors.length > 0 && (
                            <p className="text-sm text-red-500 mt-1">
                              {contentErrors[0]}
                            </p>
                          )}
                        </div>
                      )}
                    </Field>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch checked={isHtml} onCheckedChange={setIsHtml} />
                        <Label>HTML Content</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Toggle to switch between plain text and HTML content
                      </p>
                    </div>

                    <div className="flex gap-2 mt-4 justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {showPreview ? "Hide Preview" : "Show Preview"}
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to discard this draft?",
                              )
                            ) {
                              const form = document.querySelector("form");
                              if (form) form.reset();
                            }
                          }}
                          disabled={isSending}
                        >
                          Discard
                        </Button>
                        <Button type="submit" disabled={isSending}>
                          {isSending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          {isSending
                            ? "Sending..."
                            : `Send to ${stats.totalSubscribers} Users`}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </Form>
            </CardContent>
          </Card>

          {showPreview && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <Field name="content">
                  {({ value }) => (
                    <div
                      className="p-4 border rounded min-h-[200px] bg-background whitespace-pre-wrap"
                      style={
                        isHtml
                          ? {
                              fontFamily: "Arial, sans-serif",
                              fontSize: "16px",
                              lineHeight: 1.5,
                            }
                          : {}
                      }
                      dangerouslySetInnerHTML={{
                        __html: isHtml
                          ? value || ""
                          : (value || "").replace(/\n/g, "<br>"),
                      }}
                    />
                  )}
                </Field>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <h6 className="text-2xl font-bold">
                  {stats.totalSubscribers.toLocaleString()}
                </h6>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Last Sent</p>
                <p className="text-sm">{formatDate(stats.lastSent)}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium mb-2">
                  Tips for effective newsletters:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                  <li>Keep subject lines concise and engaging</li>
                  <li>Use personalization when possible</li>
                  <li>Include clear call-to-action buttons</li>
                  <li>Test your emails before sending</li>
                </ul>
              </div>

              {isHtml && (
                <div className="p-2 bg-yellow-50 rounded">
                  <p className="text-sm text-yellow-800">
                    <Code className="w-4 h-4 mr-2 inline" />
                    HTML Mode: Make sure your HTML is properly formatted and
                    tested.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
