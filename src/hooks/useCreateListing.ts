import type { SingleListingResponse } from "@/api/listings.api";
import { createListing } from "@/api/listings.api";
import {
  Condition,
  ListingAction,
  ListingCategory,
  PropertyType,
  TransmissionType,
  VehicleType,
} from "@/types/enums";
import type { FormState, VehicleFeatures } from "@/types/listings";
import { useState } from "react";
import { toast } from "sonner";

export interface UseCreateListingReturn {
  formData: FormState;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleFieldChange: (field: string, value: any) => void;
  handleSubmit: (
    data: FormData | FormState,
  ) => Promise<SingleListingResponse | undefined>;
}

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
  details: {
    // @ts-expect-error: The 'vehicles' property is not guaranteed to exist in the 'responseData.details' object
    vehicles: {
      vehicleType: VehicleType.CARS,
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      mileage: 0,
      fuelType: "",
      transmissionType: TransmissionType.AUTOMATIC,
      color: "#000000",
      condition: Condition.GOOD,
      features: {},
      interiorColor: "#000000",
      engine: "",
      horsepower: undefined,
      torque: undefined,
      warranty: "",
      serviceHistory: "",
      previousOwners: undefined,
      registrationStatus: "",
      engineNumber: "",
      accidentFree: false,
      importStatus: "",
      registrationExpiry: "",
      insuranceType: "",
      upholsteryMaterial: "",
      tireCondition: "",
      customMake: "",
      customModel: "",
    },
  },
  listingAction: ListingAction.SALE,
};

export const useCreateListing = (): UseCreateListingReturn => {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: FormState) => {
      const keys = field.split(".");
      const newFormData = { ...prev };
      let current: any = newFormData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newFormData;
    });
  };

  const validateForm = (data: FormState) => {
    const newErrors: Record<string, string> = {};
    const missingFields: string[] = [];

    // Basic validation rules with detailed logging
    if (!data.title?.trim()) {
      newErrors["title"] = "Title is required";
      missingFields.push("title");
    }
    if (!data.description?.trim()) {
      newErrors["description"] = "Description is required";
      missingFields.push("description");
    }
    const numericPrice =
      typeof data.price === "string" ? parseFloat(data.price) : data.price || 0;
    if (isNaN(numericPrice) || numericPrice <= 0) {
      newErrors["price"] = "Valid price is required";
      missingFields.push("price");
    }
    if (!data.location?.trim()) {
      newErrors["location"] = "Location is required";
      missingFields.push("location");
    }
    if (!data.category?.mainCategory) {
      newErrors["category.mainCategory"] = "Category is required";
      missingFields.push("category.mainCategory");
    }
    if (!data.category?.subCategory) {
      newErrors["category.subCategory"] = "Subcategory is required";
      missingFields.push("category.subCategory");
    }
    if (!data.images || data.images.length === 0) {
      newErrors["images"] = "At least one image is required";
      missingFields.push("images");
    }

    // Category-specific validation with detailed logging
    if (data.category?.mainCategory === ListingCategory.VEHICLES) {
      const vehicles = data.details?.vehicles;
      if (!vehicles) {
        newErrors["details.vehicles"] = "Vehicle details are required";
        missingFields.push("details.vehicles");
      } else {
        const vehicleFields = {
          make: vehicles.make,
          model: vehicles.model,
          year: vehicles.year,
          mileage: vehicles.mileage,
          fuelType: vehicles.fuelType,
          transmissionType: vehicles.transmissionType,
          color: vehicles.color,
          condition: vehicles.condition,
          interiorColor: vehicles.interiorColor,
          warranty: vehicles.warranty?.toString(),
          serviceHistory: vehicles.serviceHistory?.toString(),
          previousOwners: vehicles.previousOwners,
          registrationStatus: vehicles.registrationStatus?.toString(),
        };

        // Log vehicle field values
        console.log("Vehicle field values:", vehicleFields);

        Object.entries(vehicleFields).forEach(([field, value]) => {
          if (!value) {
            newErrors[`details.vehicles.${field}`] = `${field} is required`;
            missingFields.push(`details.vehicles.${field}`);
          }
        });
      }
    } else if (data.category?.mainCategory === ListingCategory.REAL_ESTATE) {
      const realEstate = data.details?.realEstate;
      if (!realEstate) {
        newErrors["details.realEstate"] = "Real estate details are required";
        missingFields.push("details.realEstate");
      } else {
        const realEstateFields = {
          propertyType: realEstate.propertyType,
          size: realEstate.size,
          yearBuilt: realEstate.yearBuilt,
          bedrooms: realEstate.bedrooms,
          bathrooms: realEstate.bathrooms,
          condition: realEstate.condition,
        };

        // Log real estate field values
        console.log("Real estate field values:", realEstateFields);

        Object.entries(realEstateFields).forEach(([field, value]) => {
          if (!value) {
            newErrors[`details.realEstate.${field}`] = `${field} is required`;
            missingFields.push(`details.realEstate.${field}`);
          }
        });
      }
    }

    if (Object.keys(newErrors).length > 0) {
      console.error("Validation errors:", {
        errors: newErrors,
        missingFields: missingFields,
        formData: {
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          category: data.category,
          images: data.images?.length,
          details: data.details,
        },
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    data: FormData | FormState,
  ): Promise<SingleListingResponse | undefined> => {
    try {
      setIsSubmitting(true);

      if (!(data instanceof FormData)) {
        // Log the incoming data
        console.log("Incoming form data:", {
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          category: data.category,
          images: data.images?.length,
          details: data.details,
        });

        // Validate and normalize form data
        if (!validateForm(data)) {
          console.error("Form validation failed. Current errors:", errors);
          throw new Error("Form validation failed");
        }

        // Create a new FormData instance
        const formData = new FormData();

        // Ensure price is a valid number
        const price =
          typeof data.price === "string"
            ? parseFloat(data.price)
            : data.price || 0;
        if (isNaN(price)) {
          throw new Error("Invalid price format");
        }

        // Add basic fields with null checks
        formData.append("title", data.title || "");
        formData.append("description", data.description || "");
        formData.append("price", price.toString());
        formData.append("location", data.location || "");
        formData.append(
          "listingAction",
          (data.listingAction || "sale").toUpperCase(),
        );

        // Add category information
        const category = {
          mainCategory: data.category?.mainCategory || ListingCategory.VEHICLES,
          subCategory: data.category?.subCategory || VehicleType.CARS,
        };
        formData.append("category", JSON.stringify(category));

        // Add details based on category
        const details = {
          vehicles:
            data.category?.mainCategory === ListingCategory.VEHICLES
              ? {
                  ...data.details?.vehicles,
                  vehicleType:
                    data.details?.vehicles?.vehicleType || VehicleType.CARS,
                  make:
                    data.details?.vehicles?.make === "OTHER_MAKE" &&
                    data.details?.vehicles?.customMake
                      ? data.details?.vehicles?.customMake
                      : data.details?.vehicles?.make || "",
                  model:
                    data.details?.vehicles?.model === "CUSTOM_MODEL" &&
                    data.details?.vehicles?.customModel
                      ? data.details?.vehicles?.customModel
                      : data.details?.vehicles?.model || "",
                  year:
                    data.details?.vehicles?.year ||
                    new Date().getFullYear().toString(),
                  mileage: data.details?.vehicles?.mileage || "",
                  fuelType: data.details?.vehicles?.fuelType || "",
                  transmissionType:
                    data.details?.vehicles?.transmissionType ||
                    TransmissionType.AUTOMATIC,
                  color: data.details?.vehicles?.color || "#000000",
                  condition:
                    data.details?.vehicles?.condition || Condition.GOOD,
                  features: {
                    ...(data.details?.vehicles?.features as VehicleFeatures),
                  },
                  interiorColor:
                    data.details?.vehicles?.interiorColor || "#000000",
                  warranty: data.details?.vehicles?.warranty?.toString() || "",
                  serviceHistory: data.details?.vehicles?.serviceHistory || "",
                  previousOwners:
                    data.details?.vehicles?.previousOwners?.toString() || "",
                  registrationStatus:
                    data.details?.vehicles?.registrationStatus || "",
                  engine: data.details?.vehicles?.engine || "",
                  horsepower:
                    data.details?.vehicles?.horsepower?.toString() || "",
                  torque: data.details?.vehicles?.torque?.toString() || "",
                }
              : undefined,
          realEstate:
            data.category?.mainCategory === ListingCategory.REAL_ESTATE
              ? {
                  ...data.details?.realEstate,
                  propertyType:
                    data.details?.realEstate?.propertyType ||
                    PropertyType.HOUSE,
                  size: data.details?.realEstate?.size || "",
                  yearBuilt: parseInt(
                    data.details?.realEstate?.yearBuilt.toString() ||
                      new Date().getFullYear().toString(),
                  ),
                  bedrooms: data.details?.realEstate?.bedrooms || "",
                  bathrooms: data.details?.realEstate?.bathrooms || "",
                  condition:
                    data.details?.realEstate?.condition || Condition.GOOD,
                  features: data.details?.realEstate?.features || [],
                }
              : undefined,
        };
        formData.append("details", JSON.stringify(details));

        // Add images
        if (data.images && data.images.length > 0) {
          data.images.forEach((image, index) => {
            if (image instanceof File) {
              // Use a unique field name for each image with index
              formData.append(`image_${index}`, image);
            }
          });
        }

        // Log the FormData entries for debugging
        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
          console.log(
            `${key}:`,
            value instanceof File ? `File: ${value.name}` : value,
          );
        }

        // Submit the form data
        const response = await createListing(formData);
        if (response.success) {
          toast.success("Listing created successfully!");
          return response.data;
        } else {
          throw new Error(response.error || "Failed to create listing");
        }
      } else {
        // If data is already FormData, submit it directly
        const response = await createListing(data);
        if (response.success) {
          toast.success("Listing created successfully!");
          return response.data;
        } else {
          throw new Error(response.error || "Failed to create listing");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while creating the listing";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
  };
};

export default useCreateListing;
