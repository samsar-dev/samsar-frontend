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
import type { FormState } from "@/types/listings";
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
  locationMeta: undefined,
  latitude: undefined,
  longitude: undefined,
  images: [],
  details: {
    // Flat structure for listing details
    vehicleType: VehicleType.CARS,
    make: "",
    model: "",
    year: new Date().getFullYear().toString(),
    mileage: 0,
    fuelType: "",
    transmissionType: TransmissionType.AUTOMATIC,
    color: "#000000",
    condition: Condition.GOOD,
    features: [],
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
    // Real estate fields
    propertyType: PropertyType.HOUSE,
    area: 0,
    yearBuilt: new Date().getFullYear(),
    bedrooms: "",
    bathrooms: "",
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
    if (data.category?.mainCategory === ListingCategory.VEHICLES && data.details?.vehicleType) {
      console.log("Vehicle details found:", data.details);
      console.log("Vehicle type:", data.details.vehicleType);
      if (!data.details?.make?.trim()) {
        newErrors["details.make"] = "Make is required";
        missingFields.push("details.make");
      }
      if (!data.details?.model?.trim()) {
        newErrors["details.model"] = "Model is required";
        missingFields.push("details.model");
      }
      if (!data.details?.year?.toString().trim()) {
        newErrors["details.year"] = "Year is required";
        missingFields.push("details.year");
      }
      // Validate mileage only if it's been set to something other than empty string
      // Allow empty string as "not yet provided" for advanced fields
      const mileageValue = data.details?.mileage;
      if (mileageValue !== undefined && mileageValue !== "" && !mileageValue?.toString().trim()) {
        newErrors["details.mileage"] = "Mileage is required";
        missingFields.push("details.mileage");
      } else if (mileageValue === "" || mileageValue === undefined) {
        // Allow empty/undefined for now - will be validated in advanced step
        // This prevents validation errors when moving from basic to review
      }
      if (!data.details?.fuelType?.trim()) {
        newErrors["details.fuelType"] = "Fuel type is required";
        missingFields.push("details.fuelType");
      }
      if (!data.details?.transmissionType?.trim()) {
        newErrors["details.transmissionType"] = "Transmission type is required";
        missingFields.push("details.transmissionType");
      }
    }

    if (data.category?.mainCategory === ListingCategory.REAL_ESTATE && data.details?.propertyType) {
      console.log("Real estate details found:", data.details);
      console.log("Property type:", data.details.propertyType);
      if (!data.details?.area?.toString().trim()) {
        newErrors["details.area"] = "Area is required";
        missingFields.push("details.area");
      }
      if (!data.details?.condition?.trim()) {
        newErrors["details.condition"] = "Condition is required";
        missingFields.push("details.condition");
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

        // Add details using flat structure
        const details = {
          // Use flat structure - merge all details directly
          ...(data.details || {}),
          // Set category-specific defaults for vehicles
          // Flat structure - all fields are directly on details object
          vehicleType: data.details?.vehicleType || VehicleType.CARS,
          make: data.details?.make === "OTHER_MAKE" && data.details?.customMake
            ? data.details?.customMake
            : data.details?.make || "",
          model: data.details?.model === "CUSTOM_MODEL" && data.details?.customModel
            ? data.details?.customModel
            : data.details?.model || "",
          year: data.details?.year || new Date().getFullYear().toString(),
          mileage: data.details?.mileage || "",
          fuelType: data.details?.fuelType || "",
          transmissionType: data.details?.transmissionType || TransmissionType.AUTOMATIC,
          color: data.details?.color || "#000000",
          condition: data.details?.condition || Condition.GOOD,
          features: data.details?.features || {},
          interiorColor: data.details?.interiorColor || "#000000",
          warranty: data.details?.warranty?.toString() || "",
          serviceHistory: data.details?.serviceHistory || "",
          previousOwners: data.details?.previousOwners?.toString() || "",
          registrationStatus: data.details?.registrationStatus || "",
          engine: data.details?.engine || "",
          horsepower: data.details?.horsepower?.toString() || "",
          torque: data.details?.torque?.toString() || "",
          propertyType: data.details?.propertyType || PropertyType.HOUSE,
          area: data.details?.area || "",
          yearBuilt: parseInt(data.details?.yearBuilt?.toString() || new Date().getFullYear().toString()),
          bedrooms: data.details?.bedrooms || "",
          bathrooms: data.details?.bathrooms || "",
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
        
        // Debug logging to see what's being sent
        console.log("=== DEBUG: useCreateListing Hook ===");
        console.log("Details object:", details);
        console.log("Vehicle type:", details?.vehicleType);
        console.log("=== END DEBUG ===");

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
