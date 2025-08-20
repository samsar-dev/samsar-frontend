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
import { toast } from "sonner";
import type { FormState } from "@/types/listings";
import { cleanLocationString } from "@/utils/locationUtils";

import type { ExtendedFormState } from "../steps/AdvancedDetailsForm";

export const handleBasicDetailsSubmit = (
  data: ExtendedFormState,
  isValid: boolean,
  setFormData: Dispatch<SetStateAction<FormState>>,
  setStep: Dispatch<SetStateAction<number>>,
  t: TFunction<"translation", undefined>,
  isImageDelete: boolean = false,
) => {
  if (isValid && !isImageDelete) {
    setFormData((prev) => {
      // Merge the new data with the existing data, preserving all fields
      const updatedData: FormState = {
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        price:
          typeof data.price === "string"
            ? parseFloat(data.price) || 0
            : (data.price ?? prev.price),
        location: data.location
          ? cleanLocationString(data.location)
          : prev.location,
        images: data.images || prev.images,
        category: {
          ...prev.category,
          ...(data.category || {}),
        },
        details: {
          ...prev.details,
          ...data.details,
          // Flat structure - all fields directly on details object
          ...(data.category?.mainCategory === ListingCategory.VEHICLES && {
            vehicleType: VehicleType.CARS,
            make: data.details?.make || prev.details?.make || "",
            model: data.details?.model || prev.details?.model || "",
            year: (
              data.details?.year ||
              prev.details?.year ||
              new Date().getFullYear()
            ).toString(),
            mileage: Number(
              data.details?.mileage ||
                prev.details?.mileage ||
                0,
            ),
            fuelType:
              data.details?.fuelType ||
              prev.details?.fuelType ||
              FuelType.GASOLINE,
            transmissionType:
              data.details?.transmissionType ||
              prev.details?.transmissionType ||
              TransmissionType.AUTOMATIC,
          }),
          ...(data.category?.mainCategory === ListingCategory.REAL_ESTATE && {
            propertyType: PropertyType.HOUSE,
            area:
              data.details?.area ||
              prev.details?.area ||
              0,
            yearBuilt: parseInt(
              data.details?.yearBuilt?.toString() ||
                prev.details?.yearBuilt?.toString() ||
                new Date().getFullYear().toString(),
            ),
            bedrooms:
              data.details?.bedrooms ||
              prev.details?.bedrooms ||
              "0",
            bathrooms:
              data.details?.bathrooms ||
              prev.details?.bathrooms ||
              "0",
            condition:
              data.details?.condition ||
              prev.details?.condition ||
              Condition.LIKE_NEW,
            floor: Number(
              data.details?.floor ||
                prev.details?.floor ||
                1,
            ),
            internetIncluded: Boolean(
              data.details?.internetIncluded ??
                prev.details?.internetIncluded,
            ),
          }),
        },
      };
      // Save to session storage
      sessionStorage.setItem(
        "createListingFormData",
        JSON.stringify(updatedData),
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
