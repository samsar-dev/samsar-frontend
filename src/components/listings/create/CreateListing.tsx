import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCreateListing } from "@/components/listings/hooks/useCreateListing";
import { ListingCategory, VehicleType, FuelType, TransmissionType, PropertyType, Condition, ListingAction, ListingStatus } from "@/types/enums";
import type { HouseDetails, ApartmentDetails, LandDetails } from "../../../types/listings";
import { FormState } from "@/types/forms";
import BasicDetailsForm from "./steps/BasicDetailsForm";
import AdvancedDetailsForm from "./steps/AdvancedDetailsForm";
import ReviewSection from "./steps/ReviewSection";
import { FaCarSide, FaCog, FaCheckCircle } from "react-icons/fa";

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
      year: new Date().getFullYear() as number,
      mileage: 0,
      fuelType: FuelType.GASOLINE,
      transmissionType: TransmissionType.AUTOMATIC,
      color: "#000000",
      condition: Condition.GOOD,
      features: {
        // Airbags
        frontAirbags: false,
        sideAirbags: false,
        curtainAirbags: false,
        kneeAirbags: false,

        // Driver Assistance
        cruiseControl: false,
        adaptiveCruiseControl: false,
        laneDepartureWarning: false,
        laneKeepAssist: false,
        automaticEmergencyBraking: false,

        // Safety Features
        blindSpotMonitor: false,
        laneAssist: false,

        // Camera Features
        rearCamera: false,
        camera360: false,
        parkingSensors: false,

        // Climate Features
        climateControl: false,
        heatedSeats: false,
        ventilatedSeats: false,

        // Lighting Features
        ledHeadlights: false,
        adaptiveHeadlights: false,
        ambientLighting: false,

        // Entertainment Features
        bluetooth: false,
        appleCarPlay: false,
        androidAuto: false,
        premiumSound: false,
        wirelessCharging: false,

        // Convenience Features
        keylessEntry: false,
        sunroof: false,
        spareKey: false,
        remoteStart: false
      },
      interiorColor: "#000000",
      engine: "",
      horsepower: 0,
      torque: 0,
      warranty: "",
      serviceHistory: "",
      previousOwners: 0,
      registrationStatus: "",
      vin: "",
      engineNumber: "",
      accidentFree: false,
      importStatus: "",
      registrationExpiry: "",
      insuranceType: "",
      upholsteryMaterial: "",
      tireCondition: "",
      bodyType: "",
      roofType: "",
      customsCleared: "",
      warrantyPeriod: "",
      serviceHistoryDetails: "",
      additionalNotes: "",
      customMake: "",
      customModel: ""
    }
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
    const savedData = sessionStorage.getItem("createListingFormData");
    return savedData ? JSON.parse(savedData) : initialFormState;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save form data to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("createListingFormData", JSON.stringify(formData));
  }, [formData]);

  // Handle step navigation
  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleBasicDetailsSubmit = (data: FormState, isValid: boolean) => {
    if (isValid) {
      setFormData((prev) => {
        // Merge the new data with the existing data, preserving all fields
        const updatedData: FormState = {
          ...prev,
          title: data.title || prev.title,
          description: data.description || prev.description,
          price:
            typeof data.price === "string"
              ? parseFloat(data.price) || 0
              : data.price,
          location: data.location || prev.location,
          images: data.images || prev.images,
          category: {
            ...prev.category,
            ...(data.category || {}),
          },
          details: {
            vehicles:
              data.category.mainCategory === ListingCategory.VEHICLES
                ? {
                    vehicleType:
                      data.details?.vehicles?.vehicleType || VehicleType.CAR,
                    make: data.details?.vehicles?.make || "",
                    model: data.details?.vehicles?.model || "",
                    year:
                      (typeof data.details?.vehicles?.year === 'string' ? parseInt(data.details.vehicles.year, 10) : data.details?.vehicles?.year) ||
                      new Date().getFullYear(),
                    mileage: typeof data.details?.vehicles?.mileage === 'string' ? parseInt(data.details.vehicles.mileage, 10) || 0 : (data.details?.vehicles?.mileage || 0),
                    fuelType: data.details?.vehicles?.fuelType || FuelType.GASOLINE,
                    transmissionType:
                      data.details?.vehicles?.transmissionType ||
                      TransmissionType.AUTOMATIC,
                    color: data.details?.vehicles?.color || "#000000",
                    condition:
                      data.details?.vehicles?.condition || undefined,
                    features: data.details?.vehicles?.features || [],
                    interiorColor:
                      data.details?.vehicles?.interiorColor ||
                      prev.details?.vehicles?.interiorColor ||
                      "#000000",
                    engine: data.details?.vehicles?.engine || "",
                    warranty:
                      data.details?.vehicles?.warranty?.toString() || "",
                    serviceHistory:
                      data.details?.vehicles?.serviceHistory ||
                      prev.details?.vehicles?.serviceHistory ||
                      "none",
                    previousOwners:
                      data.details?.vehicles?.previousOwners ??
                      prev.details?.vehicles?.previousOwners ??
                      0,
                    registrationStatus:
                      data.details?.vehicles?.registrationStatus ||
                      prev.details?.vehicles?.registrationStatus ||
                      "unregistered",
                  }
                : undefined,
            realEstate:
              data.category.mainCategory === ListingCategory.REAL_ESTATE
                ? {
                    propertyType:
                      data.details?.realEstate?.propertyType ||
                      PropertyType.HOUSE,
                    size: data.details?.realEstate?.size || "",
                    yearBuilt: data.details?.realEstate?.yearBuilt || "",
                    bedrooms: data.details?.realEstate?.bedrooms || "",
                    bathrooms: data.details?.realEstate?.bathrooms || "",
                    condition:
                      data.details?.realEstate?.condition || undefined,
                    features: data.details?.realEstate?.features || [],
                  }
                : undefined,
          },
        };
        // Save to session storage
        sessionStorage.setItem(
          "createListingFormData",
          JSON.stringify(updatedData),
        );
        return updatedData;
      });
      setStep((prev) => prev + 1);
      toast.success(t("stepSaved"), {
        id: "step-saved",
        duration: 2000,
      });
    } else {
      toast.error(t("completeAllRequiredFields"), {
        id: "validation-error",
        duration: 3000,
      });
      console.error("Basic details form validation failed");
    }
  };

  const handleAdvancedDetailsSubmit = (data: any, isValid: boolean) => {
    console.log("Advanced details form data:", data);
    if (isValid) {
      console.log("Advanced details submitted:", data);
      // Ensure we preserve all feature values

      setFormData((prev) => {
        // Deep merge the details objects
        const mergedVehicles =
          data.category.mainCategory === ListingCategory.VEHICLES
            ? {
                ...prev.details?.vehicles,
                ...data.details?.vehicles,
                // Ensure all fields have proper fallback values
                vehicleType: data.details?.vehicles?.vehicleType || prev.details?.vehicles?.vehicleType || VehicleType.CAR,
                make: data.details?.vehicles?.make || prev.details?.vehicles?.make || "",
                model: data.details?.vehicles?.model || prev.details?.vehicles?.model || "",
                year: typeof data.details?.vehicles?.year === 'string' ? parseInt(data.details.vehicles.year, 10) : (data.details?.vehicles?.year || prev.details?.vehicles?.year || new Date().getFullYear()),
                mileage: data.details?.vehicles?.mileage || prev.details?.vehicles?.mileage || 0,
                fuelType: data.details?.vehicles?.fuelType || prev.details?.vehicles?.fuelType || FuelType.GASOLINE,
                transmissionType: data.details?.vehicles?.transmissionType || prev.details?.vehicles?.transmissionType || TransmissionType.AUTOMATIC,
                color: data.details?.vehicles?.color || prev.details?.vehicles?.color || "#000000",
                condition: data.details?.vehicles?.condition || prev.details?.vehicles?.condition || Condition.GOOD,
                // Handle vehicle features as a properly typed object
                features: {
                  ...prev.details?.vehicles?.features,
                  // Convenience features
                  keylessEntry: data.details?.vehicles?.features?.keylessEntry ?? prev.details?.vehicles?.features?.keylessEntry ?? false,
                  sunroof: data.details?.vehicles?.features?.sunroof ?? prev.details?.vehicles?.features?.sunroof ?? false,
                  spareKey: data.details?.vehicles?.features?.spareKey ?? prev.details?.vehicles?.features?.spareKey ?? false,
                  remoteStart: data.details?.vehicles?.features?.remoteStart ?? prev.details?.vehicles?.features?.remoteStart ?? false,
                  // Safety features
                  blindSpotMonitor: data.details?.vehicles?.features?.blindSpotMonitor ?? prev.details?.vehicles?.features?.blindSpotMonitor ?? false,
                  laneAssist: data.details?.vehicles?.features?.laneAssist ?? prev.details?.vehicles?.features?.laneAssist ?? false,
                  adaptiveCruiseControl: data.details?.vehicles?.features?.adaptiveCruiseControl ?? prev.details?.vehicles?.features?.adaptiveCruiseControl ?? false,
                  // Camera features
                  rearCamera: data.details?.vehicles?.features?.rearCamera ?? prev.details?.vehicles?.features?.rearCamera ?? false,
                  camera360: data.details?.vehicles?.features?.camera360 ?? prev.details?.vehicles?.features?.camera360 ?? false,
                  parkingSensors: data.details?.vehicles?.features?.parkingSensors ?? prev.details?.vehicles?.features?.parkingSensors ?? false,
                  // Ensure climate features are preserved
                  climateControl: data.details?.vehicles?.features?.climateControl ?? prev.details?.vehicles?.features?.climateControl ?? false,
                  heatedSeats: data.details?.vehicles?.features?.heatedSeats ?? prev.details?.vehicles?.features?.heatedSeats ?? false,
                  ventilatedSeats: data.details?.vehicles?.features?.ventilatedSeats ?? prev.details?.vehicles?.features?.ventilatedSeats ?? false,
                  // Ensure lighting features are preserved
                  ledHeadlights: data.details?.vehicles?.features?.ledHeadlights ?? prev.details?.vehicles?.features?.ledHeadlights ?? false,
                  adaptiveHeadlights: data.details?.vehicles?.features?.adaptiveHeadlights ?? prev.details?.vehicles?.features?.adaptiveHeadlights ?? false,
                  ambientLighting: data.details?.vehicles?.features?.ambientLighting ?? prev.details?.vehicles?.features?.ambientLighting ?? false,
                  // Ensure entertainment features are preserved
                  bluetooth: data.details?.vehicles?.features?.bluetooth ?? prev.details?.vehicles?.features?.bluetooth ?? false,
                  appleCarPlay: data.details?.vehicles?.features?.appleCarPlay ?? prev.details?.vehicles?.features?.appleCarPlay ?? false,
                  androidAuto: data.details?.vehicles?.features?.androidAuto ?? prev.details?.vehicles?.features?.androidAuto ?? false,
                  premiumSound: data.details?.vehicles?.features?.premiumSound ?? prev.details?.vehicles?.features?.premiumSound ?? false,
                  wirelessCharging: data.details?.vehicles?.features?.wirelessCharging ?? prev.details?.vehicles?.features?.wirelessCharging ?? false
                },
                interiorColor: data.details?.vehicles?.interiorColor || prev.details?.vehicles?.interiorColor || "#000000",
                engine: data.details?.vehicles?.engine || prev.details?.vehicles?.engine || "",
                horsepower: data.details?.vehicles?.horsepower || prev.details?.vehicles?.horsepower || 0,
                torque: data.details?.vehicles?.torque || prev.details?.vehicles?.torque || 0,
                warranty: data.details?.vehicles?.warranty || prev.details?.vehicles?.warranty || "",
            }
            : undefined;

        const mergedRealEstate =
          data.category.mainCategory === ListingCategory.REAL_ESTATE
            ? (() => {
                const propertyType = data.details?.realEstate?.propertyType || prev.details?.realEstate?.propertyType || PropertyType.HOUSE;
                const baseDetails = {
                  size: data.details?.realEstate?.size || prev.details?.realEstate?.size || 0,
                  yearBuilt: data.details?.realEstate?.yearBuilt || prev.details?.realEstate?.yearBuilt || new Date().getFullYear(),
                  condition: (data.details?.realEstate?.condition || prev.details?.realEstate?.condition || Condition.GOOD) as Condition,
                  features: data.details?.realEstate?.features || prev.details?.realEstate?.features || []
                };

                switch (propertyType) {
                  case PropertyType.HOUSE: {
                    const houseDetails: HouseDetails = {
                      ...baseDetails,
                      propertyType: PropertyType.HOUSE,
                      bedrooms: data.details?.realEstate?.bedrooms || prev.details?.realEstate?.bedrooms || 1,
                      bathrooms: data.details?.realEstate?.bathrooms || prev.details?.realEstate?.bathrooms || 1,
                      floors: data.details?.realEstate?.floors || prev.details?.realEstate?.floors || 1,
                      parkingSpaces: data.details?.realEstate?.parkingSpaces || prev.details?.realEstate?.parkingSpaces || 0,
                      garage: data.details?.realEstate?.garage ?? prev.details?.realEstate?.garage ?? false,
                      garden: data.details?.realEstate?.garden ?? prev.details?.realEstate?.garden ?? false,
                      petsAllowed: data.details?.realEstate?.petsAllowed ?? prev.details?.realEstate?.petsAllowed ?? false,
                      constructionType: data.details?.realEstate?.constructionType || prev.details?.realEstate?.constructionType || '',
                      parking: data.details?.realEstate?.parking || prev.details?.realEstate?.parking || ''
                    };
                    return houseDetails;
                  }
                  case PropertyType.APARTMENT: {
                    const apartmentDetails: ApartmentDetails = {
                      ...baseDetails,
                      propertyType: PropertyType.APARTMENT,
                      bedrooms: data.details?.realEstate?.bedrooms || prev.details?.realEstate?.bedrooms || 1,
                      bathrooms: data.details?.realEstate?.bathrooms || prev.details?.realEstate?.bathrooms || 1,
                      floor: data.details?.realEstate?.floor || prev.details?.realEstate?.floor || 1,
                      totalFloors: data.details?.realEstate?.totalFloors || prev.details?.realEstate?.totalFloors || 1,
                      elevator: data.details?.realEstate?.elevator ?? prev.details?.realEstate?.elevator ?? false,
                      balcony: data.details?.realEstate?.balcony ?? prev.details?.realEstate?.balcony ?? false,
                      storage: data.details?.realEstate?.storage ?? prev.details?.realEstate?.storage ?? false,
                      heating: data.details?.realEstate?.heating || prev.details?.realEstate?.heating || '',
                      cooling: data.details?.realEstate?.cooling || prev.details?.realEstate?.cooling || '',
                      buildingAmenities: data.details?.realEstate?.buildingAmenities || prev.details?.realEstate?.buildingAmenities || [],
                      energyRating: data.details?.realEstate?.energyRating || prev.details?.realEstate?.energyRating || '',
                      furnished: data.details?.realEstate?.furnished || prev.details?.realEstate?.furnished || '',
                      petPolicy: data.details?.realEstate?.petPolicy || prev.details?.realEstate?.petPolicy || '',
                      view: data.details?.realEstate?.view || prev.details?.realEstate?.view || '',
                      securityFeatures: data.details?.realEstate?.securityFeatures || prev.details?.realEstate?.securityFeatures || [],
                      fireSafety: data.details?.realEstate?.fireSafety || prev.details?.realEstate?.fireSafety || [],
                      flooringType: data.details?.realEstate?.flooringType || prev.details?.realEstate?.flooringType || '',
                      internetIncluded: data.details?.realEstate?.internetIncluded ?? prev.details?.realEstate?.internetIncluded ?? false,
                      windowType: data.details?.realEstate?.windowType || prev.details?.realEstate?.windowType || '',
                      accessibilityFeatures: data.details?.realEstate?.accessibilityFeatures || prev.details?.realEstate?.accessibilityFeatures || [],
                      renovationHistory: data.details?.realEstate?.renovationHistory || prev.details?.realEstate?.renovationHistory || '',
                      parkingType: data.details?.realEstate?.parkingType || prev.details?.realEstate?.parkingType || '',
                      utilities: data.details?.realEstate?.utilities || prev.details?.realEstate?.utilities || [],
                      exposureDirection: data.details?.realEstate?.exposureDirection || prev.details?.realEstate?.exposureDirection || [],
                      storageType: data.details?.realEstate?.storageType || prev.details?.realEstate?.storageType || [],
                      constructionType: data.details?.realEstate?.constructionType || prev.details?.realEstate?.constructionType || ''
                    };
                    return apartmentDetails;
                  }
                  case PropertyType.LAND: {
                    const landDetails: LandDetails = {
                      ...baseDetails,
                      propertyType: PropertyType.LAND,
                      zoning: data.details?.realEstate?.zoning || prev.details?.realEstate?.zoning || '',
                      utilities: data.details?.realEstate?.utilities ?? prev.details?.realEstate?.utilities ?? false,
                      roadAccess: data.details?.realEstate?.roadAccess ?? prev.details?.realEstate?.roadAccess ?? false,
                      buildable: data.details?.realEstate?.buildable ?? prev.details?.realEstate?.buildable ?? true,
                      fenced: data.details?.realEstate?.fenced ?? prev.details?.realEstate?.fenced ?? false,
                      waterFeatures: data.details?.realEstate?.waterFeatures ?? prev.details?.realEstate?.waterFeatures ?? false,
                      soilType: data.details?.realEstate?.soilType || prev.details?.realEstate?.soilType || ''
                    };
                    return landDetails;
                  }
                  default: {
                    const defaultHouseDetails: HouseDetails = {
                      ...baseDetails,
                      propertyType: PropertyType.HOUSE,
                      bedrooms: 1,
                      bathrooms: 1,
                      floors: 1,
                      parkingSpaces: 0,
                      garage: false,
                      garden: false,
                      petsAllowed: false,
                      constructionType: '',
                      parking: ''
                    };
                    return defaultHouseDetails;
                  }
                }
              })()
            : undefined;

        // Log the merged data objects
        console.log("Merged vehicles data:", mergedVehicles);
        console.log("Merged real estate data:", mergedRealEstate);

        // Updated form data with merged details
        const updatedData: FormState = {
          ...prev,
          details: {
            vehicles: mergedVehicles,
            realEstate: mergedRealEstate,
          },
        };

        console.log("Updated form data after advanced details:", updatedData);

        // Save to session storage
        sessionStorage.setItem(
          "createListingFormData",
          JSON.stringify(updatedData),
        );
        return updatedData;
      });

      setStep((prev) => prev + 1);
      toast.success(t("stepSaved"), {
        id: "step-saved",
        duration: 2000,
      });
    } else {
      toast.error(t("completeAllRequiredFields"), {
        id: "validation-error",
        duration: 3000,
      });
      console.error("Advanced details form validation failed");
    }
  };

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
        (data.listingAction || "sell").toUpperCase(),
      );
      formData.append("mainCategory", data.category?.mainCategory || "");
      formData.append("subCategory", data.category?.subCategory || "");

      // Add details
      if (data.details) {
        const details = {
          vehicles:
            data.details.vehicles && data.category?.subCategory === "TRACTOR"
              ? {
                  // Map TRACTOR to CONSTRUCTION for backend compatibility
                  vehicleType: VehicleType.CONSTRUCTION,
                  make: data.details.vehicles.make,
                  model: data.details.vehicles.model,
                  year:
                    parseInt(data.details.vehicles.year || ""),
                  mileage: parseInt(data.details.vehicles.mileage || ""),
                  fuelType: data.details.vehicles.fuelType,
                  transmissionType: data.details.vehicles.transmissionType,
                  color: data.details.vehicles.color || "#000000",
                  condition: data.details.vehicles.condition,
                  features: data.details.vehicles.features || [],
                  // Tractor specific fields
                  horsepower: parseInt(
                    data.details.vehicles.horsepower?.toString() || "",
                  ),
                  attachments: data.details.vehicles.attachments || [],
                  fuelTankCapacity:
                    data.details.vehicles.fuelTankCapacity || "",
                  tires: data.details.vehicles.tires || "",
                  // Required base fields
                  brakeType: data.details.vehicles.brakeType || "standard",
                  engineSize: data.details.vehicles.engineSize || "standard",
                  interiorColor:
                    data.details.vehicles.interiorColor || "#000000",
                  engine: data.details.vehicles.engine || "",
                  warranty:
                    parseInt(
                      data.details.vehicles.warranty?.toString() || "",
                    ),
                  serviceHistory:
                    data.details.vehicles.serviceHistory || "none",
              }
            : undefined,
        };
        formData.append("details", JSON.stringify(details));
      }

      // Add images
      if (data.images && data.images.length > 0) {
        const fileImages = data.images.filter(
          (image): image is File => image instanceof File,
        );
        if (fileImages.length === 0) {
          throw new Error("At least one image is required");
        }
        fileImages.forEach((image, index) => {
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
      await submitListing(formData);

      // Clear form data from session storage after successful submission
      sessionStorage.removeItem("createListingFormData");

      // Reset form and navigate
      setFormData(initialFormState);
      setStep(1);
      toast.success(t("listings.createListing"), {
        duration: 3000,
        icon: "🎉",
      });
      navigate("/listings");
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
          <BasicDetailsForm
            initialData={formData}
            onSubmit={(data, isValid) =>
              handleBasicDetailsSubmit(data as unknown as FormState, isValid)
            }
          />
        );
      case 2:
        return (
          <AdvancedDetailsForm
            formData={formData}
            onSubmit={(data, isValid) =>
              handleAdvancedDetailsSubmit(data, isValid)
            }
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ReviewSection
            formData={formData}
            onSubmit={(formData: FormState) => {
              handleFinalSubmit(formData);
            }}
            onBack={handleBack}
            onEdit={handleEditSection}
          />
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