import { useCreateListing } from "@/hooks/useCreateListing";
import {
  Condition,
  FuelType,
  ListingAction,
  ListingCategory,
  PropertyType,
  TransmissionType,
  VehicleType,
} from "@/types/enums";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaCarSide, FaCheckCircle, FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import type { FormState } from "../../../types/listings";
import { handleAdvancedDetailsSubmit } from "./advanced/handleAdvancedDetailsSubmit";
import { handleBasicDetailsSubmit } from "./basic/handleBasicDetailsSubmit";
import type { ExtendedFormState } from "./steps/AdvancedDetailsForm";
const BasicDetailsForm = lazy(() => import("./steps/BasicDetailsForm"));
const AdvancedDetailsForm = lazy(() => import("./steps/AdvancedDetailsForm"));
const ReviewSection = lazy(() => import("./steps/ReviewSection"));

// Animation variants for lightweight transitions
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

const initialFormState: FormState = {
  title: "",
  description: "",
  price: 0,
  category: {
    mainCategory: ListingCategory.VEHICLES,
    subCategory: VehicleType.CAR,
  },
  location: "",
  images: [],
  details: {
    vehicles: {
      vehicleType: VehicleType.CAR,
      make: "",
      model: "",
      year: "",
      mileage: "",
      fuelType: FuelType.GASOLINE,
      transmissionType: TransmissionType.AUTOMATIC,
      color: "",
      condition: Condition.NEW,
      features: {},
      interiorColor: "",
      engine: "",
      warranty: "",
      serviceHistory: "",
      previousOwners: "",
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
    },
    realEstate: {
      propertyType: PropertyType.APARTMENT,
      totalArea: 0,
      bedrooms: 0,
      bathrooms: 0,
      yearBuilt: 0,
      condition: Condition.NEW,
      features: [],
      floor: 0,
      totalFloors: 0,
      elevator: false,
      balcony: false,
      storage: false,
      heating: "",
      cooling: "",
      buildingAmenities: [],
      energyRating: "",
      furnished: false,
      view: "",
      securityFeatures: [],
      fireSafety: [],
      flooringType: "",
      internetIncluded: false,
      windowType: "",
      accessibilityFeatures: [],
      renovationHistory: "",
      parkingType: "",
      utilities: [],
      exposureDirection: [],
      storageType: [],
    },
  },
  listingAction: ListingAction.SELL,
};

const CreateListing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleSubmit: submitListing } = useCreateListing();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(() => {
    // Try to load saved form data from session storage
    try {
      const savedData = sessionStorage.getItem("createListingFormData");
      if (!savedData) return initialFormState;

      // Parse the saved data
      const parsedData = JSON.parse(savedData);

      // Images can't be properly serialized/deserialized from session storage
      // So we need to reset the images array to avoid corruption
      return {
        ...parsedData,
        images: [], // Reset images to avoid corruption
      };
    } catch (error) {
      console.error("Error loading form data from session storage:", error);
      return initialFormState;
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasUnsavedChanges =
    JSON.stringify(formData) !==
    sessionStorage.getItem("createListingFormData");

  // Block navigation for React Router's useNavigate with a professional message
  // const handleNavigation = useBlockNavigation(
  //   hasUnsavedChanges,
  //   "You have unsaved changes in your listing. If you leave this page, all your data will be lost. Would you like to continue?"
  // );

  // Use the custom navigation function instead of direct navigate
  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  // Add event listener for beforeunload to show confirmation dialog when refreshing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Standard message for browser's built-in dialog
        const message =
          "Your listing data has not been saved. If you leave now, your progress will be lost.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Save form data to session storage whenever it changes
  useEffect(() => {
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
        JSON.stringify(dataToSave)
      );
      console.log("Form data saved to session storage");
    } catch (error) {
      console.error("Failed to save form data to session storage:", error);
    }
  }, [formData]);

  // Clear form data from session storage only when form is successfully submitted
  // This ensures data is preserved during accidental page refreshes or navigations
  const clearSavedFormData = () => {
    try {
      sessionStorage.removeItem("createListingFormData");
      console.log("Form data cleared from session storage");
    } catch (error) {
      console.error("Failed to clear form data from session storage:", error);
    }
  };

  // Add a confirmation dialog when the user refreshes the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const message =
          "You have unsaved changes in your listing. If you refresh this page, your data will still be available, but any unsaved changes may be lost.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    clearSavedFormData();
    localStorage.removeItem("createListingFormData");
  }, []);

  const handleFinalSubmit = async (data: FormState) => {
    try {
      setIsSubmitting(true);

      // Create FormData object
      const formData = new FormData();

      // Log the data being submitted
      console.log("Submitting form data:", data);

      // Add basic fields
      formData.append("title", data.title || "");
      formData.append("description", data.description || "");
      formData.append("price", data.price?.toString() || "");
      formData.append("location", data.location || "");
      formData.append(
        "listingAction",
        (data.listingAction || "sell").toUpperCase()
      );
      formData.append("mainCategory", data.category?.mainCategory || "");
      formData.append("subCategory", data.category?.subCategory || "");

      // Add details
      if (data.details) {
        // Ensure we have valid category data
        if (!data.category?.mainCategory || !data.category?.subCategory) {
          throw new Error("Category and subcategory are required");
        }

        const details = {
          vehicles: data.details.vehicles ? data.details.vehicles : undefined,
          realEstate: data.details.realEstate
            ? data.details.realEstate
            : undefined,
        };
        formData.append("details", JSON.stringify(details));
      }

      // Add images
      if (data.images && data.images.length > 0) {
        // Filter to only include valid File objects
        const fileImages = data.images.filter(
          (image): image is File => image instanceof File
        );

        if (fileImages.length === 0) {
          throw new Error("At least one image is required");
        }

        // Log image information for debugging
        console.log(`Submitting ${fileImages.length} images:`);
        fileImages.forEach((image, index) => {
          console.log(
            `Image ${index + 1}: ${image.name}, ${image.type}, ${(image.size / 1024).toFixed(2)}KB`
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
          typeof pair[1] === "string" ? pair[1] : "File object"
        );
      }

      // Submit the form
      const response = await submitListing(formData);

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
      if (response && response?.data && response?.data?.id) {
        navigate("/listingsuccess", { state: { listingId: response.data.id } });
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
  };

  const handleEditSection = (section: string) => {
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
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <BasicDetailsForm
              initialData={formData}
              onSubmit={(data, isValid) =>
                handleBasicDetailsSubmit(
                  data as ExtendedFormState,
                  isValid,
                  setFormData,
                  setStep,
                  t
                )
              }
            />
          </Suspense>
        );
      case 2:
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <AdvancedDetailsForm
              formData={formData}
              onSubmit={(data, isValid) =>
                handleAdvancedDetailsSubmit(
                  data,
                  isValid,
                  setFormData,
                  setStep,
                  t
                )
              }
              onBack={handleBack}
            />
          </Suspense>
        );
      case 3:
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ReviewSection
              formData={formData}
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
  };

  const stepIcons = [
    { icon: FaCarSide, label: t("basicDetails") },
    { icon: FaCog, label: t("advancedDetails") },
    { icon: FaCheckCircle, label: t("review") },
  ];

  if (error) {
    return (
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
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <div className="mb-6">
          <h1
            className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
            tabIndex={0}
          >
            {t("listings.createListing")}
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
          <AnimatePresence mode="wait">
            <motion.div key={step} {...pageTransition}>
              <div className="pb-10">{renderStep()}</div>
            </motion.div>
          </AnimatePresence>
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
      </motion.div>
    </div>
  );
};

export default CreateListing;
