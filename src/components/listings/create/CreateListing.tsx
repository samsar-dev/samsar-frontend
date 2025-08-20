import { UpgradePrompt } from "@/components/UpgradePrompt";
import { useAuth } from "@/hooks/useAuth";
import { useCreateListing } from "@/hooks/useCreateListing";
import { useListingPermission } from "@/hooks/useListingPermission";
import {
  Condition,
  FuelType,
  ListingAction,
  ListingCategory,
  TransmissionType,
  VehicleType,
} from "@/types/enums";
// Removed framer-motion import - using Tailwind CSS transitions instead
// Using JSON.stringify for simple deep equality check
const isDeepEqual = (a: any, b: any): boolean => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false; // Fallback for circular references or other errors
  }
};
import React, {
  Suspense,
  lazy,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { FaCarSide } from "@react-icons/all-files/fa/FaCarSide";
import { FaCheckCircle } from "@react-icons/all-files/fa/FaCheckCircle";
import { FaCog } from "@react-icons/all-files/fa/FaCog";
import { useLocation, useNavigate } from "react-router-dom";
import type { FormState } from "@/types/listings";
import { handleAdvancedDetailsSubmit } from "./advanced/handleAdvancedDetailsSubmit";
import { handleBasicDetailsSubmit } from "./basic/handleBasicDetailsSubmit";
// Import types from the components where they're used directly

// Lazy load components to reduce initial bundle size
const BasicDetailsForm = lazy(() => import("./steps/BasicDetailsForm"));
const AdvancedDetailsForm = lazy(() => import("./steps/AdvancedDetailsForm"));
const ReviewSection = lazy(() => import("./steps/ReviewSection"));

// Memoized step components to prevent unnecessary re-renders
const MemoizedBasicDetailsForm = memo(BasicDetailsForm);
const MemoizedAdvancedDetailsForm = memo(AdvancedDetailsForm);
const MemoizedReviewSection = memo(ReviewSection);

const initialFormState: FormState = {
  title: "",
  description: "",
  price: 0,
  category: {
    mainCategory: ListingCategory.VEHICLES,
    subCategory: VehicleType.CARS,
  },
  location: "",
  images: [],
  listingAction: ListingAction.SALE, // Default to SALE
  locationMeta: undefined,
  latitude: 0,
  longitude: 0,
  details: {
    vehicleType: VehicleType.CARS,
    make: "",
    model: "",
    year: "",
    mileage: "",
    fuelType: FuelType.GASOLINE,
    transmissionType: TransmissionType.AUTOMATIC,
    color: "",
    condition: Condition.NEW,
    features: [],
    interiorColor: "",
    engine: "",
    warranty: "",
    serviceHistory: "",
    previousOwners: 0,
    registrationStatus: "",
    accidentFree: false,
    customsCleared: false,
    fuelEfficiency: "",
    emissionClass: "",
    driveType: "",
    wheelSize: "",
    wheelType: "",
    // Safety Features
    blindSpotMonitor: false,
    laneAssist: false,
    adaptiveCruiseControl: false,
    tractionControl: false,
    abs: false,
    emergencyBrakeAssist: false,
    tirePressureMonitoring: false,
    // Camera Features
    rearCamera: false,
    camera360: false,
    dashCam: false,
    nightVision: false,
    parkingSensors: false,
    // Climate Features
    climateControl: false,
    heatedSeats: false,
    ventilatedSeats: false,
    dualZoneClimate: false,
    rearAC: false,
    airQualitySensor: false,
    // Entertainment Features
    bluetooth: false,
    appleCarPlay: false,
    androidAuto: false,
    premiumSound: false,
    wirelessCharging: false,
    usbPorts: false,
    cdPlayer: false,
    dvdPlayer: false,
    rearSeatEntertainment: false,
    // Lighting Features
    ledHeadlights: false,
    adaptiveHeadlights: false,
    ambientLighting: false,
    fogLights: false,
    automaticHighBeams: false,
    // Convenience Features
    keylessEntry: false,
    sunroof: false,
    spareKey: false,
    remoteStart: false,
    powerTailgate: false,
    autoDimmingMirrors: false,
    rainSensingWipers: false,
    // New required fields
    doors: 4,
    seats: 5,
  },
  features: [],
}

const CreateListing = () => {
  const { user } = useAuth();
  const {
    canCreate,
    maxListings,
    currentListings,
    isLoading,
    userRole,
    error: permissionError,
  } = useListingPermission();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Initialize hooks and state (must run on every render to keep hooks order consistent)
  const { t } = useTranslation(["listings"]);
  const navigate = useNavigate();
  const { handleSubmit: submitListing } = useCreateListing();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user can create listings
  useEffect(() => {
    if (isLoading) return;

    // Only show upgrade prompt for non-admin users who can't create more listings
    if (!canCreate && userRole === "FREE_USER") {
      toast.error(
        permissionError ||
          "You need to upgrade your account to create more listings",
      );
      setShowUpgradePrompt(true);
    } else {
      setShowUpgradePrompt(false);
    }
  }, [canCreate, isLoading, userRole, permissionError]);

  // Show upgrade prompt for free users who have reached their limit
  // (early return removed – we now render conditionally in the main JSX)

  // Show loading state while checking permissions
  // (early return removed – we now render conditionally in the main JSX)

  // Track form changes to ensure hasUnsavedChanges works correctly
  const hasUnsavedChanges = !isDeepEqual(formData, initialFormState);

  // Log changes state for debugging
  useEffect(() => {
    console.log("Unsaved changes state:", {
      hasUnsavedChanges,
      formData: { ...formData, images: formData.images?.length }, // Log image count instead of actual images
      initialFormState: {
        ...initialFormState,
        images: initialFormState.images?.length,
      },
    });
  }, [formData, hasUnsavedChanges]);

  const location = useLocation();

  // Handle browser back button navigation
  useEffect(() => {
    // const handlePopState = (event: PopStateEvent) => {
    const handlePopState = () => {
      if (hasUnsavedChanges && location.pathname === "/listings/create") {
        const confirmLeave = window.confirm(
          "You have unsaved changes. Are you sure you want to leave?",
        );
        if (!confirmLeave) {
          // Push them back to where they were
          window.history.pushState(null, "", window.location.pathname);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, location.pathname]);

  // Handle programmatic navigation
  // const handleLeave = (target: string) => {
  //   if (
  //     hasUnsavedChanges &&
  //     location.pathname === "/listings/create" &&
  //     !window.confirm(
  //       "You have unsaved changes. Are you sure you want to leave?"
  //     )
  //   ) {
  //     return;
  //   }

  //   navigate(target);
  // };

  // Use the custom navigation function instead of direct navigate
  const handleBack = useCallback(() => {
    setStep((prev) => prev - 1);
  }, []);

  // Save form data to session storage only when there are changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      try {
        // Create a copy of formData without the images to avoid serialization issues
        const dataToSave = {
          ...formData,
          // Don't store actual File objects in session storage as they can't be serialized properly
          images: formData.images
            ? formData.images
                .map((img) => {
                  // If it's already a string (URL), keep it
                  if (typeof img === "string") return img;
                  // Otherwise, we can't store the File object
                  return null;
                })
                .filter(Boolean)
            : [],
        };

        sessionStorage.setItem(
          "createListingFormData",
          JSON.stringify(dataToSave),
        );
        console.log("Form data saved to session storage");
      } catch (error) {
        console.error("Failed to save form data to session storage:", error);
      }
    }
  }, [formData, hasUnsavedChanges]);

  // Clear form data from session storage only when form is successfully submitted
  // This ensures data is preserved during accidental page refreshes or navigations
  const clearSavedFormData = useCallback(() => {
    try {
      sessionStorage.removeItem("createListingFormData");
    } catch (error) {
      console.error("Failed to clear form data from session storage:", error);
    }
  }, []);

  // Add a confirmation dialog when the user refreshes the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges || location.pathname !== "/listings/create")
        return undefined;

      const confirmationMessage =
        "You have unsaved changes. Are you sure you want to leave?";
      e.preventDefault();
      e.returnValue = confirmationMessage; // Works in all modern browsers
      return confirmationMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, location.pathname]);

  const handleFinalSubmit = useCallback(
    async (data: FormState) => {
      console.log("=== DETAILED LISTING CREATION DEBUG ===");
      console.log("1. Starting handleFinalSubmit with data:", data);
      console.log("2. Form data structure:");
      console.log("   - Title:", data.title);
      console.log("   - Description:", data.description);
      console.log("   - Price:", data.price);
      console.log("   - Location:", data.location);
      console.log("   - Action:", data.listingAction);
      console.log("   - Category:", data.category);
      console.log("   - Details:", data.details);
      console.log("   - Images count:", data.images?.length || 0);

      if ((data.details as any)?.vehicleType) {
        console.log("3. Vehicle details breakdown:");
        console.log("   - vehicleType:", (data.details as any).vehicleType);
        console.log("   - make:", (data.details as any).make);
        console.log("   - model:", (data.details as any).model);
        console.log("   - year:", (data.details as any).year);
        console.log("   - Full vehicle object:", data.details);
      }

      try {
        setIsSubmitting(true);

        // Create FormData object
        const formData = new FormData();

        // Add basic fields
        formData.append("title", data.title || "");
        formData.append("description", data.description || "");
        formData.append("price", data.price?.toString() || "");
        formData.append("location", data.location || "");
        // Ensure listingAction is properly set and uppercase
        formData.append(
          "listingAction",
          (data.listingAction || "SALE").toUpperCase(),
        );
        formData.append("mainCategory", data.category?.mainCategory || "");
        formData.append("subCategory", data.category?.subCategory || "");

        console.log("4. Added basic fields to FormData");

        // Add details
        if (data.details) {
          // Ensure we have valid category data
          if (!data.category?.mainCategory || !data.category?.subCategory) {
            throw new Error("Category and subcategory are required");
          }

          console.log("5. Processing details object:", data.details);

          // Process vehicle details to ensure serviceHistory is properly formatted
          // Use the new flat structure - details object contains vehicle/real estate fields directly
          const processedDetails = { ...data.details } as any;

          console.log("6. Processing flat details structure:", processedDetails);

          // Ensure vehicleType is always set for vehicle listings
          if (data.category.mainCategory === ListingCategory.VEHICLES && !processedDetails.vehicleType) {
            console.log("7. WARNING: vehicleType is missing, setting default to CARS");
            processedDetails.vehicleType = VehicleType.CARS;
          }

          console.log("8. Final processed details:", processedDetails);

          // Handle serviceHistory for vehicles - ensure it's formatted as expected by the backend
          if (processedDetails.serviceHistory !== undefined) {
            if (!processedDetails.serviceHistory) {
              processedDetails.serviceHistory = { set: [] };
            } else if (typeof processedDetails.serviceHistory === "string") {
              processedDetails.serviceHistory = {
                set: [processedDetails.serviceHistory],
              };
            } else if (Array.isArray(processedDetails.serviceHistory)) {
              processedDetails.serviceHistory = {
                set: processedDetails.serviceHistory,
              };
            }
          } else if (data.category.mainCategory === ListingCategory.VEHICLES) {
            processedDetails.serviceHistory = { set: [] };
          }

          const detailsJson = JSON.stringify(processedDetails);
          console.log("11. Final processed details JSON:", detailsJson);
          formData.append("details", detailsJson);
        }

        // Add images
        if (data.images && data.images.length > 0) {
          const fileImages = data.images.filter(
            (image): image is File => image instanceof File,
          );

          if (fileImages.length === 0) {
            throw new Error("At least one image is required");
          }

          // Log image information for debugging
          console.log(`Submitting ${fileImages.length} images:`);
          fileImages.forEach((image, index) => {
            console.log(
              `Image ${index + 1}: ${image.name}, ${image.type}, ${(image.size / 1024).toFixed(2)}KB`,
            );
            formData.append("images", image);
          });
        } else {
          throw new Error("At least one image is required");
        }

        // Log the FormData entries for debugging
        console.log("FormData entries:");
        for (const pair of formData.entries()) {
          console.log(
            pair[0],
            ":",
            typeof pair[1] === "string" ? pair[1] : "File object",
          );
        }

        // Submit the form
        console.log("12. About to call submitListing with FormData");
        console.log("13. FormData summary before API call:");
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`    ${key}: File - ${value.name} (${value.size} bytes)`);
          } else {
            console.log(`    ${key}: ${value}`);
          }
        }
        
        const response = await submitListing(formData);
        console.log("14. Response received from API:", response);

        // Clear form data from session storage after successful submission
        clearSavedFormData();

        // Reset form and navigate
        setFormData(initialFormState);
        setStep(1);
        localStorage.removeItem("createListingFormData");
        toast.success(t("listings.createListing"), {
          duration: 3000,
          icon: "🎉",
        });

        // Navigate to ListingSuccess with the listingId
        if (response && response.id) {
          navigate("/listing-success", { state: { listingId: response.id } });
        } else {
          navigate("/listings");
        }
      } catch (error) {
        console.error("Error submitting listing:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create listing";
        setError(errorMessage);
        toast.error(t("errors.failedToCreateListing"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitListing, clearSavedFormData, navigate, t],
  );

  const handleEditSection = useCallback(
    (section: string) => {
      // Save the current form data
      const currentData = { ...formData };

      // Go back to step 1 and restore the data
      setStep(1);
      setFormData(currentData);

      // If editing images, focus the image upload section
      if (section === "images") {
        setTimeout(() => {
          const imageUpload = document.querySelector("#image-upload");
          if (imageUpload) {
            imageUpload.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    },
    [formData],
  );

  const renderStep = useCallback(() => {
    switch (step) {
      case 1:
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <MemoizedBasicDetailsForm
              initialData={formData}
              onSubmit={(data, isValid) =>
                // @ts-expect-error: The 'vehicles' property is not guaranteed to exist because it's optional
                handleBasicDetailsSubmit(data, isValid, setFormData, setStep, t)
              }
              onImageDelete={() => {
                // Prevent form advancement when deleting images
              }}
            />
          </Suspense>
        );
      case 2:
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <MemoizedAdvancedDetailsForm
              formData={{
                ...formData,
                status: "ACTIVE", // Add the required status property
              }}
              onSubmit={(data, isValid) =>
                handleAdvancedDetailsSubmit(
                  data,
                  isValid,
                  setFormData,
                  setStep,
                  t,
                )
              }
              onBack={handleBack}
            />
          </Suspense>
        );
      case 3:
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <MemoizedReviewSection
              // @ts-expect-error: may differ type file occure which handle in api controller
              formData={formData}
              // @ts-expect-error: may differ type file occure which handle in api controller
              onSubmit={(formData: FormState) => {
                handleFinalSubmit(formData);
              }}
              onBack={handleBack}
              onEdit={handleEditSection}
            />
          </Suspense>
        );
      default:
        return null;
    }
  }, [step, formData, handleBack, handleEditSection, t]);

  // Define step icons for the progress indicator - memoized to prevent recreation on each render
  const stepIcons = useMemo(
    () => [
      { icon: FaCarSide, label: t("steps.basicDetails") },
      { icon: FaCog, label: t("steps.advancedDetails") },
      { icon: FaCheckCircle, label: t("steps.review") },
    ],
    [t],
  );

  // Pre-compute main content based on state to avoid conditional early returns that break hook order
  let bodyContent: React.ReactNode = null;

  if (isLoading || user === undefined) {
    bodyContent = (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
    // Temporarily disabled free user restrictions
    // } else if (userRole === "FREE_USER") {
    //   bodyContent = (
    //     <div className="flex flex-col items-center justify-center min-h-[300px]">
    //       <FaMobileAlt className="text-5xl text-blue-500 mb-4" />
    //       <h2 className="text-xl font-bold mb-2">{t("create.freeUserTitle")}</h2>
    //       <p className="mb-4 text-gray-600">{t("create.freeUserDescription")}</p>
    //       <div className="flex gap-4">
    //         <a
    //           href="https://your-app-download-link"
    //           className="btn btn-primary flex items-center gap-2"
    //         >
    //           <FaMobileAlt /> {t("create.downloadApp")}
    //         </a>
    //         <a
    //           href="/subscription"
    //           className="btn btn-warning flex items-center gap-2"
    //         >
    //           <FaCrown /> {t("create.subscribePremium")}
    //         </a>
    //       </div>
    //     </div>
    //   );
  } else if (showUpgradePrompt) {
    bodyContent = (
      <UpgradePrompt
        maxListings={maxListings}
        currentListings={currentListings}
        onUpgrade={() => {
          window.location.href = "/subscription";
        }}
      />
    );
  } else if (error) {
    bodyContent = (
      <div
        className="max-w-4xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
        role="alert"
      >
        <h2 className="text-lg font-medium text-red-800 dark:text-red-300">
          {t("errors.failedToCreateListing")}
        </h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {t("common.try_again")}
        </button>
      </div>
    );
  } else {
    // Normal multi-step form content
    bodyContent = <>{renderStep()}</>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="space-y-6 animate-fadeIn">
        <div className="mb-6">
          <h1
            className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
            tabIndex={0}
          >
            {t("create.title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400" tabIndex={0}>
            {t("create.subtitle")}
          </p>

          {/* Accessible step indicator */}
          <div
            className="mt-8 mb-6"
            aria-label={`Step ${step} of 3: ${stepIcons[step - 1].label}`}
          >
            <div className="flex justify-between overflow-x-auto gap-4 sm:gap-6">
              {stepIcons.map((stepInfo, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center ${
                    idx + 1 === step
                      ? "text-blue-600 dark:text-blue-400"
                      : idx + 1 < step
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 
                      ${
                        idx + 1 === step
                          ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                          : idx + 1 < step
                            ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500"
                            : "bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700"
                      }`}
                    aria-hidden="true"
                  >
                    <stepInfo.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-medium text-center">
                    {stepInfo.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative pt-1">
              <div className="flex h-2 overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="flex flex-col justify-center overflow-hidden bg-blue-500"
                  role="progressbar"
                  style={{ width: `${(step / 3) * 100}%` }}
                  aria-valuenow={Math.round((step / 3) * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className={isSubmitting ? "opacity-60 pointer-events-none" : ""}>
          <div className="transition-all duration-200 ease-in-out pb-10">
            <div className="pb-10">{bodyContent}</div>
          </div>
        </div>

        {isSubmitting && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50"
            aria-live="polite"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {t("submitting")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
