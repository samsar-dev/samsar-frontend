import React, { useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ListingCategory,
  VehicleType,
  PropertyType,
  Condition,
} from "@/types/enums";
import type { FormState, RealEstateDetails } from "@/types/listings";
import {
  FaCar,
  FaMoneyBillWave,
  FaAlignLeft,
  FaCarAlt,
  FaHome,
} from "react-icons/fa";
import { realEstateBasicFields } from "@/components/listings/create/basic/BasicFieldSchemas";
import { BiBuildingHouse } from "react-icons/bi";
import FormField, { type FormFieldValue } from "@/components/form/FormField";

import { MapPin } from "lucide-react";
import Select from "react-select";
import ImageManager from "../../images/ImageManager";

// Import vehicle model data from vehicleModels file
import {
  getMakesForType,
  getModelsForMakeAndType,
} from "../../data/vehicleModels";

interface ExtendedVehicleDetails {
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: string;
  customMake?: string;
  customModel?: string;
  condition?: Condition;
  features?: string[];
}

interface ExtendedFormState extends Omit<FormState, "details"> {
  details: {
    vehicles?: ExtendedVehicleDetails;
    realEstate?: RealEstateDetails;
  };
  existingImages?: string[];
}

interface BasicDetailsFormProps {
  initialData: Partial<ExtendedFormState>;
  onSubmit: (data: ExtendedFormState, isValid: boolean) => void;
  onImageDelete?: () => void;
}

const BasicDetailsForm: React.FC<BasicDetailsFormProps> = ({
  initialData,
  onSubmit,
  onImageDelete,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ExtendedFormState>({
    title: "",
    description: "",
    price: 0,
    category: {
      mainCategory: ListingCategory.VEHICLES,
      subCategory: VehicleType.CAR,
    },
    location: "",
    details: {
      vehicles: {
        vehicleType: VehicleType.CAR,
        make: "",
        model: "",
        year: "",
      },
    },
    images: [],
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const getModelOptions = (
    make: string,
  ): { value: string; label: string }[] => {
    if (
      !make ||
      !formData?.category?.mainCategory ||
      formData.category.mainCategory !== ListingCategory.VEHICLES
    ) {
      return [];
    }

    const vehicleType = formData.category.subCategory as VehicleType;
    const models = getModelsForMakeAndType(make, vehicleType);

    if (!models || models.length === 0) {
      console.warn(
        `No models found for make: ${make} and type: ${vehicleType}`,
      );
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

  const handleMakeChange = (value: FormFieldValue) => {
    const makeStr =
      typeof value === "object" && value !== null && "value" in value
        ? value.value
        : String(value);
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        vehicles: {
          ...prev.details?.vehicles,
          make: makeStr,
          model: "", // Reset model when make changes
          vehicleType: prev.details?.vehicles?.vehicleType || VehicleType.CAR,
        } as ExtendedVehicleDetails,
      },
    }));

    // Clear customMake if not OTHER_MAKE
    if (makeStr !== "OTHER_MAKE") {
      handleInputChange("details.vehicles.customMake", "");
    }

    // Update title if year is available
    if (formData.details?.vehicles?.year) {
      const year = formData.details.vehicles.year;
      // Only update title if make is not OTHER_MAKE or if it's a regular make
      if (makeStr !== "OTHER_MAKE") {
        const autoTitle = `${makeStr} ${year}`;
        handleInputChange("title", autoTitle);
      }
    }
  };

  const handleModelChange = (value: FormFieldValue) => {
    const modelStr =
      typeof value === "object" && value !== null && "value" in value
        ? value.value
        : String(value);
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        vehicles: {
          ...prev.details?.vehicles,
          model: modelStr,
          vehicleType: prev.details?.vehicles?.vehicleType || VehicleType.CAR,
        } as ExtendedVehicleDetails,
      },
    }));

    // Auto-generate title if all fields are filled
    if (
      formData.details?.vehicles?.make &&
      modelStr &&
      formData.details.vehicles.year
    ) {
      const autoTitle = `${formData.details.vehicles.make} ${modelStr} ${formData.details.vehicles.year}`;
      handleInputChange("title", autoTitle);
    }
  };

  const handleInputChange = (
    path: keyof ExtendedFormState | string,
    value: string | number,
  ) => {
    setFormData((prev) => {
      const newState = { ...prev };
      if (path.includes(".")) {
        const [parent, child, subChild] = path.split(".");
        if (parent && child && parent in newState) {
          const parentObj = newState[parent as keyof ExtendedFormState] as any;
          if (typeof parentObj === "object" && parentObj !== null) {
            if (!parentObj[child]) {
              parentObj[child] = {};
            }
            // Handle size field for real estate
            if (
              parent === "details" &&
              child === "realEstate" &&
              subChild === "size"
            ) {
              parentObj[child] = {
                ...parentObj[child],
                size: value,
              };
            } else if (subChild) {
              parentObj[child] = {
                ...parentObj[child],
                [subChild]: value,
              };
            } else {
              parentObj[child] = value;
            }
          }
        }
      } else {
        (newState as any)[path] = value;
      }
      return newState;
    });

    // Clear any errors for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[path];
      return newErrors;
    });

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [path]: true,
    }));
  };

  const handleCategoryChange = (
    mainCategory: ListingCategory,
    subCategory: VehicleType | PropertyType,
  ) => {
    setFormData((prev: ExtendedFormState) => {
      const updatedData: ExtendedFormState = {
        ...prev,
        category: {
          mainCategory,
          subCategory,
        },
        details: {
          ...prev.details,
        },
      };

      if (mainCategory === ListingCategory.VEHICLES) {
        updatedData.details.vehicles = {
          ...prev.details?.vehicles,
          vehicleType: subCategory as VehicleType,
          make: "",
          model: "",
          year: "",
          condition: Condition.GOOD,
          features: [],
        };
        delete updatedData.details.realEstate;
      } else if (mainCategory === ListingCategory.REAL_ESTATE) {
        const propertyType = subCategory as PropertyType;
        if (
          propertyType === PropertyType.HOUSE ||
          propertyType === PropertyType.APARTMENT ||
          propertyType === PropertyType.LAND
        ) {
          // Create a minimal RealEstateDetails object with only the necessary fields

          const realEstateDetails: Partial<RealEstateDetails> = {
            id: "",
            listingId: "",
            propertyType,
            size: 0,
            yearBuilt: 0,
            condition: Condition.GOOD,
            features: [],
          };

          // Add property-specific fields based on property type
          if (
            propertyType === PropertyType.HOUSE ||
            propertyType === PropertyType.APARTMENT
          ) {
            realEstateDetails.bedrooms = 0;
            realEstateDetails.bathrooms = 0;
          }

          if (propertyType === PropertyType.APARTMENT) {
            realEstateDetails.floor = 0;
          }

          // Assign the details to the form data
          updatedData.details.realEstate =
            realEstateDetails as RealEstateDetails;
        }
        delete updatedData.details.vehicles;
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

  // Image handling is now managed by ImageManager component

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
    // Image validation is now handled by ImageManager component

    // Vehicle specific validation
    if (formData.category?.mainCategory === ListingCategory.VEHICLES) {
      const vehicles = formData.details?.vehicles;

      if (!vehicles?.vehicleType) {
        newErrors["details.vehicles.vehicleType"] = t("fieldRequired");
      }

      // Validate make
      if (!vehicles?.make) {
        newErrors["details.vehicles.make"] = t("fieldRequired");
      } else if (vehicles.make === "OTHER_MAKE") {
        // Validate custom make when "Other" is selected
        if (!vehicles.customMake?.trim()) {
          newErrors["details.vehicles.customMake"] = t("fieldRequired");
        }
      }

      // Validate model
      if (!vehicles?.model) {
        newErrors["details.vehicles.model"] = t("fieldRequired");
      } else if (vehicles.model === "CUSTOM_MODEL") {
        // Validate custom model when "Custom" is selected
        if (!vehicles.customModel?.trim()) {
          newErrors["details.vehicles.customModel"] = t("fieldRequired");
        }
      }

      // Validate year
      if (!vehicles?.year) {
        newErrors["details.vehicles.year"] = t("fieldRequired");
      } else {
        const year = parseInt(vehicles.year.toString());
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear + 1) {
          newErrors["details.vehicles.year"] = t("validYearRequired");
        }
      }
    }

    // Real estate specific validation
    if (formData.category?.mainCategory === ListingCategory.REAL_ESTATE) {
      const realEstate = formData.details?.realEstate;
      const propertyType = formData.category?.subCategory as PropertyType;

      // Validate size (required for all property types)
      if (!realEstate?.size) {
        newErrors["details.realEstate.size"] = t("fieldRequired");
      } else {
        const area = parseFloat(realEstate.size.toString());
        if (isNaN(area) || area <= 0) {
          newErrors["details.realEstate.size"] = t("validAreaRequired");
        }
      }

      // Validate year built (required for all property types)
      if (!realEstate?.yearBuilt) {
        newErrors["details.realEstate.yearBuilt"] = t("fieldRequired");
      } else {
        const year = parseInt(realEstate.yearBuilt.toString());
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear + 1) {
          newErrors["details.realEstate.yearBuilt"] = t("validYearRequired");
        }
      }

      // Property type specific validations
      switch (propertyType) {
        case PropertyType.HOUSE:
        case PropertyType.APARTMENT:
        case PropertyType.CONDO:
          // Validate bedrooms for house, apartment, and condo
          if (!realEstate?.bedrooms) {
            newErrors["details.realEstate.bedrooms"] = t("fieldRequired");
          } else {
            const bedrooms = parseFloat(realEstate.bedrooms.toString());
            if (isNaN(bedrooms) || bedrooms <= 0) {
              newErrors["details.realEstate.bedrooms"] = t(
                "validBedroomsRequired",
              );
            }
          }

          // Validate bathrooms for house, apartment, and condo
          if (!realEstate?.bathrooms) {
            newErrors["details.realEstate.bathrooms"] = t("fieldRequired");
          } else {
            const bathrooms = parseFloat(realEstate.bathrooms.toString());
            if (isNaN(bathrooms) || bathrooms <= 0) {
              newErrors["details.realEstate.bathrooms"] = t(
                "validBathroomsRequired",
              );
            }
          }
          break;

        case PropertyType.APARTMENT:
        case PropertyType.CONDO:
          // Validate floor for apartment and condo
          if (!realEstate?.floor) {
            newErrors["details.realEstate.floor"] = t("fieldRequired");
          } else {
            const floor = parseInt(realEstate.floor.toString());
            if (isNaN(floor) || floor < 1 || floor > 100) {
              newErrors["details.realEstate.floor"] = t("validFloorRequired");
            }
          }
          break;

        case PropertyType.LAND:
          // Validate buildable for land
          if (realEstate?.buildable === undefined) {
            newErrors["details.realEstate.buildable"] = t("fieldRequired");
          }
          break;

        case PropertyType.COMMERCIAL:
          // Validate usage type for commercial
          if (!realEstate?.usageType) {
            newErrors["details.realEstate.usageType"] = t("fieldRequired");
          }
          break;
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
      if (formData.details?.vehicles?.make === "OTHER") {
        allFieldsTouched["details.vehicles.customMake"] = true;
      }
      if (formData.details?.vehicles?.model === "CUSTOM_MODEL") {
        allFieldsTouched["details.vehicles.customModel"] = true;
      }
    } else if (
      formData?.category?.mainCategory === ListingCategory.REAL_ESTATE
    ) {
      allFieldsTouched["details.realEstate.propertyType"] = true;
    }

    setTouched(allFieldsTouched);

    // Perform validation
    const isValid = validateForm();
    console.log("Form validation result:", isValid);

    // Prepare the data to be submitted
    console.log("Form data real estate:", formData.details?.realEstate);
    const dataToSubmit: ExtendedFormState = {
      ...formData,
      details: {
        ...formData.details,
        vehicles:
          formData?.category?.mainCategory === ListingCategory.VEHICLES
            ? {
                ...(formData.details?.vehicles || {}),
                vehicleType: formData?.category?.subCategory as VehicleType,
                make: formData.details?.vehicles?.make || "",
                model: formData.details?.vehicles?.model || "",
                year: formData.details?.vehicles?.year || "",
              }
            : undefined,
        realEstate:
          formData?.category?.mainCategory === ListingCategory.REAL_ESTATE
            ? {
                ...(formData.details?.realEstate || {}),
                propertyType: formData?.category?.subCategory as PropertyType,
              }
            : undefined,
      },
      // Image filtering is now handled by ImageManager component
    };

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
      !formData.details?.vehicles?.make ||
      !formData.details?.vehicles?.model ||
      formData.details?.vehicles?.make === "OTHER" ||
      formData.details?.vehicles?.model === "CUSTOM_MODEL"
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

    const makes = generateMakeOptions();
    const models = getModelOptions(formData.details?.vehicles?.make || "");
    const years = getYearOptions();

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            {renderMakeField()}
            {renderCustomMakeField()}
          </div>

          <div className="md:col-span-1">
            {renderModelField()}
            {formData.details?.vehicles?.model === "OTHER_MODEL" && (
              <div className="mt-2">
                <FormField
                  name="details.vehicles.customModel"
                  label={t("customModel")}
                  type="text"
                  value={formData.details?.vehicles?.customModel || ""}
                  onChange={(value: FormFieldValue) => {
                    const customModelStr = String(value);
                    handleInputChange(
                      "details.vehicles.customModel",
                      customModelStr,
                    );

                    // Update title immediately when custom model changes
                    if (formData.details?.vehicles?.year) {
                      let make = "";

                      if (
                        formData.details?.vehicles?.make === "OTHER_MAKE" &&
                        formData.details.vehicles.customMake
                      ) {
                        make = formData.details.vehicles.customMake;
                      } else if (formData.details?.vehicles?.make) {
                        make = formData.details.vehicles.make;
                      }

                      const autoTitle = make
                        ? `${make} ${customModelStr} ${formData.details.vehicles.year}`
                        : `${customModelStr} ${formData.details.vehicles.year}`;
                      handleInputChange("title", autoTitle);
                    }
                  }}
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

          <div className="md:col-span-1">{renderYearField()}</div>
        </div>
      </div>
    );
  };

  const renderMakeField = () => {
    const makeValue = formData.details?.vehicles?.make || "";
    const makes = generateMakeOptions();

    return (
      <FormField
        name="field-make"
        label={t("make")}
        type="select"
        value={makeValue}
        onChange={(value) => handleMakeChange(value as string)}
        error={
          touched["details.vehicles.make"]
            ? errors["details.vehicles.make"]
            : undefined
        }
        options={makes}
        required={true}
        placeholder={t("selectMake")}
        isSearchable={true}
      />
    );
  };

  const renderModelField = () => {
    const modelValue = formData.details?.vehicles?.model || "";
    const models = getModelOptions(formData.details?.vehicles?.make || "");

    return (
      <FormField
        name="field-model"
        label={t("model")}
        type="select"
        value={modelValue}
        onChange={(value) => handleModelChange(value as string)}
        error={
          touched["details.vehicles.model"]
            ? errors["details.vehicles.model"]
            : undefined
        }
        options={models}
        required={true}
        placeholder={t("selectModel")}
        isSearchable={true}
      />
    );
  };

  const renderYearField = () => {
    const yearValue = formData.details?.vehicles?.year || "";
    const years = getYearOptions();

    return (
      <FormField
        name="field-year"
        label={t("year")}
        type="select"
        value={yearValue}
        onChange={(value) => {
          const yearStr = value as string;
          handleInputChange("details.vehicles.year", yearStr);

          // Auto-generate title if fields are filled
          let make = "";
          let model = "";

          // Get make (custom or regular)
          if (
            formData.details?.vehicles?.make === "OTHER_MAKE" &&
            formData.details.vehicles.customMake
          ) {
            make = formData.details.vehicles.customMake;
          } else if (formData.details?.vehicles?.make) {
            make = formData.details.vehicles.make;
          }

          // Get model (custom or regular)
          if (
            formData.details?.vehicles?.model === "CUSTOM_MODEL" &&
            formData.details.vehicles.customModel
          ) {
            model = formData.details.vehicles.customModel;
          } else if (formData.details?.vehicles?.model) {
            model = formData.details.vehicles.model;
          }

          // Generate title based on available information
          let autoTitle = yearStr; // Start with just the year

          if (make && model) {
            autoTitle = `${make} ${model} ${yearStr}`;
          } else if (make) {
            autoTitle = `${make} ${yearStr}`;
          } else if (model) {
            autoTitle = `${model} ${yearStr}`;
          }

          handleInputChange("title", autoTitle);
        }}
        error={
          touched["details.vehicles.year"]
            ? errors["details.vehicles.year"]
            : undefined
        }
        options={years}
        required={true}
        placeholder={t("selectYear")}
        isSearchable={true}
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
            name="custom-make"
            label={t("customMake")}
            type="text"
            value={customMakeValue}
            onChange={(value) => {
              const newValue = typeof value === "string" ? value : "";
              handleInputChange("details.vehicles.customMake", newValue);

              // Update the title with the custom make
              if (formData.details?.vehicles?.year) {
                const year = formData.details.vehicles.year;
                let model = "";

                if (
                  formData.details?.vehicles?.model === "CUSTOM_MODEL" &&
                  formData.details.vehicles.customModel
                ) {
                  model = formData.details.vehicles.customModel;
                } else if (formData.details?.vehicles?.model) {
                  model = formData.details.vehicles.model;
                }

                const autoTitle = model
                  ? `${newValue} ${model} ${year}`
                  : `${newValue} ${year}`;
                handleInputChange("title", autoTitle);
              }
            }}
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

    const subType = formData.category?.subCategory?.toLowerCase();
    const fields =
      realEstateBasicFields[subType as keyof typeof realEstateBasicFields];

    console.log("Real estate fields:", fields);

    if (!fields) return null;

    return (
      <div className="mt-6 space-y-6">
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
          {t("common.propertyDetails.title")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.name}>
              {renderFormField(
                t(`common.propertyDetails.${field.name}`),
                `details.realEstate.${field.name}`,
                field.type,
                field.type === "select" ? field.options : undefined,
                undefined,
                t(`common.propertyDetails.${field.name}Placeholder` || ""),
                field.min,
                field.max,
                field.step,
                field.required,
                field.helpText
                  ? t(`common.propertyDetails.${field.name}Help`)
                  : undefined,
                field.type === "select",
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

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
    isSearchable?: boolean,
  ) => {
    const fieldValue = fieldName
      .split(".")
      .reduce((obj: any, key) => obj?.[key], formData);
    const errorMessage = errors[fieldName];
    const isFieldTouched = touched[fieldName];

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          {type === "select" && options ? (
            <Select
              value={options.find((opt) => opt.value === fieldValue)}
              onChange={(selected: any) =>
                handleInputChange(fieldName, selected?.value || "")
              }
              options={options}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder={placeholder || `Select ${label.toLowerCase()}`}
              isClearable
            />
          ) : type === "textarea" ? (
            <textarea
              value={fieldValue || ""}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              onBlur={() => setTouched({ ...touched, [fieldName]: true })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                icon ? "pl-10" : ""
              } ${errorMessage && isFieldTouched ? "border-red-500" : ""}`}
              placeholder={placeholder}
              rows={4}
            />
          ) : (
            <input
              type={type}
              value={fieldValue || ""}
              onChange={(e) =>
                handleInputChange(
                  fieldName,
                  type === "number"
                    ? parseFloat(e.target.value)
                    : e.target.value,
                )
              }
              onBlur={() => setTouched({ ...touched, [fieldName]: true })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                icon ? "pl-10" : ""
              } ${errorMessage && isFieldTouched ? "border-red-500" : ""}`}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
            />
          )}
        </div>
        {helpText && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}
        {errorMessage && isFieldTouched && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        )}
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
              aria-pressed={formData?.category?.subCategory === type}
            >
              <FaCarAlt className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">
                {formData?.category?.mainCategory === ListingCategory.VEHICLES
                  ? t(`common.vehicleTypes.${type}`)
                  : t(`common.propertyTypes.${type}`)}
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
          {formData?.category?.mainCategory === ListingCategory.VEHICLES
            ? t("vehicleType")
            : t("propertyType")}
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
                  ? "bg-green-500 text-white"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() =>
                handleCategoryChange(ListingCategory.REAL_ESTATE, type)
              }
              aria-pressed={formData?.category?.subCategory === type}
            >
              <FaHome className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">
                {formData?.category?.mainCategory === ListingCategory.VEHICLES
                  ? t(`common.vehicleTypes.${type}`)
                  : t(`common.propertyTypes.${type}`)}
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

  // Syrian cities data
  const syrianCities = [
    { value: "DAMASCUS", label: t("cities.DAMASCUS") },
    { value: "ALEPPO", label: t("cities.ALEPPO") },
    { value: "HOMS", label: t("cities.HOMS") },
    { value: "LATTAKIA", label: t("cities.LATTAKIA") },
    { value: "HAMA", label: t("cities.HAMA") },
    { value: "DEIR_EZZOR", label: t("cities.DEIR_EZZOR") },
    { value: "HASEKEH", label: t("cities.HASEKEH") },
    { value: "QAMISHLI", label: t("cities.QAMISHLI") },
    { value: "RAQQA", label: t("cities.RAQQA") },
    { value: "TARTOUS", label: t("cities.TARTOUS") },
    { value: "IDLIB", label: t("cities.IDLIB") },
    { value: "DARA", label: t("cities.DARA") },
    { value: "SWEDIA", label: t("cities.SWEDIA") },
    { value: "QUNEITRA", label: t("cities.QUNEITRA") },
  ];

  const handleLocationChange = (selected: any) => {
    handleInputChange("location", selected?.value || "");
  };

  const renderLocationField = () => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("location")}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <Select
            value={syrianCities.find(
              (city) => city.value === formData.location,
            )}
            onChange={handleLocationChange}
            options={syrianCities}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder={t("selectLocation")}
            isClearable
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: state.isFocused
                  ? "var(--blue-50)"
                  : "var(--gray-50)",
                borderColor: state.isFocused
                  ? "var(--blue-500)"
                  : "var(--gray-300)",
                borderRadius: "0.5rem",
                boxShadow: state.isFocused
                  ? "0 0 0 1px var(--blue-500)"
                  : "none",
                "&:hover": {
                  borderColor: state.isFocused
                    ? "var(--blue-500)"
                    : "var(--gray-400)",
                },
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: "var(--white)",
                borderRadius: "0.5rem",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }),
              option: (baseStyles, { isSelected }) => ({
                ...baseStyles,
                backgroundColor: isSelected ? "var(--blue-50)" : "var(--white)",
                "&:hover": {
                  backgroundColor: "var(--blue-50)",
                },
              }),
            }}
          />
        </div>
        {errors.location && touched.location && (
          <p className="mt-1 text-sm text-red-500">{errors.location}</p>
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
            {t("common.category")}
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
                {t("common.vehicles")}
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
                  formData?.category?.mainCategory ===
                  ListingCategory.REAL_ESTATE
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                }`}
                aria-pressed={
                  formData?.category?.mainCategory ===
                  ListingCategory.REAL_ESTATE
                }
              >
                <BiBuildingHouse className="inline-block mr-2 -mt-1" />
                {t("common.realEstate")}
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
            undefined,
            t("titlePlaceholder"),
            undefined,
            undefined,
            undefined,
            true,
            formData.details?.vehicles?.make &&
              formData.details?.vehicles?.model
              ? t("autoGeneratedFromDetails")
              : undefined,
            undefined,
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
              "select",
              syrianCities,
              <MapPin className="w-4 h-4" />,
              t("selectLocation"),
              undefined,
              undefined,
              undefined,
              true,
              undefined,
              true,
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
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
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

      {/* Image Manager Component */}
      <div className="mt-6">
        <Suspense fallback={<div>Loading images...</div>}>
          <ImageManager
            images={formData.images as File[]}
            onChange={(newImages) => {
              setFormData((prev) => ({
                ...prev,
                images: newImages,
              }));
              // Clear any image-related errors
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.images;
                return newErrors;
              });
            }}
            maxImages={10}
            error={errors.images}
            existingImages={formData.existingImages as string[]}
            onDeleteExisting={(url) => {
              setFormData((prev) => ({
                ...prev,
                existingImages: (prev.existingImages || []).filter(
                  (img) => img !== url,
                ),
              }));
              onImageDelete?.();
            }}
          />
        </Suspense>
      </div>

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>{t("submitting")}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BasicDetailsForm;
