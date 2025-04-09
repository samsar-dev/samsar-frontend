import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCarSide,
  FaCogs,
  FaCouch,
  FaShieldAlt,
  FaBuilding,
  FaCog,
} from "react-icons/fa";
import {
  ListingCategory,
  VehicleType,
  PropertyType,
} from "@/types/enums";
import { FormState } from "@/types/forms";
import type { ListingFieldSchema } from "@/types/listings";
import { listingsAdvancedFieldSchema } from "../advanced/listingsAdvancedFieldSchema";
import FormField from "../common/FormField";
import ColorPickerField from "@/components/listings/forms/ColorPickerField";
import { toast } from "react-hot-toast";

interface ExtendedFormState extends Omit<FormState, 'details'> {
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  details: {
    vehicles?: {
      [key: string]: any;
    };
    realEstate?: {
      [key: string]: any;
    };
  };
}

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
  formData: any;
  onSubmit: (data: any, isValid: boolean) => void;
  onBack: () => void;
}

const AdvancedDetailsForm: React.FC<AdvancedDetailsFormProps> = ({
  formData,
  onSubmit,
  onBack,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState("details");

  const [form, setForm] = useState<ExtendedFormState>(() => {
    if (!formData || !formData.category) {
      return {
        title: "",
        description: "",
        price: 0,
        category: {
          mainCategory: ListingCategory.VEHICLES,
          subCategory: VehicleType.CAR
        },
        location: "",
        images: [],
        details: {
          vehicles: {}
        }
      };
    }
    
    return formData as ExtendedFormState;
  });

  const isVehicle = form.category.mainCategory === ListingCategory.VEHICLES;
  const currentSchema = listingsAdvancedFieldSchema[form.category.subCategory] || [];

  // Group fields by section, ensuring unique sections
  const sections = Array.from(
    new Set(currentSchema.map((field) => field.section))
  )
    .map((sectionId) => ({
      id: sectionId,
      title: `sections.${sectionId}`,
      icon: getSectionIcon(sectionId),
      fields: currentSchema.filter((field) => field.section === sectionId),
    }))
    // Optional: Sort sections in a logical order
    .sort((a, b) => {
      const sectionOrder = ['essential', 'details', 'features', 'outdoor'];
      return sectionOrder.indexOf(a.id) - sectionOrder.indexOf(b.id);
    });

  function getSectionIcon(sectionId: string) {
    const iconMap: Record<string, any> = {
      details: FaCarSide,
      specifications: FaCogs,
      features: FaCouch,
      safety: FaShieldAlt,
      appearance: FaBuilding,
      equipment: FaCogs,
      maintenance: FaCog,
      accessibility: FaShieldAlt,
      usage: FaCarSide,
    };
    return iconMap[sectionId] || FaCog;
  }

  const validateAllFields = () => {
    const newErrors: Record<string, string> = {};
    
    currentSchema.forEach((field) => {
      const value = isVehicle
        ? form.details?.vehicles?.[field.name]
        : form.details?.realEstate?.[field.name];

      if (field.required && !value) {
        // Use a field-specific required error message
        newErrors[`details.${field.name}`] = t(`errors.${field.name}Required`);
      } else if (field.validate && value) {
        const error = field.validate(value);
        if (error) {
          newErrors[`details.${field.name}`] = t(`errors.${error}`);
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[],
  ) => {
    setForm((prevForm) => {
      const detailsKey = isVehicle ? 'vehicles' : 'realEstate';
      
      return {
        ...prevForm,
        details: {
          ...prevForm.details,
          [detailsKey]: {
            ...prevForm.details[detailsKey],
            [field]: value,
          },
        },
      };
    });

    // Clear error when field is modified
    if (errors[`details.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`details.${field}`];
        return newErrors;
      });
    }
  };

  const renderFields = () => {
    const activeFields = sections.find((s) => s.id === activeSection)?.fields || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeFields.map((field: ListingFieldSchema) => {
          const currentValue = isVehicle
            ? form.details?.vehicles?.[field.name]
            : form.details?.realEstate?.[field.name];
          
          if (field.type === 'colorpicker') {
            return (
              <ColorPickerField
                key={field.name}
                label={t(field.label)}
                value={currentValue as string || "#000000"}
                onChange={(value) => handleInputChange(field.name, value)}
                error={errors[`details.${field.name}`]}
                required={field.required}
              />
            );
          }

          // Transform the type to match FormFieldType
          let formFieldType: FormFieldType = "text";
          if (field.type === "number") formFieldType = "number";
          else if (field.type === "select") formFieldType = "select";
          else if (field.type === "textarea") formFieldType = "textarea";
          else if (field.type === "multiselect") formFieldType = "multiselect";
          
          return (
            <FormField
              key={field.name}
              name={field.name}
              label={t(field.label)}
              type={formFieldType}
              options={field.options?.map((opt: string) => ({
                value: opt,
                label: t(`options.${opt}`),
              }))}
              value={currentValue || ""}
              onChange={(value) => handleInputChange(field.name, value)}
              error={errors[`details.${field.name}`]}
              required={field.required}
              disabled={isSubmitting}
              className={errors[`details.${field.name}`] ? "border-red-500" : ""}
            />
          );
        })}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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

      await onSubmit(form, true);
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
      <div className="flex flex-wrap gap-4 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            disabled={isSubmitting}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeSection === section.id
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
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
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {t("common.back")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
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