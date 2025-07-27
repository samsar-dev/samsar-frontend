import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { Typography } from "@/utils/typography";
import { Paper } from "@/utils/paper";

import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

// GridItem component that properly extends MUI Grid item
const GridItem = (props: any) => <Grid item {...props} />;

import SendIcon from "@mui/icons-material/Send";
import PeopleIcon from "@mui/icons-material/People";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CodeIcon from "@mui/icons-material/Code";
import PreviewIcon from "@mui/icons-material/Preview";
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
  const [preview, setPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isHtml, setIsHtml] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    defaultValues: {
      subject: "",
      content: "",
      isHtml: false,
      template: "default",
    },
  });

  const content = watch("content");
  const subject = watch("subject");

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

  useEffect(() => {
    if (showPreview) {
      setPreview(content);
    }
  }, [content, showPreview]);

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
        reset();
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <GridItem xs={12} md={8}>
          <Paper sx={{ p: 2 }}>

              <h5>Send Newsletter</h5>

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ mt: 3 }}
              >
                <TextField
                  fullWidth
                  label="Subject"
                  variant="outlined"
                  margin="normal"
                  {...register("subject", { required: "Subject is required" })}
                  error={!!errors.subject}
                  helperText={errors.subject?.message}
                />

                <TextField
                  fullWidth
                  label="Content"
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={10}
                  {...register("content", {
                    required: "Content is required",
                    minLength: {
                      value: 10,
                      message: "Content should be at least 10 characters long",
                    },
                  })}
                  error={!!errors.content}
                  helperText={errors.content?.message}
                  sx={{ mt: 2 }}
                />

                <FormGroup sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isHtml}
                        onChange={(e) => setIsHtml(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="HTML Content"
                  />
                  <FormHelperText>
                    Toggle to switch between plain text and HTML content
                  </FormHelperText>
                </FormGroup>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mt: 3,
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setShowPreview(!showPreview)}
                    startIcon={<PreviewIcon />}
                  >
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </Button>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to discard this draft?",
                          )
                        ) {
                          reset();
                        }
                      }}
                      disabled={isSending}
                    >
                      Discard
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSending}
                      startIcon={
                        isSending ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SendIcon />
                        )
                      }
                    >
                      {isSending
                        ? "Sending..."
                        : `Send to ${stats.totalSubscribers} Users`}
                    </Button>
                  </Box>
                </Box>
              </Box>

          </Paper>

          {showPreview && (
            <Paper sx={{ mt: 3, p: 2 }}>
  
                <h6>Preview</h6>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    minHeight: 200,
                    bgcolor: "background.paper",
                    whiteSpace: "pre-wrap",
                    ...(isHtml && {
                      "& *": { all: "revert" },
                      "&": {
                        fontFamily: "Arial, sans-serif",
                        fontSize: "16px",
                        lineHeight: 1.5,
                      },
                    }),
                  }}
                  dangerouslySetInnerHTML={{
                    __html: isHtml ? preview : preview.replace(/\n/g, "<br>"),
                  }}
                />
  
            </Paper>
          )}
        </GridItem>

        <GridItem xs={12} md={4}>
          <Paper sx={{ p: 2 }}>

              <h6>Newsletter Stats</h6>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <p style={{ color: 'text.secondary' }}>Total Users</p>
                <h6>{stats.totalSubscribers.toLocaleString()}</h6>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <p style={{ color: 'text.secondary' }}>Last Sent</p>
                <p>{formatDate(stats.lastSent)}</p>
              </Box>

              <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                Tips for effective newsletters:
              </p>
              <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
                <li>Keep subject lines clear and engaging</li>
                <li>Use a friendly, conversational tone</li>
                <li>Include a clear call-to-action</li>
                <li>Ensure mobile-friendly content</li>
                <li>Test before sending to all users</li>
              </ul>

              {isHtml && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "warning.light",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="warning">
                    <CodeIcon
                      fontSize="small"
                      sx={{ verticalAlign: "middle", mr: 0.5 }}
                    />
                    HTML Mode: Make sure your HTML is properly formatted and
                    tested.
                  </Typography>
                </Box>
              )}

          </Paper>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Newsletter;
