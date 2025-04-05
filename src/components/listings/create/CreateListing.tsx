import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCreateListing } from "@/components/listings/hooks/useCreateListing";
import {
  ListingCategory,
  VehicleType,
  FuelType,
  TransmissionType,
  PropertyType,
  Condition,
} from "@/types/enums";
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
      year: new Date().getFullYear().toString(),
      mileage: "",
      fuelType: FuelType.GASOLINE,
      transmissionType: TransmissionType.AUTOMATIC,
      color: "",
      condition: Condition.GOOD,
      features: [],
      interiorColor: "",
      engine: "",
      warranty: "",
      serviceHistory: "",
      previousOwners: 0,
      registrationStatus: ""
    },
  },
  listingAction: "sell"
};

const CreateListing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleSubmit: submitListing } = useCreateListing();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(() => {
    // Try to load saved form data from session storage
    const savedData = sessionStorage.getItem('createListingFormData');
    return savedData ? JSON.parse(savedData) : initialFormState;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save form data to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('createListingFormData', JSON.stringify(formData));
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
          price: typeof data.price === 'string' ? parseFloat(data.price) || 0 : data.price,
          location: data.location || prev.location,
          images: data.images || prev.images,
          category: {
            ...prev.category,
            ...(data.category || {}),
          },
          details: {
            vehicles: data.category.mainCategory === ListingCategory.VEHICLES ? {
              vehicleType: data.details?.vehicles?.vehicleType || VehicleType.CAR,
              make: data.details?.vehicles?.make || "",
              model: data.details?.vehicles?.model || "",
              year: data.details?.vehicles?.year || new Date().getFullYear().toString(),
              mileage: data.details?.vehicles?.mileage || "",
              fuelType: data.details?.vehicles?.fuelType || FuelType.GASOLINE,
              transmissionType: data.details?.vehicles?.transmissionType || TransmissionType.AUTOMATIC,
              color: data.details?.vehicles?.color || "",
              condition: data.details?.vehicles?.condition || Condition.GOOD,
              features: data.details?.vehicles?.features || [],
              interiorColor: data.details?.vehicles?.interiorColor || prev.details?.vehicles?.interiorColor || "#000000",
              warranty: data.details?.vehicles?.warranty ?? prev.details?.vehicles?.warranty ?? 0,
              serviceHistory: data.details?.vehicles?.serviceHistory || prev.details?.vehicles?.serviceHistory || "none",
              previousOwners: data.details?.vehicles?.previousOwners ?? prev.details?.vehicles?.previousOwners ?? 0,
              registrationStatus: data.details?.vehicles?.registrationStatus || prev.details?.vehicles?.registrationStatus || "unregistered",
            } : undefined,
            realEstate: data.category.mainCategory === ListingCategory.REAL_ESTATE ? {
              propertyType: data.details?.realEstate?.propertyType || PropertyType.HOUSE,
              size: data.details?.realEstate?.size || "",
              yearBuilt: data.details?.realEstate?.yearBuilt || "",
              bedrooms: data.details?.realEstate?.bedrooms || "",
              bathrooms: data.details?.realEstate?.bathrooms || "",
              condition: data.details?.realEstate?.condition || Condition.GOOD,
              features: data.details?.realEstate?.features || [],
            } : undefined,
          }
        };
        // Save to session storage
        sessionStorage.setItem('createListingFormData', JSON.stringify(updatedData));
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

  const handleAdvancedDetailsSubmit = (data: FormState, isValid: boolean) => {
    if (isValid) {
      setFormData((prev) => {
        // Merge the new data with the existing data, preserving all fields
        const updatedData: FormState = {
          ...prev,
          details: {
            vehicles: data.category.mainCategory === ListingCategory.VEHICLES ? {
              vehicleType: data.details?.vehicles?.vehicleType || prev.details?.vehicles?.vehicleType || VehicleType.CAR,
              make: data.details?.vehicles?.make || prev.details?.vehicles?.make || "",
              model: data.details?.vehicles?.model || prev.details?.vehicles?.model || "",
              year: data.details?.vehicles?.year || prev.details?.vehicles?.year || new Date().getFullYear().toString(),
              mileage: data.details?.vehicles?.mileage || "",
              fuelType: data.details?.vehicles?.fuelType || FuelType.GASOLINE,
              transmissionType: data.details?.vehicles?.transmissionType || TransmissionType.AUTOMATIC,
              color: data.details?.vehicles?.color || "",
              condition: data.details?.vehicles?.condition || Condition.GOOD,
              features: data.details?.vehicles?.features || [],
              interiorColor: data.details?.vehicles?.interiorColor || prev.details?.vehicles?.interiorColor || "#000000",
              warranty: data.details?.vehicles?.warranty ?? prev.details?.vehicles?.warranty ?? 0,
              serviceHistory: data.details?.vehicles?.serviceHistory || prev.details?.vehicles?.serviceHistory || "none",
              previousOwners: data.details?.vehicles?.previousOwners ?? prev.details?.vehicles?.previousOwners ?? 0,
              registrationStatus: data.details?.vehicles?.registrationStatus || prev.details?.vehicles?.registrationStatus || "unregistered",
            } : undefined,
            realEstate: data.category.mainCategory === ListingCategory.REAL_ESTATE ? {
              propertyType: data.details?.realEstate?.propertyType || prev.details?.realEstate?.propertyType || PropertyType.HOUSE,
              size: data.details?.realEstate?.size || "",
              yearBuilt: data.details?.realEstate?.yearBuilt || "",
              bedrooms: data.details?.realEstate?.bedrooms || "",
              bathrooms: data.details?.realEstate?.bathrooms || "",
              condition: data.details?.realEstate?.condition || Condition.GOOD,
              features: data.details?.realEstate?.features || [],
            } : undefined,
          },
        };
        // Save to session storage
        sessionStorage.setItem('createListingFormData', JSON.stringify(updatedData));
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
      console.log('Submitting form data:', data);
      
      // Add basic fields
      formData.append('title', data.title || '');
      formData.append('description', data.description || '');
      formData.append('price', data.price?.toString() || '0');
      formData.append('location', data.location || '');
      formData.append('listingAction', (data.listingAction || 'sell').toUpperCase());
      
      // Add category information
      if (data.category) {
        const category = {
          mainCategory: data.category.mainCategory,
          subCategory: data.category.subCategory
        };
        formData.append('category', JSON.stringify(category));
      }
      
      // Add details based on category
      if (data.details) {
        const details = data.category?.mainCategory === ListingCategory.VEHICLES
          ? {
              vehicles: {
                vehicleType: data.details.vehicles?.vehicleType || VehicleType.CAR,
                make: data.details.vehicles?.make || '',
                model: data.details.vehicles?.model || '',
                year: data.details.vehicles?.year || new Date().getFullYear().toString(),
                mileage: data.details.vehicles?.mileage || '0',
                fuelType: data.details.vehicles?.fuelType || FuelType.GASOLINE,
                transmissionType: data.details.vehicles?.transmissionType || TransmissionType.AUTOMATIC,
                color: data.details.vehicles?.color || '',
                condition: data.details.vehicles?.condition || Condition.GOOD,
                features: data.details.vehicles?.features || [],
                interiorColor: data.details.vehicles?.interiorColor || '',
                engine: data.details.vehicles?.engine || '',
                warranty: data.details.vehicles?.warranty || '',
                serviceHistory: data.details.vehicles?.serviceHistory || '',
                previousOwners: data.details.vehicles?.previousOwners || 0,
                registrationStatus: data.details.vehicles?.registrationStatus || ''
              }
            }
          : {
              realEstate: {
                propertyType: data.details.realEstate?.propertyType || PropertyType.HOUSE,
                size: data.details.realEstate?.size || '',
                yearBuilt: data.details.realEstate?.yearBuilt || '',
                bedrooms: data.details.realEstate?.bedrooms || '',
                bathrooms: data.details.realEstate?.bathrooms || '',
                condition: data.details.realEstate?.condition || Condition.GOOD,
                features: data.details.realEstate?.features || []
              }
            };
        formData.append('details', JSON.stringify(details));
      }
      
      // Add images
      if (data.images && data.images.length > 0) {
        const fileImages = data.images.filter((image): image is File => image instanceof File);
        if (fileImages.length === 0) {
          throw new Error('At least one image is required');
        }
        fileImages.forEach((image, index) => {
          formData.append('images', image);
        });
      } else {
        throw new Error('At least one image is required');
      }
      
      // Log the FormData entries for debugging
      console.log('FormData entries:');
      for (const pair of formData.entries()) {
        console.log(pair[0], ':', typeof pair[1] === 'string' ? pair[1] : 'File object');
      }

      // Submit the form
      await submitListing(formData);

      // Clear form data from session storage after successful submission
      sessionStorage.removeItem('createListingFormData');

      // Reset form and navigate
      setFormData(initialFormState);
      setStep(1);
      toast.success(t("success.listingCreated"), {
        duration: 3000,
        icon: "🎉",
      });
      navigate('/listings');
    } catch (error) {
      console.error("Error submitting listing:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create listing";
      setError(errorMessage);
      toast.error(t("errors.listingCreationFailed", { error: errorMessage }));
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
    if (section === 'images') {
      setTimeout(() => {
        const imageUpload = document.querySelector('#image-upload');
        if (imageUpload) {
          imageUpload.scrollIntoView({ behavior: 'smooth' });
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
            onSubmit={(data: FormState) => handleBasicDetailsSubmit(data, true)}
          />
        );
      case 2:
        return (
          <AdvancedDetailsForm
            initialData={formData}
            onSubmit={(data: FormState) => handleAdvancedDetailsSubmit(data, true)}
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
          {t("errors.submissionFailed")}
        </h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {t("tryAgain")}
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
            {t("createListing")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400" tabIndex={0}>
            {t("createListingDescription")}
          </p>

          {/* Accessible step indicator */}
          <div
            className="mt-8 mb-6"
            aria-label={`Step ${step} of 3: ${stepIcons[step - 1].label}`}
          >
            <div className="flex justify-between mb-2">
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
                  <span className="text-xs md:text-sm font-medium whitespace-nowrap">
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
              {renderStep()}
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
