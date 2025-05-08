import {
    Condition,
    FuelType,
    ListingCategory,
    PropertyType,
    TransmissionType,
    VehicleType,
} from "@/types/enums";
import type { TFunction } from "i18next";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-hot-toast";
import type { FormState } from "../../../../types/listings";

import type { ExtendedFormState } from "../steps/AdvancedDetailsForm";

export const handleBasicDetailsSubmit = (
  data: ExtendedFormState,
  isValid: boolean,
  setFormData: Dispatch<SetStateAction<FormState>>,
  setStep: Dispatch<SetStateAction<number>>,
  t: TFunction<"translation", undefined>
) => {
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
                  vehicleType: VehicleType.CAR,
                  make: data.details?.vehicles?.make || "",
                  model: data.details?.vehicles?.model || "",
                  year: (
                    data.details?.vehicles?.year || new Date().getFullYear()
                  ).toString(),
                  mileage: Number(data.details?.vehicles?.mileage || 0),
                  fuelType:
                    data.details?.vehicles?.fuelType || prev.details?.vehicles?.fuelType || FuelType.GASOLINE,
                  transmissionType:
                    data.details?.vehicles?.transmissionType ||
                    prev.details?.vehicles?.transmissionType ||
                    TransmissionType.AUTOMATIC,
                }
              : undefined,
          realEstate:
            data.category.mainCategory === ListingCategory.REAL_ESTATE
              ? {
                  ...prev.details?.realEstate, // Preserve existing real estate details
                  ...data.details?.realEstate, // Merge with new data
                  id: prev.details?.realEstate?.id || "",
                  listingId: prev.details?.realEstate?.listingId || "",
                  propertyType: PropertyType.HOUSE,
                  size: data.details?.realEstate?.size || "0",
                  yearBuilt: parseInt(
                    data.details?.realEstate?.yearBuilt.toString() ||
                      new Date().getFullYear().toString()
                  ),
                  bedrooms: data.details?.realEstate?.bedrooms || "0",
                  bathrooms: data.details?.realEstate?.bathrooms || "0",
                  condition:
                    data.details?.realEstate?.condition || Condition.LIKE_NEW,
                  constructionType:
                    data.details?.realEstate?.constructionType || "",
                  features: data.details?.realEstate?.features || [],
                  parking: data.details?.realEstate?.parking || "",
                  floor: Number(data.details?.realEstate?.floor || 1),
                  totalFloors: Number(
                    data.details?.realEstate?.totalFloors || 1
                  ),
                  flooringTypes: data.details?.realEstate?.flooringTypes || [],
                  soilTypes: data.details?.realEstate?.soilTypes || [],
                  topography: data.details?.realEstate?.topography || [],
                  elevator: Boolean(data.details?.realEstate?.elevator),
                  balcony: Boolean(data.details?.realEstate?.balcony),
                  storage: Boolean(data.details?.realEstate?.storage),
                  heating: data.details?.realEstate?.heating || "",
                  cooling: data.details?.realEstate?.cooling || "",
                  buildingAmenities:
                    data.details?.realEstate?.buildingAmenities || [],
                  energyRating: data.details?.realEstate?.energyRating || "",
                  furnished: data.details?.realEstate?.furnished || "",
                  view: data.details?.realEstate?.view || "",
                  securityFeatures:
                    data.details?.realEstate?.securityFeatures || [],
                  fireSafety: data.details?.realEstate?.fireSafety || [],
                  flooringType: data.details?.realEstate?.flooringType || "",
                  internetIncluded: Boolean(
                    data.details?.realEstate?.internetIncluded
                  ),
                  windowType: data.details?.realEstate?.windowType || "",
                  accessibilityFeatures:
                    data.details?.realEstate?.accessibilityFeatures || [],
                  renovationHistory:
                    data.details?.realEstate?.renovationHistory || "",
                  parkingType: data.details?.realEstate?.parkingType || "",
                  utilities: data.details?.realEstate?.utilities || [],
                  exposureDirection:
                    data.details?.realEstate?.exposureDirection || [],
                  storageType: data.details?.realEstate?.storageType || [],
                  houseDetails: {
                    propertyType: PropertyType.HOUSE,
                    totalArea:
                      data.details?.realEstate?.size ||
                      prev.details?.realEstate?.size ||
                      0,
                    bedrooms: Number(data.details?.realEstate?.bedrooms || 0),
                    livingArea: Number(
                      data.details?.realEstate?.livingArea || 0
                    ),
                    stories: Number(data.details?.realEstate?.stories || 0),
                    bathrooms: Number(data.details?.realEstate?.bathrooms || 0),
                    yearBuilt: Number(
                      data.details?.realEstate?.yearBuilt ||
                        new Date().getFullYear()
                    ),
                    halfBathrooms: Number(
                      data.details?.realEstate?.halfBathrooms || 0
                    ),
                  },
                }
              : undefined,
        },
      };
      // Save to session storage
      sessionStorage.setItem(
        "createListingFormData",
        JSON.stringify(updatedData)
      );
      return updatedData;
    });
    setStep(2);
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
