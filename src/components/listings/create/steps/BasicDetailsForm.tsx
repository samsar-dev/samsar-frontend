import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
} from "@/types/enums";
import type { FormState } from "@/types/listings";
import {
  FaCar,
  FaMotorcycle,
  FaTruck,
  FaShuttleVan,
  FaShip,
  FaTruckPickup,
  FaTag,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaAlignLeft,
  FaCarAlt,
  FaHome,
} from "react-icons/fa";
import { BiBuildings, BiBuildingHouse, BiLandscape } from "react-icons/bi";
import FormField from "@/components/common/FormField";
import {
  Car,
  Home,
  DollarSign,
  MapPin,
  Type,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Import vehicle model data from vehicleModels file
import {
  getMakesForType,
  getModelsForMakeAndType,
} from "../../data/vehicleModels";

interface BasicDetailsFormProps {
  initialData?: Partial<FormState>;
  onSubmit: (data: Partial<FormState>) => void;
}

const vehicleSubcategories = [
  { value: VehicleType.CAR, label: "Cars", icon: FaCar },
  { value: VehicleType.MOTORCYCLE, label: "Motorcycles", icon: FaMotorcycle },
  { value: VehicleType.TRUCK, label: "Trucks", icon: FaTruck },
  { value: VehicleType.RV, label: "RVs", icon: FaShuttleVan },
  { value: VehicleType.BOAT, label: "Boats", icon: FaShip },
  { value: VehicleType.OTHER, label: "Other Vehicles", icon: FaTruckPickup },
] as const;

const realEstateSubcategories = [
  { value: PropertyType.HOUSE, label: "Houses", icon: BiBuildingHouse },
  { value: PropertyType.APARTMENT, label: "Apartments", icon: BiBuildings },
  { value: PropertyType.LAND, label: "Land", icon: BiLandscape },
  { value: PropertyType.COMMERCIAL, label: "Commercial", icon: BiBuildings },
  { value: PropertyType.OTHER, label: "Other", icon: BiBuildings },
] as const;

const BasicDetailsForm: React.FC<BasicDetailsFormProps> = ({ initialData, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<FormState>>({
    title: '',
    description: '',
    price: 0,
    category: {
      mainCategory: ListingCategory.VEHICLES,
      subCategory: VehicleType.CAR
    },
    location: '',
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);

  // Add new state for make and model fields
  const [makeValue, setMakeValue] = useState<string>("");
  const [modelValue, setModelValue] = useState<string>("");
  const [yearValue, setYearValue] = useState<string>(
    new Date().getFullYear().toString(),
  );

  // Initialize make, model, and year values from initialData
  useEffect(() => {
    if (initialData?.details?.vehicles) {
      const { make, model, year } = initialData.details.vehicles;
      if (make) setMakeValue(make);
      if (model) setModelValue(model);
      if (year) setYearValue(year);
    }
  }, [initialData]);

  // Helper function to convert VehicleType enum to string
  const getVehicleDataType = (vehicleType: VehicleType): VehicleType => {
    return vehicleType;
  };

  // Generate make options for the current vehicle type
  const generateMakeOptions = () => {
    if (
      !formData?.category?.mainCategory ||
      formData.category?.mainCategory !== ListingCategory.VEHICLES
    ) {
      return [];
    }

    const vehicleType = formData.category?.subCategory as VehicleType;
    const makes = getMakesForType(vehicleType);

    if (!makes || makes.length === 0) {
      console.warn(`No makes found for vehicle type: ${vehicleType}`);
      return [];
    }

    return makes
      .map((make) => ({
        value: make,
        label: make,
      }))
      .concat([{ value: "OTHER_MAKE", label: "Other" }]);
  };

  // Generate model options based on selected make
  const getModelOptions = (make: string): { value: string; label: string }[] => {
    if (!make || !formData?.category?.mainCategory || formData.category.mainCategory !== ListingCategory.VEHICLES) {
      return [];
    }

    const vehicleType = formData.category.subCategory as VehicleType;
    const models = getModelsForMakeAndType(make, vehicleType);

    if (!models || models.length === 0) {
      console.warn(`No models found for make: ${make} and type: ${vehicleType}`);
      return [];
    }

    // Add "Custom" option only if make is not "Other_MAKE"
    const options = models.map((model) => ({
      value: model,
      label: model,
    }));

    if (make !== "OTHER_MAKE") {
      options.push({ value: "CUSTOM_MODEL", label: "Custom" });
    }

    return options;
  };

const handleMakeChange = (value: string) => {
    setMakeValue(value);
    setFormData((prev: FormState) => ({
      ...prev,
      details: {
        ...prev.details,
        vehicles: {
          ...prev.details?.vehicles,
          make: value,
        }
      }
    }));
    // Reset customMake if not "Other"
    if (value !== "OTHER_MAKE") {
      setFormData((prev: FormState) => ({
        ...prev,
        details: {
          ...prev.details,
          vehicles: {
            ...prev.details?.vehicles,
            customMake: ""
          }
        }
      }));
    }
};

  // Handle model selection
  const handleModelChange = (value: string) => {
    setModelValue(value);
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        vehicles: {
          ...(prev.details?.vehicles || {}),
          model: value
        }
      }
    }));
  };

  // Modified handleInputChange to also update make/model/year state when those fields change directly
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: FormState) => {
      const newFormData = { ...prev };
      
      // Handle nested fields
      if (field.startsWith("details.")) {
        const parts = field.split(".");
        const category = parts[1];
        const subField = parts[2];
        
        if (!newFormData.details) {
          newFormData.details = {};
        }
        
        if (!newFormData.details[category]) {
          newFormData.details[category] = {};
        }
        
        newFormData.details[category][subField] = value;
      } else {
        newFormData[field] = value;
      }

      return newFormData;
    });

    // Reset model when make changes
    if (field === "details.vehicles.make") {
      setFormData((prev: FormState) => ({
        ...prev,
        details: {
          ...prev.details,
          vehicles: {
            ...prev.details?.vehicles,
            model: "",
            customModel: "",
          },
        },
      }));
    }
  };

  // Initialize make/model/year values from formData
  useEffect(() => {
    if (formData?.details?.vehicles) {
      // Set make value from form data
      if (formData.details.vehicles.make) {
        setMakeValue(formData.details.vehicles.make);
      }

      // Set model value from form data
      if (formData.details.vehicles.model) {
        setModelValue(formData.details.vehicles.model);
      }

      // Set year value from form data
      if (formData?.details?.vehicles?.year) {
        setYearValue(formData.details.vehicles.year);
      }
    }
  }, [
    formData?.details?.vehicles?.make,
    formData?.details?.vehicles?.model,
    formData?.details?.vehicles?.year,
  ]);

  // Effect to update title when make, model, or year changes
  useEffect(() => {
    if (makeValue && modelValue) {
      // Get the selected make and model labels
      const vehicleType = formData?.category?.subCategory as VehicleType;
      const makes = getMakesForType(vehicleType);
      const models = getModelsForMakeAndType(makeValue, vehicleType);

      // Find the make and model with proper capitalization
      const makeLabel =
        makes.find((m) => m === makeValue) ||
        makeValue;
      const modelLabel =
        models.find((m) => m === modelValue) ||
        modelValue;

      // Generate the title
      const autoTitle = `${makeLabel} ${modelLabel} ${yearValue}`;

      // Only update if title is empty or previously auto-generated
      if (
        autoTitle &&
        (!formData.title ||
          formData.title === "" ||
          formData.title.startsWith("🚗") ||
          formData.title.startsWith("🏠"))
      ) {
        handleInputChange("title", autoTitle);
      }

      // Also update the vehicle details in formData
      if (
        formData?.category?.mainCategory === ListingCategory.VEHICLES &&
        formData?.details?.vehicles
      ) {
        setFormData((prev: FormState) => ({
          ...prev,
          details: {
            ...prev.details,
            vehicles: {
              ...prev.details.vehicles!,
              make: makeLabel,
              model: modelLabel,
              year: yearValue,
            },
          },
        }));
      }
    }
  }, [
    makeValue,
    modelValue,
    yearValue,
    formData?.location,
    formData?.category?.subCategory,
  ]);

  // Add a debug log for make and model values
  useEffect(() => {
    console.log("Current vehicle data:", {
      vehicleType: formData?.category?.subCategory,
      makeValue,
      modelValue,
      yearValue,
      formDataMake: formData?.details?.vehicles?.make,
      formDataModel: formData?.details?.vehicles?.model,
      formDataYear: formData?.details?.vehicles?.year,
      title: formData?.title,
    });
  }, [
    makeValue,
    modelValue,
    yearValue,
    formData?.details?.vehicles,
    formData?.title,
    formData?.category?.subCategory,
  ]);

  // Initialize the form with defaults if needed
  useEffect(() => {
    if (!formData?.category?.mainCategory) {
      handleCategoryChange(ListingCategory.VEHICLES, VehicleType.CAR);
    }
  }, []);

  const handleCategoryChange = (
    mainCategory: ListingCategory,
    subCategory: VehicleType | PropertyType,
  ) => {
    // Update the category in form data
    setFormData((prev: FormState) => {
  const updatedData: FormState = {
    ...prev,
    category: {
      mainCategory,
      subCategory,
    },
    details: {
      ...prev.details, // <-- Preserve existing nested state
    },
  };

  if (mainCategory === ListingCategory.VEHICLES) {
    updatedData.details.vehicles = {
      ...prev.details?.vehicles, // Keep existing values if any
      vehicleType: subCategory as VehicleType,
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      mileage: "",
      fuelType: FuelType.GASOLINE,
      transmissionType: TransmissionType.AUTOMATIC,
      color: "",
      condition: Condition.GOOD,
      features: [],
    };
    delete updatedData.details?.realEstate; // Clear real estate if switching
  } else if (mainCategory === ListingCategory.REAL_ESTATE) {
    updatedData.details.realEstate = {
      ...updatedData.details?.realEstate,
      propertyType: subCategory as PropertyType,
      size: "",
      yearBuilt: "",
      bedrooms: "",
      bathrooms: "",
      condition: Condition.GOOD,
      features: [],
    };
    delete updatedData.details?.vehicles; // Clear vehicles if switching
  }

  return updatedData;
});


    // Clear any category-related errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.category;
      return newErrors;
    });

    // Mark category as touched
    setTouched((prev) => ({
      ...prev,
      category: true,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Image upload started");

    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      console.log(`Selected ${fileArray.length} files`, fileArray);

      // Check file size and type
      const validFiles = fileArray.filter((file) => {
        const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(
          file.type,
        );
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max

        if (!isValidType) {
          console.error(`Invalid file type: ${file.type}`);
        }
        if (!isValidSize) {
          console.error(`File too large: ${file.size / (1024 * 1024)}MB`);
        }

        return isValidType && isValidSize;
      });

      if (validFiles.length < fileArray.length) {
        // Show error message about invalid files
        setErrors((prev) => ({
          ...prev,
          images:
            "Some files were rejected. Please use JPEG or PNG images under 5MB.",
        }));
      }

      console.log(`${validFiles.length} valid files to be added`);

      // Update the form data with the new images
      const newImages = [...formData?.images || [], ...validFiles];
      setFormData({
        ...formData,
        images: newImages,
      });
      console.log("Images updated in form state", newImages);
    }
  };

  // Handle image removal function
  const handleRemoveImage = (index: number) => {
    const newImages = [...formData?.images || []];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages,
    });

    console.log(
      `Removed image at index ${index}, ${newImages.length} images remaining`,
    );
  };

  // Enhanced validation function to ensure all required fields are checked
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Basic fields validation
    if (!formData.title?.trim()) newErrors.title = t("fieldRequired");
    if (!formData.description?.trim())
      newErrors.description = t("fieldRequired");
    if (!formData.price) {
      newErrors.price = t("fieldRequired");
    } else {
      const price = parseFloat(formData.price.toString());
      if (isNaN(price) || price <= 0) {
        newErrors.price = t("validPriceRequired");
      }
    }
    if (!formData.location?.trim()) newErrors.location = t("fieldRequired");
    if (!formData.category?.mainCategory) {
      newErrors.mainCategory = t("categoryRequired");
    }
    if (!formData.category?.subCategory) {
      newErrors.subCategory = t("subcategoryRequired");
    }
    if (!formData.images || formData.images.length === 0) {
      newErrors.images = t("errors.atLeastOneImage");
    }

    // Vehicle specific validation
    if (formData.category?.mainCategory === ListingCategory.VEHICLES) {
      const vehicles = formData.details?.vehicles;

      if (!vehicles?.vehicleType) {
        newErrors["details.vehicles.vehicleType"] = t("fieldRequired");
      }

      // Validate make
      if (!vehicles?.make) {
        newErrors["details.vehicles.make"] = t("fieldRequired");
      }

      // Validate custom make if "Other" is selected
      if (vehicles?.make === "OTHER_MAKE" && !vehicles?.make?.trim()) {
        newErrors["details.vehicles.make"] = t("fieldRequired");
      }

      // Validate model
      if (!vehicles?.model) {
        newErrors["details.vehicles.model"] = t("fieldRequired");
      }

      // Validate custom model if "Custom" is selected
      if (vehicles?.model === "CUSTOM_MODEL" && !vehicles?.model?.trim()) {
        newErrors["details.vehicles.model"] = t("fieldRequired");
      }

      // Validate year
      if (!vehicles?.year) {
        newErrors["details.vehicles.year"] = t("fieldRequired");
      } else {
        const year = parseInt(vehicles.year as string);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear + 1) {
          newErrors["details.vehicles.year"] = t("validYearRequired");
        }
      }
    }

    // Real estate specific validation
    if (formData.category?.mainCategory === ListingCategory.REAL_ESTATE) {
      const realEstate = formData.details?.realEstate;

      if (!realEstate?.propertyType) {
        newErrors["details.realEstate.propertyType"] = t("fieldRequired");
      }
    }

    // Log for debugging
    console.log("Validation errors:", newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhance handleSubmit for better feedback
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    // Mark all fields as touched for validation display
    const allFieldsTouched: Record<string, boolean> = {};

    // Basic fields
    const basicFields = [
      "title",
      "description",
      "price",
      "location",
      "category",
    ];
    basicFields.forEach((field) => {
      allFieldsTouched[field] = true;
    });

    // Category-specific fields
    if (formData?.category?.mainCategory === ListingCategory.VEHICLES) {
      const vehicleFields = [
        "details.vehicles.vehicleType",
        "details.vehicles.make",
        "details.vehicles.model",
        "details.vehicles.year",
      ];
      vehicleFields.forEach((field) => {
        allFieldsTouched[field] = true;
      });

      // Add custom fields if needed
      if (formData.details?.vehicles?.make === "OTHER_MAKE") {
        allFieldsTouched["details.vehicles.customMake"] = true;
      }
      if (formData.details?.vehicles?.model === "CUSTOM_MODEL") {
        allFieldsTouched["details.vehicles.customModel"] = true;
      }
    } else if (formData?.category?.mainCategory === ListingCategory.REAL_ESTATE) {
      allFieldsTouched["details.realEstate.propertyType"] = true;
    }

    setTouched(allFieldsTouched);

    // Perform validation
    const isValid = validateForm();
    console.log("Form validation result:", isValid);

    // Prepare the data to be submitted
    const dataToSubmit = {
      ...formData,
      details: {
        ...formData.details,
        vehicles: formData?.category?.mainCategory === ListingCategory.VEHICLES ? {
          ...(formData.details?.vehicles || {}),
          make: makeValue,
          model: modelValue,
          year: yearValue,
          vehicleType: formData?.category?.subCategory as VehicleType,
        } : undefined,
        realEstate: formData?.category?.mainCategory === ListingCategory.REAL_ESTATE ? {
          ...(formData.details?.realEstate || {}),
          propertyType: formData?.category?.subCategory as PropertyType,
        } : undefined,
      },
      images: formData?.images?.filter((image: File | string) => image instanceof File),
      existingImages: formData?.images?.filter((image: File | string) => typeof image === 'string')
    };

    // Log the final submission data
    console.log("Current vehicle data:", {
      vehicleType: formData?.category?.subCategory,
      makeValue,
      modelValue,
      yearValue,
      formDataMake: formData?.details?.vehicles?.make,
      formDataModel: formData?.details?.vehicles?.model,
    });

    // Log the final submission data
    console.log("Submitting FormData with images");

    // Call the parent's onSubmit function with prepared data and validation status
    onSubmit(dataToSubmit, isValid);
    setIsSubmitting(false);
  };

  // Add new function to generate year options based on make/model
  const getYearOptions = () => {
    if (
      !formData?.category?.mainCategory ||
      formData?.category?.mainCategory !== ListingCategory.VEHICLES
    ) {
      return [];
    }

    // If we don't have a selected make or model, just provide a reasonable range of years
    if (
      !makeValue ||
      !modelValue ||
      makeValue === "OTHER_MAKE" ||
      modelValue === "CUSTOM_MODEL"
    ) {
      // Default range: 30 years back to next year
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 30;
      const years = [];

      for (let year = currentYear + 1; year >= startYear; year--) {
        years.push({ value: year.toString(), label: year.toString() });
      }

      return years;
    }

    // For the full implementation, we would check what years the specific make/model was available
    // This would require additional data about model years
    // For now, we'll use a reasonable range of 30 years
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 30;
    const years = [];

    for (let year = currentYear + 1; year >= startYear; year--) {
      years.push({ value: year.toString(), label: year.toString() });
    }

    return years;
  };

  // Update the renderVehicleFields function to use the year dropdown with manual input option
  const renderVehicleFields = () => {
    if (formData?.category?.mainCategory !== ListingCategory.VEHICLES)
      return null;

    const vehicleType = formData?.category?.subCategory as VehicleType;
    const vehicleDataType = getVehicleDataType(vehicleType);

    // Log current state
    console.log("Current vehicle data:", {
      vehicleType,
      makeValue,
      modelValue,
      yearValue,
      formDataMake: formData.details?.vehicles?.make,
      formDataModel: formData.details?.vehicles?.model,
    });
    const makes = generateMakeOptions();
    const models = getModelOptions(makeValue);
    const years = getYearOptions();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            {renderMakeField()}
            {renderCustomMakeField()}
          </div>

          <div className="md:col-span-1">
            <FormField
              id="field-model"
              label={t("model")}
              type="select"
              value={modelValue}
              onChange={(e) => handleModelChange(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  "details.vehicles.model": true,
                }))
              }
              error={
                touched["details.vehicles.model"]
                  ? errors["details.vehicles.model"]
                  : undefined
              }
              options={models}
              required={true}
              placeholder={t("selectModel")}
              disabled={
                !makeValue ||
                (makeValue === "OTHER_MAKE" &&
                  !formData.details?.vehicles?.make)
              }
            />

            {modelValue === "CUSTOM_MODEL" && (
              <div className="mt-2">
                <FormField
                  id="field-custom-model"
                  label={t("customModel")}
                  type="text"
                  value={formData.details?.vehicles?.model || ""}
                  onChange={(e) => {
                    handleInputChange(
                      "details.vehicles.model",
                      e.target.value,
                    );

                    // Update title immediately when custom model changes
                    const make = formData.details?.vehicles?.make || "";
                    const model = formData.details?.vehicles?.model || "";
                    const year = formData.details?.vehicles?.year || "";

                    if (make && model) {
                      const autoTitle = `${make === "OTHER_MAKE" ? formData.details?.vehicles?.make || "" : make} ${model === "CUSTOM_MODEL" ? e.target.value : model} ${year}`;
                      handleInputChange("title", autoTitle);
                    }
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({
                      ...prev,
                      "details.vehicles.customModel": true,
                    }))
                  }
                  error={
                    touched["details.vehicles.customModel"]
                      ? errors["details.vehicles.customModel"]
                      : undefined
                  }
                  placeholder={t("enterModel")}
                  required={true}
                />
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <FormField
              id="field-year"
              label={t("year")}
              type="select"
              value={yearValue.toString()}
              onChange={(e) => {
                const year = e.target.value;
                handleInputChange("details.vehicles.year", year);

                // Update title if make and model already selected
                const make =
                  makeValue === "OTHER_MAKE"
                    ? formData.details?.vehicles?.make || ""
                    : makeValue;
                const model =
                  modelValue === "CUSTOM_MODEL"
                    ? formData.details?.vehicles?.model || ""
                    : modelValue;

                if (make && model) {
                  const autoTitle = `${make} ${model} ${year}`;
                  handleInputChange("title", autoTitle);
                }
              }}
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  "details.vehicles.year": true,
                }))
              }
              error={
                touched["details.vehicles.year"]
                  ? errors["details.vehicles.year"]
                  : undefined
              }
              options={years}
              required={true}
              placeholder={t("selectYear")}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render the make field
  const renderMakeField = () => {
    const makeValue = formData.details?.vehicles?.make || "";
    const makes = generateMakeOptions();

    return (
      <FormField
        id="field-make"
        label={t("make")}
        type="select"
        value={makeValue}
        onChange={(e) => handleMakeChange(e.target.value)}
        onBlur={() =>
          setTouched((prev) => ({
            ...prev,
            "details.vehicles.make": true,
          }))
        }
        error={
          touched["details.vehicles.make"]
            ? errors["details.vehicles.make"]
            : undefined
        }
        options={makes}
        required={true}
        placeholder={t("selectMake")}
      />
    );
  };

  // Render the custom make field if "Other" is selected
  const renderCustomMakeField = () => {
    const makeValue = formData.details?.vehicles?.make || "";
    const customMakeValue = formData.details?.vehicles?.customMake || "";

    if (makeValue === "OTHER_MAKE") {
      return (
        <div className="mt-2">
          <FormField
            id="field-custom-make"
            label={t("customMake")}
            type="text"
            value={customMakeValue}
            onChange={(e) =>
              handleInputChange(
                "details.vehicles.customMake",
                e.target.value,
              )
            }
            onBlur={() =>
              setTouched((prev) => ({
                ...prev,
                "details.vehicles.customMake": true,
              }))
            }
            error={
              touched["details.vehicles.customMake"]
                ? errors["details.vehicles.customMake"]
                : undefined
            }
            placeholder={t("enterMake")}
            required={true}
          />
        </div>
      );
    }
    return null;
  };

  // Add a new function to render real estate specific fields
  const renderRealEstateFields = () => {
    if (formData?.category?.mainCategory !== ListingCategory.REAL_ESTATE) {
      return null;
    }

    return (
      <div className="mt-6 space-y-6">
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
          {t("propertyDetails")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {renderFormField(
              t("bedrooms"),
              "details.realEstate.bedrooms",
              "number",
              undefined,
              undefined,
              t("enterBedrooms"),
              0,
            )}
          </div>
          <div>
            {renderFormField(
              t("bathrooms"),
              "details.realEstate.bathrooms",
              "number",
              undefined,
              undefined,
              t("enterBathrooms"),
              0,
              undefined,
              0.5,
              true,
              t("halfBathroomsAllowed"),
            )}
          </div>
        </div>
      </div>
    );
  };

  // Fixed renderFormField function to properly handle React icons and number vs string type for helpText
  const renderFormField = (
    label: string,
    fieldName: string,
    type: string = "text",
    options?: Array<{ value: string; label: string }>,
    icon?: React.ReactNode,
    placeholder?: string,
    min?: number,
    max?: number,
    step?: number,
    required: boolean = true,
    helpText?: string,
  ) => {
    const fieldId = `field-${fieldName}`;
    const fieldPath = fieldName.includes(".")
      ? fieldName.split(".")
      : [fieldName];

    // Get the value from nested objects if needed
    let fieldValue: any = formData;
    for (const path of fieldPath) {
      if (fieldValue && typeof fieldValue === "object") {
        fieldValue = fieldValue[path];
      } else {
        fieldValue = undefined;
        break;
      }
    }

    // Get error for this field
    const fieldError = errors[fieldName];
    const isTouched = touched[fieldName];

    const handleChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const newValue =
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

      handleInputChange(fieldName, newValue);
    };

    return (
      <div className={`relative ${icon ? "pl-8" : ""}`}>
        {icon && (
          <div className="absolute left-0 top-8 text-gray-400">{icon}</div>
        )}
        <FormField
          id={fieldId}
          label={label}
          type={type as any}
          value={fieldValue || ""}
          onChange={handleChange}
          onBlur={() => setTouched((prev) => ({ ...prev, [fieldName]: true }))}
          error={isTouched ? fieldError : undefined}
          placeholder={placeholder}
          options={options}
          required={required}
          min={min}
          max={max}
          step={step}
          helpText={helpText}
        />
      </div>
    );
  };

  // Add missing render vehicle and real estate select functions
  const renderVehicleSelect = () => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          {t("vehicleType")}
          <span className="text-red-600 ml-1" aria-hidden="true">
            *
          </span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(VehicleType).map((type) => (
            <button
              key={type}
              type="button"
              className={`flex flex-col items-center p-3 border rounded-lg ${
                formData?.category?.subCategory === type
                  ? "bg-blue-500 text-white"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() =>
                handleCategoryChange(ListingCategory.VEHICLES, type)
              }
            >
              <FaCarAlt className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">
                {t(`vehicleTypes.${type}`)}
              </span>
            </button>
          ))}
        </div>
        {errors.category && touched.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>
    );
  };

  const renderRealEstateSelect = () => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {t("propertyType")}
          <span className="text-red-600 ml-1" aria-hidden="true">
            *
          </span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(PropertyType).map((type) => (
            <button
              key={type}
              type="button"
              className={`flex flex-col items-center p-3 border rounded-lg ${
                formData?.category?.subCategory === type
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() =>
                handleCategoryChange(ListingCategory.REAL_ESTATE, type)
              }
            >
              <FaHome className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">
                {t(`propertyTypes.${type}`)}
              </span>
            </button>
          ))}
        </div>
        {errors.category && touched.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Category Selection Tab */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            {t("category")}
          </h2>

          <div className="flex justify-start mb-6">
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() =>
                  handleCategoryChange(
                    ListingCategory.VEHICLES,
                    VehicleType.CAR,
                  )
                }
                className={`px-4 py-2 text-sm font-medium rounded-l-md focus:outline-none focus:z-10 ${
                  formData?.category?.mainCategory === ListingCategory.VEHICLES
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                }`}
                aria-pressed={
                  formData?.category?.mainCategory === ListingCategory.VEHICLES
                }
              >
                <FaCar className="inline-block mr-2 -mt-1" />
                {t("vehicles")}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCategoryChange(
                    ListingCategory.REAL_ESTATE,
                    PropertyType.HOUSE,
                  )
                }
                className={`px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none focus:z-10 ${
                  formData?.category?.mainCategory === ListingCategory.REAL_ESTATE
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                }`}
                aria-pressed={
                  formData?.category?.mainCategory === ListingCategory.REAL_ESTATE
                }
              >
                <BiBuildingHouse className="inline-block mr-2 -mt-1" />
                {t("realEstate")}
              </button>
            </div>
          </div>

          {/* Subcategory selection */}
          {formData?.category?.mainCategory === ListingCategory.VEHICLES
            ? renderVehicleSelect()
            : renderRealEstateSelect()}
        </div>

        {/* Basic Details Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            {t("listingDetails")}
          </h2>

          {/* Title field with auto-generation helper text */}
          {renderFormField(
            t("title"),
            "title",
            "text",
            undefined,
            <FaTag className="w-4 h-4" />, //
            t("titlePlaceholder"),
            undefined,
            undefined,
            makeValue && modelValue ? t("autoGeneratedFromDetails") : undefined,
          )}

          {/* Render Make, Model, Year fields for vehicles */}
          {formData.category?.mainCategory === ListingCategory.VEHICLES &&
            renderVehicleFields()}

          {/* Render property-specific fields for real estate */}
          {formData.category?.mainCategory === ListingCategory.REAL_ESTATE &&
            renderRealEstateFields()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {renderFormField(
              t("price"),
              "price",
              "number",
              undefined,
              <FaMoneyBillWave className="w-4 h-4" />,
              t("pricePlaceholder"),
              0,
            )}
            {renderFormField(
              t("location"),
              "location",
              "text",
              undefined,
              <FaMapMarkerAlt className="w-4 h-4" />,
              t("locationPlaceholder"),
            )}
          </div>

          {renderFormField(
            t("description"),
            "description",
            "textarea",
            undefined,
            <FaAlignLeft className="w-4 h-4" />,
            t("descriptionPlaceholder"),
          )}
          {/* Image uploader will go here */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("images")}
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            </label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 015.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus-within:outline-none"
                  >
                    <span>{t("uploadImages")}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="pl-1">{t("dragAndDrop")}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            </div>

            {/* Preview of uploaded images */}
            {formData.images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("uploadedImages")} ({formData.images.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.images.map((image: File | string, index: number) => (
                    <div
                      key={index}
                      className="relative border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden h-24"
                    >
                      {image instanceof File ? (
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                        onClick={() => handleRemoveImage(index)}
                        aria-label={t("removeImage")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting || uploadingImages}
            className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSubmitting || uploadingImages ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {t("submitting")}
              </div>
            ) : (
              t("next")
            )}
          </button>
        </div>
      </form>

      {/* Loading overlay */}
      {(isSubmitting || uploadingImages) && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>{uploadingImages ? t("uploadingImages") : t("submitting")}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BasicDetailsForm;
