import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCarSide,
  FaCogs,
  FaCouch,
  FaShieldAlt,
  FaBuilding,
  FaSwimmingPool,
  FaTree,
  FaLock,
  FaCog,
} from "react-icons/fa";
import {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
} from "@/types/enums";
import { FormState } from "@/types/forms";
import type { VehicleDetails, RealEstateDetails, ListingFieldSchema } from "@/types/listings";
import { listingsAdvancedFieldSchema } from "../advanced/listingsAdvancedFieldSchema";
import FormField from "../common/FormField";
import { toast } from "@/components/ui/toast";

interface ExtendedFormState extends FormState {
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  details: {
    vehicles?: VehicleDetails;
    realEstate?: RealEstateDetails;
  };
}

// Update type definition for form field types
type FormFieldType =
  | "text"
  | "number"
  | "select"
  | "textarea"
  | "checkbox"
  | "date"
  | "colorpicker"
  | "multiselect"
  | "email"
  | "password"
  | "tel";

interface AdvancedDetailsFormProps {
  initialData: Partial<FormState>;
  onSubmit: (data: FormState) => void;
  onBack: () => void;
}

const AdvancedDetailsForm: React.FC<AdvancedDetailsFormProps> = ({
  initialData,
  onSubmit,
  onBack,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ExtendedFormState>(() => {
    // Start with the initial data
    const baseData = initialData as ExtendedFormState;
    
    // Get the category type
    const mainCategory = baseData?.category?.mainCategory || ListingCategory.VEHICLES;
    const subCategory = baseData?.category?.subCategory || (
      mainCategory === ListingCategory.VEHICLES ? VehicleType.CAR : PropertyType.HOUSE
    );

    // Initialize the form data
    return {
      ...baseData,
      category: {
        mainCategory,
        subCategory,
      },
      details: {
        vehicles: mainCategory === ListingCategory.VEHICLES ? {
          vehicleType: baseData?.details?.vehicles?.vehicleType || VehicleType.CAR,
          make: baseData?.details?.vehicles?.make || "",
          model: baseData?.details?.vehicles?.model || "",
          year: baseData?.details?.vehicles?.year || new Date().getFullYear().toString(),
          mileage: baseData?.details?.vehicles?.mileage || "0",
          fuelType: baseData?.details?.vehicles?.fuelType || FuelType.GASOLINE,
          transmissionType: baseData?.details?.vehicles?.transmissionType || TransmissionType.AUTOMATIC,
          color: baseData?.details?.vehicles?.color || "",
          condition: baseData?.details?.vehicles?.condition || Condition.GOOD,
          features: baseData?.details?.vehicles?.features || [],
          interiorColor: baseData?.details?.vehicles?.interiorColor || "#000000", // Default black
          warranty: baseData?.details?.vehicles?.warranty || 0,
          serviceHistory: baseData?.details?.vehicles?.serviceHistory || "none",
          previousOwners: baseData?.details?.vehicles?.previousOwners || 0,
          registrationStatus: baseData?.details?.vehicles?.registrationStatus || "unregistered",
        } : undefined,
        realEstate: mainCategory === ListingCategory.REAL_ESTATE ? {
          propertyType: baseData?.details?.realEstate?.propertyType || PropertyType.HOUSE,
          size: baseData?.details?.realEstate?.size || "",
          yearBuilt: baseData?.details?.realEstate?.yearBuilt || "",
          bedrooms: baseData?.details?.realEstate?.bedrooms || 0,
          bathrooms: baseData?.details?.realEstate?.bathrooms || 0,
          condition: baseData?.details?.realEstate?.condition || Condition.GOOD,
          features: baseData?.details?.realEstate?.features || [],
        } : undefined,
      },
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState("essential");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure we have a valid category
  const isVehicle = formData?.category?.mainCategory === ListingCategory.VEHICLES;
  const categoryType = isVehicle
    ? "cars" // Always use "cars" for vehicle listings since that's our schema key
    : "realEstate";

  const vehicleSections = [
    { id: "essential", title: t("essential"), icon: FaCarSide },
    { id: "performance", title: t("performance"), icon: FaCogs },
    { id: "comfort", title: t("comfort"), icon: FaCouch },
    { id: "safety", title: t("safety"), icon: FaShieldAlt },
  ];

  const realEstateSections = [
    { id: "essential", title: t("essential"), icon: FaBuilding },
    { id: "features", title: t("features"), icon: FaSwimmingPool },
    { id: "outdoor", title: t("outdoor"), icon: FaTree },
    { id: "security", title: t("security"), icon: FaLock },
  ];

  const sections = isVehicle ? vehicleSections : realEstateSections;

  const validateAllFields = () => {
    const newErrors: Record<string, string> = {};
    const isVehicle = formData.category.mainCategory === ListingCategory.VEHICLES;
    
    console.log('Validating form data:', { formData, isVehicle });

    // Get all fields from the schema
    const allFields = listingsAdvancedFieldSchema[isVehicle ? 'cars' : 'realEstate'] || [];
    const requiredFields = allFields.filter(field => field.required);

    console.log('Required fields:', requiredFields);

    requiredFields.forEach(field => {
      const value = isVehicle
        ? formData.details?.vehicles?.[field.name as keyof VehicleDetails]
        : formData.details?.realEstate?.[field.name as keyof RealEstateDetails];

      console.log(`Checking field ${field.name}:`, { value, required: field.required });

      if (!value && value !== 0) {
        newErrors[`details.${field.name}`] = t("errors.requiredField") || "This field is required";
        console.warn(`Field ${field.name} is missing or empty`);
      }
    });

    // Additional vehicle-specific validations
    if (isVehicle) {
      const vehicleDetails = formData.details?.vehicles;
      console.log('Vehicle details:', vehicleDetails);

      if (!vehicleDetails?.make) {
        newErrors["details.vehicles.make"] = t("listings.create.errors.makeRequired");
        console.warn('Make is missing');
      }
      if (!vehicleDetails?.model) {
        newErrors["details.vehicles.model"] = t("listings.create.errors.modelRequired");
        console.warn('Model is missing');
      }
      if (!vehicleDetails?.year) {
        newErrors["details.vehicles.year"] = t("listings.create.errors.yearRequired");
        console.warn('Year is missing');
      }
      if (!vehicleDetails?.mileage) {
        newErrors["details.vehicles.mileage"] = t("listings.create.errors.mileageRequired");
        console.warn('Mileage is missing');
      }
      if (!vehicleDetails?.transmissionType) {
        newErrors["details.vehicles.transmissionType"] = t("listings.create.errors.transmissionRequired");
        console.warn('Transmission is missing');
      }
      // Removed required checks for engine, horsepower, and airbags
    }

    console.log('Validation errors:', newErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[],
  ) => {
    setFormData((prev) => {
      const newFormData = { ...prev };

      // Initialize the details object if it doesn't exist
      if (!newFormData.details) {
        newFormData.details = {};
      }

      if (isVehicle) {
        // Initialize vehicles object if it doesn't exist
        if (!newFormData.details.vehicles) {
          newFormData.details.vehicles = {
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
            interiorColor: "#000000", // Default black
            warranty: 0,
            serviceHistory: "none",
            previousOwners: 0,
            registrationStatus: "unregistered",
          };
        }
        
        // Update the field
        newFormData.details = {
          ...newFormData.details,
          vehicles: {
            ...newFormData.details.vehicles,
            [field]: value,
          },
        };
      } else {
        // Initialize realEstate object if it doesn't exist
        if (!newFormData.details.realEstate) {
          newFormData.details.realEstate = {
            propertyType: PropertyType.HOUSE,
            size: "",
            yearBuilt: "",
            bedrooms: "",
            bathrooms: "",
            condition: Condition.NEW,
            features: [],
          };
        }
        
        // Update the field
        newFormData.details = {
          ...newFormData.details,
          realEstate: {
            ...newFormData.details.realEstate,
            [field]: value,
          },
        };
      }

      return newFormData;
    });
  };

  const renderFields = () => {
    const fields = listingsAdvancedFieldSchema[categoryType] || [];
    const sectionFields = fields.filter(
      (field) => field.section === activeSection,
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionFields.map((field: ListingFieldSchema) => (
          <FormField
            key={field.name}
            name={field.name}
            label={t(field.label)}
            type={field.type as FormFieldType}
            options={field.options?.map((opt: string) => ({
              value: opt,
              label: t(`options.${opt}`),
            }))}
            value={
              isVehicle
                ? formData.details?.vehicles?.[field.name as keyof VehicleDetails] || ""
                : formData.details?.realEstate?.[field.name as keyof RealEstateDetails] || ""
            }
            onChange={(value) => handleInputChange(field.name, value)}
            error={errors[`details.${field.name}`]}
            required={field.required}
            disabled={isSubmitting}
            className={errors[`details.${field.name}`] ? "border-red-500" : ""}
          />
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all fields, not just the current section
      const isValid = validateAllFields();

      if (!isValid) {
        const missingFields = Object.keys(errors).map(key => 
          t(`fields.${key.split('.').pop()}`) || key.split('.').pop()
        );

        toast.error(
          t("errors.requiredFields", {
            fields: missingFields.join(", "),
          }),
        );

        setIsSubmitting(false);
        return;
      }

      // Call the parent's onSubmit with the complete form data
      await onSubmit({
        ...formData,
        details: {
          vehicles: formData.category.mainCategory === ListingCategory.VEHICLES ? formData.details.vehicles : undefined,
          realEstate: formData.category.mainCategory === ListingCategory.REAL_ESTATE ? formData.details.realEstate : undefined,
        }
      });
      toast.success(t("success.detailsSaved"));
    } catch (error) {
      console.error("Error submitting advanced details:", error);
      toast.error(t("errors.submissionFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex space-x-4 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            disabled={isSubmitting}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeSection === section.id
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {React.createElement(section.icon, { className: "w-5 h-5" })}
            <span>{t(section.title)}</span>
          </button>
        ))}
      </div>

      {renderFields()}

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("common.back")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⌛</span>
              <span>{t("common.submitting")}</span>
            </>
          ) : (
            <>
              <FaCog className="w-5 h-5" />
              <span>{t("common.continue")}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AdvancedDetailsForm;
