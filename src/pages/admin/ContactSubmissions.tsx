import { useState, useEffect, FC } from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "@/utils/typography";
import { Paper } from "@/utils/paper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Eye, MailCheck, ArrowLeft, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiClient } from "../../api/apiClient";
import { cn } from "@/lib/utils";

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
      <div className="flex justify-center mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          {error}
          <Button variant="ghost" size="sm" onClick={() => setError("")} className="ml-auto">
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Typography variant="h4" className="mb-4">
        Contact Submissions
      </Typography>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {selectedSubmission ? (
        <Paper elevation={3} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h5">
              {selectedSubmission.firstName} {selectedSubmission.lastName}
            </Typography>
            <Button variant="ghost" size="icon" onClick={handleCloseDetails}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {selectedSubmission.email} • {formatDate(selectedSubmission.createdAt)}
          </Typography>
          <Typography variant="h6" className="mb-2">
            {selectedSubmission.subject}
          </Typography>
          <Typography variant="body1" className="mb-4">
            {selectedSubmission.message}
          </Typography>
          {!selectedSubmission.read && (
            <Button
              onClick={() => markAsRead(selectedSubmission.id)}
            >
              <MailCheck className="h-4 w-4 mr-2" />
              Mark as Read
            </Button>
          )}
        </Paper>
      ) : (
        <Paper elevation={3} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Subject</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8">
                    <Typography variant="body1" className="text-muted-foreground">
                      No contact submissions found
                    </Typography>
                  </td>
                </tr>
              ) : (
                submissions
                  .slice(
                    currentPage * rowsPerPage,
                    currentPage * rowsPerPage + rowsPerPage,
                  )
                  .map((submission) => (
                    <tr
                      key={submission.id}
                      className={cn(
                        "border-b hover:bg-muted/50 cursor-pointer",
                        !submission.read && "bg-muted/20"
                      )}
                      onClick={async () =>
                        await handleViewSubmission(submission)
                      }
                    >
                      <td className="p-4">{formatDate(submission.createdAt)}</td>
                      <td className="p-4">{`${submission.firstName} ${submission.lastName}`}</td>
                      <td className="p-4">{submission.email}</td>
                      <td className="p-4">{submission.subject}</td>
                      <td className="p-4">
                        <Badge 
                          variant={submission.read ? "secondary" : "default"}
                        >
                          {submission.read ? "Read" : "New"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewSubmission(submission);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!submission.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await markAsRead(submission.id);
                              }}
                            >
                              <MailCheck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {currentPage * rowsPerPage + 1} to {Math.min((currentPage + 1) * rowsPerPage, submissions.length)} of {submissions.length} results
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(null, currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(null, currentPage + 1)}
              disabled={(currentPage + 1) * rowsPerPage >= submissions.length}
            >
              Next
            </Button>
          </div>
        </div>
      </Paper>
      )}
    </div>
  );
};

export default ContactSubmissions;
