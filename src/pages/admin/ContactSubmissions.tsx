import { useState, useEffect, FC } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { Typography } from "@/utils/typography";
import { Paper } from "@/utils/paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import TableFooter from "@mui/material/TableFooter";
import CloseIcon from "@mui/icons-material/Close";
import ViewIcon from "@mui/icons-material/Visibility";
import MarkReadIcon from "@mui/icons-material/MarkEmailRead";
import BackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../api/apiClient";

interface ContactSubmission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const ContactSubmissions: FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContactSubmission | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        console.log("Fetching contact submissions...");
        setIsLoading(true);
        setError("");

        const response = await apiClient.get("/admin/contact", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log("API Response:", response);

        if (response.data && response.data.success === false) {
          console.error("Backend returned error:", response.data);
          throw new Error(response.data.error || "Failed to fetch submissions");
        }

        const data = response.data?.data || response.data;
        if (Array.isArray(data)) {
          console.log(`Received ${data.length} submissions`);
          setSubmissions(data);
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Unexpected response format from server");
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to load submissions";
        setError(errorMessage);
        console.error("Error fetching submissions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "ADMIN") {
      fetchSubmissions();
    } else {
      navigate("/login", { state: { from: "/admin/contact-submissions" } });
    }
  }, [isAuthenticated, user, navigate]);

  // Handlers for pagination
  const handlePageChange = (_: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleViewSubmission = async (submission: ContactSubmission) => {
    try {
      setSelectedSubmission(submission);

      // Mark as read if not already read
      if (!submission.read) {
        const success = await markAsRead(submission.id);
        if (!success) {
          // If marking as read fails, we'll still show the submission
          // but we'll keep it as unread in the UI
          console.log("Could not mark submission as read");
        }
      }
    } catch (err) {
      console.error("Error in handleViewSubmission:", err);
      // Even if there's an error, we still want to show the submission
      setError("Failed to update submission status");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(
        `/admin/contact/${id}/read`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      // Update the submissions list
      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((sub) =>
          sub.id === id ? { ...sub, read: true } : sub,
        ),
      );

      // Update the selected submission if it's the one being marked as read
      setSelectedSubmission((prev) =>
        prev?.id === id && prev ? { ...prev, read: true } : prev,
      );

      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to mark as read";
      console.error("Error marking as read:", errorMessage, err);
      setError(errorMessage);
      return false;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCloseDetails = () => {
    setSelectedSubmission(null);
  };

  if (!isAuthenticated || !user || user.role !== "ADMIN") {
    return null; // Will redirect from useEffect
  }

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        p={4}
        flexDirection="column"
        alignItems="center"
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading submissions...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setError("")}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>Error Loading Submissions</AlertTitle>
            {error}
            <Box
              component="div"
              sx={{ mt: 1, fontSize: "0.8rem", opacity: 0.8 }}
            >
              Check browser console for more details
            </Box>
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Contact Form Submissions
        </Typography>
      </Box>

      {selectedSubmission ? (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" component="h2">
              {selectedSubmission.subject}
            </Typography>
            <Box>
              <Chip
                label={selectedSubmission.read ? "Read" : "New"}
                color={selectedSubmission.read ? "default" : "primary"}
                size="small"
                sx={{ mr: 1 }}
              />
              <Button onClick={handleCloseDetails}>Back to List</Button>
            </Box>
          </Box>

          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary">
              From: {selectedSubmission.firstName} {selectedSubmission.lastName}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Email: {selectedSubmission.email}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Date: {formatDate(selectedSubmission.createdAt)}
            </Typography>
          </Box>

          <Paper
            variant="outlined"
            sx={{ p: 2, bgcolor: "background.default" }}
          >
            <Typography variant="body1" whiteSpace="pre-line">
              {selectedSubmission.message}
            </Typography>
          </Paper>

          {!selectedSubmission.read && (
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<MarkReadIcon />}
                onClick={() => markAsRead(selectedSubmission.id)}
              >
                Mark as Read
              </Button>
            </Box>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No contact submissions found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                submissions
                  .slice(
                    currentPage * rowsPerPage,
                    currentPage * rowsPerPage + rowsPerPage,
                  )
                  .map((submission) => (
                    <TableRow
                      key={submission.id}
                      sx={{
                        cursor: "pointer",
                        bgcolor: submission.read ? "inherit" : "action.hover",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                      onClick={async () =>
                        await handleViewSubmission(submission)
                      }
                    >
                      <TableCell>{formatDate(submission.createdAt)}</TableCell>
                      <TableCell>{`${submission.firstName} ${submission.lastName}`}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.subject}</TableCell>
                      <TableCell>
                        <Chip
                          label={submission.read ? "Read" : "New"}
                          color={submission.read ? "default" : "primary"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewSubmission(submission);
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!submission.read && (
                          <Tooltip title="Mark as Read">
                            <IconButton
                              size="small"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await markAsRead(submission.id);
                              }}
                            >
                              <MarkReadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  count={submissions.length}
                  rowsPerPage={rowsPerPage}
                  page={currentPage}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  colSpan={6}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ContactSubmissions;
