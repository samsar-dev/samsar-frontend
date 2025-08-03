import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "../api/apiClient";
import { useAuth } from "./useAuth";

interface ListingPermission {
  canCreate: boolean;
  maxListings: number;
  currentListings: number;
  userRole:
    | "FREE_USER"
    | "PREMIUM_USER"
    | "BUSINESS_USER"
    | "ADMIN"
    | "MODERATOR";
  isLoading: boolean;
  error: string | null;
}

export const useListingPermission = (): ListingPermission => {
  const [permission, setPermission] = useState<ListingPermission>({
    canCreate: false,
    maxListings: 1,
    currentListings: 0,
    userRole: "FREE_USER",
    isLoading: true,
    error: null,
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await apiClient.get("/user/listing-permission");
        console.log("Listing permission response:", response.data);

        setPermission({
          canCreate: response.data.canCreate,
          maxListings: response.data.maxListings || 1,
          currentListings: response.data.currentListings || 0,
          userRole:
            response.data.userRole === "FREE_USER" ||
            response.data.userRole === "PREMIUM_USER" ||
            response.data.userRole === "BUSINESS_USER" ||
            response.data.userRole === "ADMIN" ||
            response.data.userRole === "MODERATOR"
              ? response.data.userRole
              : "FREE_USER",
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error("Error checking listing permission:", error);

        if (error.response?.data?.code === "LISTING_LIMIT_REACHED") {
          setPermission({
            canCreate: false,
            maxListings: error.response.data.maxListings || 1,
            currentListings: error.response.data.currentListings || 0,
            userRole:
              typeof user?.role === "string" &&
              [
                "FREE_USER",
                "PREMIUM_USER",
                "BUSINESS_USER",
                "ADMIN",
                "MODERATOR",
              ].includes(user.role)
                ? (user.role as any)
                : "FREE_USER",
            isLoading: false,
            error: "You have reached your listing limit",
          });
        } else if (error.response?.status === 401) {
          // Not authenticated
          navigate("/login", { state: { from: window.location.pathname } });
        } else {
          toast.error("Failed to check listing permissions");
          setPermission((prev) => ({
            ...prev,
            userRole:
              typeof prev.userRole === "string" &&
              [
                "FREE_USER",
                "PREMIUM_USER",
                "BUSINESS_USER",
                "ADMIN",
                "MODERATOR",
              ].includes(prev.userRole)
                ? (prev.userRole as any)
                : "FREE_USER",
            isLoading: false,
            error: "Failed to check permissions",
          }));
        }
      }
    };

    if (user) {
      checkPermission();
    } else {
      // If no user is logged in, set loading to false
      setPermission((prev) => ({
        ...prev,
        isLoading: false,
        userRole: "FREE_USER",
        canCreate: false,
      }));
    }
  }, [navigate, user]);

  return permission;
};

export default useListingPermission;
