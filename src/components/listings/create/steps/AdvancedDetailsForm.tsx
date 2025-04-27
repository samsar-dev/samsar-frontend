import { useState, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import {
  FaCarSide,
  FaCogs,
  FaCouch,
  FaShieldAlt,
  FaBuilding,
  FaCog,
  FaList,
  FaTachometerAlt,
  FaWheelchair,
  FaPaintBrush,
  FaTree,
  FaClock,
  FaMusic,
  FaLightbulb,
  FaCamera,
  FaShieldVirus,
  FaWind,
  FaTractor,
} from "react-icons/fa";
import type { ListingCategory, VehicleType, PropertyType } from "@/types/enums";
import {
  ListingAction,
  ListingStatus,
  ListingCategory as ListingCategoryValue,
  VehicleType as VehicleTypeValue,
} from "@/types/enums";
import type { FormState } from "@/types/forms";
import type { ListingFieldSchema } from "@/types/listings";
import type { SectionId } from "../advanced/listingsAdvancedFieldSchema";
import {
  listingsAdvancedFieldSchema,
  SECTION_CONFIG,
} from "../advanced/listingsAdvancedFieldSchema";
const FormField = lazy(() => import("@/components/common/FormField"));
const ColorPickerField = lazy(() => import("@/components/listings/forms/ColorPickerField"));
import { toast } from "react-hot-toast";

interface ExtendedFormState extends Omit<FormState, "details"> {
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
  listingAction: ListingAction;
  status: ListingStatus;
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

interface Section {
  id: SectionId;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  order: number;
  fields: ListingFieldSchema[];
}

export function getIconComponent(iconName: string) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    FaCarSide,
    FaCogs,
    FaCouch,
    FaShieldAlt,
    FaBuilding,
    FaCog,
    FaList,
    FaTachometerAlt,
    FaWheelchair,
    FaPaintBrush,
    FaTree,
    FaClock,
    FaMusic,
    FaLightbulb,
    FaCamera,
    FaShieldVirus,
    FaWind,
    FaTractor,
  };
  return iconMap[iconName] || FaCog;
}

const FeatureSection: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  features: ListingFieldSchema[];
  values: Record<string, boolean>;
  onChange: (name: string, checked: boolean) => void;
}> = ({ title, icon: Icon, features, values, onChange }) => {
  const { t } = useTranslation();
  // Expand by default
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper to clean up labels
  const cleanLabel = (label: string) =>
    label.replace(/^features\./, "").replace(/([a-z])([A-Z])/g, "$1 $2");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
      <div className="flex items-center mb-4">
        <span className="w-1.5 h-8 bg-primary rounded-full mr-4" />
        <Icon className="w-6 h-6 text-primary mr-2" />
        <h3 className="text-xl font-bold tracking-wide text-gray-900 dark:text-white flex-1">
          {t(title)}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? t("Collapse") : t("Expand")}
          className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        >
          <FaCog
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {isExpanded && (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature) =>
            feature.type === "toggle" ? (
              <div
                key={feature.name}
                className={`flex items-center justify-between p-3 rounded-lg border shadow-sm hover:shadow-md transition 
                  ${values[feature.name] ? "bg-blue-50 border-blue-500" : "bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600"}`}
              >
                <span
                  className={`text-base font-medium transition-colors ${values[feature.name] ? "text-blue-700 dark:text-blue-400 font-semibold" : "text-gray-800 dark:text-gray-200"}`}
                >
                  {t(cleanLabel(feature.label))}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values[feature.name] || false}
                  onClick={() => onChange(feature.name, !values[feature.name])}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    values[feature.name]
                      ? "bg-primary"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      values[feature.name] ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ) : (
              <div
                key={feature.name}
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 shadow-sm"
              >
                <input
                  type="checkbox"
                  id={feature.name}
                  checked={values[feature.name] || false}
                  onChange={(e) => onChange(feature.name, e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                />
                <label
                  htmlFor={feature.name}
                  className="text-base text-gray-800 dark:text-gray-200 font-medium cursor-pointer"
                >
                  {t(cleanLabel(feature.label))}
                </label>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

const AdvancedDetailsForm: React.FC<AdvancedDetailsFormProps> = ({
  formData,
  onSubmit,
  onBack,
}) => {
  console.log("[AdvancedDetailsForm] props:", formData, onSubmit, onBack);
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<SectionId>("essential");

  const [form, setForm] = useState<ExtendedFormState>(() => {
    if (!formData || !formData.category) {
      return {
        title: "",
        description: "",
        price: 0,
        category: {
          mainCategory: ListingCategoryValue.VEHICLES,
          subCategory: VehicleTypeValue.CAR,
        },
        location: "",
        images: [],
        details: {
          vehicles: {},
        },
        listingAction: ListingAction.SELL,
        status: ListingStatus.ACTIVE,
      };
    }

    return formData as ExtendedFormState;
  });

  console.log("form", form);

  const isVehicle =
    form.category.mainCategory === ListingCategoryValue.VEHICLES;
  const currentSchema =
    listingsAdvancedFieldSchema[form.category.subCategory] || [];

  // Get unique sections from the schema and sort them according to SECTION_CONFIG
  const sections = Array.from(
    new Set(currentSchema.map((field) => field.section))
  )
    .filter((sectionId): sectionId is SectionId => sectionId in SECTION_CONFIG)
    .map((sectionId) => ({
      id: sectionId,
      title: SECTION_CONFIG[sectionId].label,
      icon: getIconComponent(SECTION_CONFIG[sectionId].icon),
      order: SECTION_CONFIG[sectionId].order,
      fields: currentSchema.filter((field) => field.section === sectionId),
    }))
    .sort((a, b) => a.order - b.order);

  const validateAllFields = () => {
    const newErrors: Record<string, string> = {};

    currentSchema.forEach((field) => {
      const value = isVehicle
        ? (form.details?.vehicles?.[field.name] ?? "")
        : (form.details?.realEstate?.[field.name] ?? "");

      // Skip validation for tractor-specific fields if not a tractor
      if (
        field.name === "horsepower" &&
        form.category.subCategory !== VehicleTypeValue.TRACTOR
      ) {
        return;
      }

      if (field.required && (!value || value === "" || value === null)) {
        // Use a field-specific required error message
        newErrors[`details.${field.name}`] = t(`errors.${field.name}Required`);
      } else if (field.validate && value !== undefined) {
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
    value: string | number | boolean | string[]
  ) => {
    console.log("[AdvancedDetailsForm] handleInputChange event:", field, value);
    setForm((prevForm) => {
      const detailsKey = isVehicle ? "vehicles" : "realEstate";

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

  const handleFeatureChange = (field: string, value: boolean) => {
    setForm((prevForm) => {
      const detailsKey = isVehicle ? "vehicles" : "realEstate";
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
  };

  const renderFields = () => {
    const activeFields =
      sections.find((s) => s.id === activeSection)?.fields || [];

    // Group fields by their feature category
    const featureGroups = activeFields.reduce(
      (groups, field) => {
        if (field.featureCategory) {
          if (!groups[field.featureCategory]) {
            groups[field.featureCategory] = [];
          }
          groups[field.featureCategory].push(field);
        }
        return groups;
      },
      {} as Record<string, ListingFieldSchema[]>
    );

    const standardFields = activeFields.filter(
      (field) => !field.featureCategory
    );

    return (
      <div className="space-y-6">
        {/* Standard form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {standardFields.map((field) => {
            // Custom rendering for featureGroup fields
            if (field.type === "featureGroup" && field.featureGroups) {
              return Object.entries(field.featureGroups).map(
                ([category, group]) => (
                  <FeatureSection
                    key={category}
                    title={group.label}
                    icon={getFeatureIcon(category)}
                    features={group.features}
                    values={
                      isVehicle
                        ? form.details?.vehicles || {}
                        : form.details?.realEstate || {}
                    }
                    onChange={handleFeatureChange}
                  />
                )
              );
            }
            if (field.type === "colorpicker") {
              return (
                <Suspense fallback={<div>Loading color picker...</div>}>
                  <ColorPickerField
                    key={field.name}
                    label={t(field.label)}
                    value={
                      isVehicle
                        ? (form.details?.vehicles?.[field.name] ?? "#000000")
                        : (form.details?.realEstate?.[field.name] ?? "#000000")
                    }
                    onChange={(value) => handleInputChange(field.name, value)}
                    error={errors[`details.${field.name}`]}
                    required={field.required}
                  />
                </Suspense>
              );
            }
            return (
              <Suspense fallback={<div>Loading field...</div>}>
                <FormField
                  key={field.name}
                  name={field.name}
                  label={t(field.label)}
                  type={field.type as FormFieldType}
                  options={field.options?.map(
                    (opt: string | { value: string; label?: string }) =>
                      typeof opt === "object"
                        ? {
                            value: opt.value,
                            label: t(opt.label || `options.${opt.value}`),
                          }
                        : { value: opt, label: t(`options.${opt}`) }
                  )}
                  value={
                    isVehicle
                      ? (form.details?.vehicles?.[field.name] ?? "")
                      : (form.details?.realEstate?.[field.name] ?? "")
                  }
                  onChange={(value) => handleInputChange(field.name, value)}
                  error={errors[`details.${field.name}`]}
                  required={field.required}
                  disabled={isSubmitting}
                />
              </Suspense>
            );
          })}
        </div>

        {/* Feature sections */}
        <div className="space-y-4">
          {Object.entries(featureGroups).map(([category, features]) => (
            <FeatureSection
              key={category}
              title={t(`featureCategories.${category}`)}
              icon={getFeatureIcon(category)}
              features={features}
              values={
                isVehicle
                  ? form.details?.vehicles || {}
                  : form.details?.realEstate || {}
              }
              onChange={handleFeatureChange}
            />
          ))}
        </div>
      </div>
    );
  };

  const getFeatureIcon = (category: string) => {
    const iconMap: Record<
      string,
      React.ComponentType<{ className?: string }>
    > = {
      entertainment: FaMusic,
      lighting: FaLightbulb,
      cameras: FaCamera,
      safety: FaShieldVirus,
      climate: FaWind,
      convenience: FaCogs,
      default: FaCog,
    };

    return iconMap[category] || iconMap.default;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("[AdvancedDetailsForm] handleSubmit event:", e);
    console.log("[AdvancedDetailsForm] Current advanced details state:", form);
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const isValid = validateAllFields();

      if (!isValid) {
        const missingFields = Object.keys(errors).map(
          (key) => t(`fields.${key.split(".").pop()}`) || key.split(".").pop()
        );

        toast.error(
          t("errors.requiredFields", {
            fields: missingFields.join(", "),
          })
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
        {sections.map((section) => {
          const Icon = section.icon;
          return (
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
              <Icon className="w-5 h-5" />
              <span>{t(section.title)}</span>
            </button>
          );
        })}
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
          className="px-6 py-2 bg-primary text-blue-500 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
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