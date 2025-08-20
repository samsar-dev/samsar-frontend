import {
  Condition,
  FuelType,
  ListingCategory,
  PropertyType,
  TransmissionType,
  VehicleType,
} from "@/types/enums";
import { toast } from "sonner";
import type {
  FormState,
} from "@/types/listings";
import type { ExtendedFormState } from "../steps/AdvancedDetailsForm";
import type { Dispatch, SetStateAction } from "react";
import type { TFunction } from "i18next";
import { cleanLocationString } from "@/utils/locationUtils";

export const handleAdvancedDetailsSubmit = (
  data: ExtendedFormState,
  isValid: boolean,
  setFormData: Dispatch<SetStateAction<FormState>>,
  setStep: Dispatch<SetStateAction<number>>,
  t: TFunction<"translation", undefined>,
) => {
  console.log("Advanced details form data:", data);
  console.log("Advanced details form validity:", isValid);
  if (isValid) {
    console.log("Advanced details submitted:", data);
    // Ensure we preserve all feature values

    setFormData((prev) => {
      // Clean location data if it exists
      const cleanedData = {
        ...data,
        location: data.location
          ? cleanLocationString(data.location)
          : prev.location,
      };
      // Deep merge the details objects using flat structure
      const mergedDetails = {
        ...prev.details,
        ...cleanedData.details,
        // Ensure all fields have proper fallback values based on category
        ...(cleanedData.category.mainCategory === ListingCategory.VEHICLES && {
          vehicleType: cleanedData.details?.vehicleType || prev.details?.vehicleType || VehicleType.CARS,
          make: cleanedData.details?.make || prev.details?.make || "",
          model: cleanedData.details?.model || prev.details?.model || "",
          year: cleanedData.details?.year || prev.details?.year || new Date().getFullYear().toString(),
          mileage: cleanedData.details?.mileage || prev.details?.mileage || "",
          fuelType: cleanedData.details?.fuelType || prev.details?.fuelType || FuelType.GASOLINE,
          transmissionType: cleanedData.details?.transmissionType || prev.details?.transmissionType || TransmissionType.AUTOMATIC,
          color: cleanedData.details?.color || prev.details?.color || "#000000",
          condition: cleanedData.details?.condition || prev.details?.condition || Condition.GOOD,
          features: cleanedData.details?.features || prev.details?.features || {},
        }),
        ...(cleanedData.category.mainCategory === ListingCategory.REAL_ESTATE && {
          propertyType: cleanedData.details?.propertyType || prev.details?.propertyType || PropertyType.HOUSE,
          area: cleanedData.details?.area || prev.details?.area || 0,
          condition: cleanedData.details?.condition || prev.details?.condition || Condition.GOOD,
          features: cleanedData.details?.features || prev.details?.features || [],
        }),
      };

      // Log the merged data objects
      console.log("Merged details data:", mergedDetails);

      // Updated form data with merged details
      const updatedData: FormState = {
        ...prev,
        ...cleanedData,
        details: mergedDetails,
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
