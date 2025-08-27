import type { Condition, FuelType, ListingAction } from "@/types/enums";
import { ListingCategory, VehicleType } from "@/types/enums";
import type { FormState } from "@/types/forms";
import React, { Suspense, lazy, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCar } from "@react-icons/all-files/fa/FaCar";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { FaEdit } from "@react-icons/all-files/fa/FaEdit";
import { FaHistory } from "@react-icons/all-files/fa/FaHistory";
import { FaHome } from "@react-icons/all-files/fa/FaHome";
import { FaImages } from "@react-icons/all-files/fa/FaImages";
import { FaTag } from "@react-icons/all-files/fa/FaTag";

const ImageFallback = lazy(() => import("@/components/media/ImageFallback"));
// Example: If you have a heavy component for images or advanced details, lazy load it here
// const ImageGallery = lazy(() => import("@/components/common/ImageGallery"));
// const AdvancedDetails = lazy(() => import("@/components/common/AdvancedDetails"));
import type {
  ListingFieldSchema,
} from "@/types/listings";
import { AlertCircle, ChevronLeft, DollarSign, MapPin } from "lucide-react";
import {
  listingsAdvancedFieldSchema,
  propertyAdvancedFieldLists,
  vehicleAdvancedFieldLists,
} from "../advanced/listingsAdvancedFieldSchema";

interface ReviewSectionProps {
  formData: FormState;
  onSubmit: (data: FormState) => void;
  onBack: () => void;
  onEdit: (section: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

// Animation classes for transitions
const transitionClasses = "transition-all duration-300 ease-in-out";

const ReviewSection = React.memo<ReviewSectionProps>(
  ({ formData, onSubmit, onBack, onEdit, isSubmitting, error }) => {
    const { t } = useTranslation();

    // Format price with currency and thousands separator
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(price);
    };

    // Format mileage with thousands separator
    const formatMileage = (mileage: string | number) => {
      if (!mileage) return "N/A";
      return new Intl.NumberFormat("en-US").format(Number(mileage));
    };

    // Format condition with proper capitalization
    const formatCondition = (condition: Condition) => {
      return condition.charAt(0).toUpperCase() + condition.slice(1);
    };

    // Format fuel type with proper capitalization
    const formatFuelType = (fuelType: FuelType) => {
      return fuelType.charAt(0).toUpperCase() + fuelType.slice(1);
    };

    const [listingAction, setListingAction] = useState<"SALE" | "RENT">("SALE");
    const [errors, setErrors] = useState<string[]>([]);

    const validateForm = () => {
      const newErrors: string[] = [];

      // Basic details validation
      if (!formData.title?.trim()) {
        newErrors.push(t("errors.titleRequired"));
      }
      if (!formData.description?.trim()) {
        newErrors.push(t("errors.descriptionRequired"));
      }

      // Price validation
      const price = formData.price;
      if (
        price === undefined ||
        price === 0 ||
        (typeof price === "string" && price === "")
      ) {
        newErrors.push(t("errors.priceRequired"));
      } else {
        const numericPrice =
          typeof price === "string" ? parseFloat(price) : price;
        if (isNaN(numericPrice) || numericPrice <= 0) {
          newErrors.push(t("errors.invalidPrice"));
        }
      }

      if (!formData.location?.trim()) {
        newErrors.push(t("errors.locationRequired"));
      }
      if (!formData.category?.subCategory) {
        newErrors.push(t("errors.subcategoryRequired"));
      }

      // Category-specific validation
      if (formData.category?.mainCategory === ListingCategory.VEHICLES) {
        if (!formData.details?.make) newErrors.push(t("errors.makeRequired"));
        if (!formData.details?.model) newErrors.push(t("errors.modelRequired"));
        if (!formData.details?.year) newErrors.push(t("errors.yearRequired"));
        if (formData.details?.mileage === "" || formData.details?.mileage === undefined || formData.details?.mileage === null)
          newErrors.push(t("errors.mileageRequired"));
        if (!formData.details?.fuelType)
          newErrors.push(t("errors.fuelTypeRequired"));
        if (!formData.details?.transmissionType)
          newErrors.push(t("errors.transmissionRequired"));
        if (!formData.details?.color) newErrors.push(t("errors.colorRequired"));
        if (!formData.details?.condition)
          newErrors.push(t("errors.conditionRequired"));

        // Additional required fields from schema
        const subcategory = formData.category?.mainCategory === ListingCategory.VEHICLES 
          ? (formData.category?.subCategory as VehicleType) || VehicleType.CARS 
          : VehicleType.CARS;
        const vehicleSchema = listingsAdvancedFieldSchema[subcategory] || [];
        const requiredVehicleFields = vehicleSchema.filter(
          (field: ListingFieldSchema) => field.required,
        );

        requiredVehicleFields.forEach((field: ListingFieldSchema) => {
          const value = formData.details?.[field.name as string];
          if (!value && value !== 0) {
            newErrors.push(t(`errors.${field.name}Required`));
          }
        });

        // No special validation needed for cars and motorcycles
      } else if (
        formData.category?.mainCategory === ListingCategory.REAL_ESTATE
      ) {
        if (!formData.details?.propertyType)
          newErrors.push(t("errors.propertyTypeRequired"));
        if (!formData.details?.bedrooms)
          newErrors.push(t("errors.bedroomsRequired"));
        if (!formData.details?.bathrooms)
          newErrors.push(t("errors.bathroomsRequired"));
        if (!formData.details?.area)
          newErrors.push(t("errors.areaRequired"));

        const realEstateSchema =
          listingsAdvancedFieldSchema[formData.category?.subCategory] || [];
        const requiredRealEstateFields = realEstateSchema.filter(
          (field: ListingFieldSchema) => field.required,
        );

        requiredRealEstateFields.forEach((field: ListingFieldSchema) => {
          const value = formData.details?.[field.name as string];
          if (!value) {
            newErrors.push(t(`errors.${field.name}Required`));
          }
        });
      }

      // Image validation
      if (!formData.images || formData.images.length === 0) {
        newErrors.push(t("errors.atLeastOneImage"));
      }

      setErrors(newErrors);
      return newErrors.length === 0;
    };

    console.log("review formdata", formData);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const isValid = validateForm();
      if (isValid) {
        // Update form data with the selected listing action
        const updatedFormData = {
          ...formData,
          listingAction: listingAction as ListingAction,
          // Ensure all required fields are present
          title: formData.title || "",
          description: formData.description || "",
          price:
            typeof formData.price === "string"
              ? parseFloat(formData.price)
              : formData.price || 0,
          location: formData.location || "",
          category: {
            mainCategory:
              formData.category?.mainCategory || ListingCategory.VEHICLES,
            subCategory: formData.category?.subCategory || VehicleType.CARS,
          },
          details: formData.details || {},
          images: formData.images || [],
        };

        console.log("Submitting form data:", updatedFormData);
        onSubmit(updatedFormData);
      } else {
        // Scroll to the first error message
        const errorElement = document.querySelector(".text-red-500");
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };

    const renderSection = (
      title: string,
      icon: React.ReactNode,
      children: React.ReactNode,
    ) => (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </h3>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:underline"
          >
            <FaEdit className="mr-1" />
            {t("common.edit")}
          </button>
        </div>
        {children}
      </div>
    );

    const renderBasicDetails = () => (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <h3 className="text-lg font-medium">{formData.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {formData.description}
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <DollarSign className="w-4 h-4 mr-1" />
                {formatPrice(formData.price)}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-1" />
                {formData.location}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEdit("basic")}
            className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
            aria-label={t("common.basicDetails")}
          >
            <FaEdit className="w-5 h-5" />
            <span className="text-sm">{t("common.edit")}</span>
          </button>
        </div>
      </div>
    );

    const renderVehicleDetails = () => {
      const details = formData.details;
      if (!details) return null;

      // Check if this is a motorcycle
      // Only cars and motorcycles are supported

      return (
        <div className="space-y-4">
          {/* Essential Details Section */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">
              {t("listings.essentialDetails")}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.make")}
                </div>
                <div className="font-medium">
                  {details.make || t("common.notProvided")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.model")}
                </div>
                <div className="font-medium">
                  {details.model || t("common.notProvided")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.year")}
                </div>
                <div className="font-medium">
                  {details.year || t("common.notProvided")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.vehicleType")}
                </div>
                <div className="font-medium">
                  {details.vehicleType
                    ? t(`listings.vehicleTypes.${details.vehicleType}`)
                    : t("common.notProvided")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.mileage")}
                </div>
                <div className="font-medium">
                  {details.mileage
                    ? `${formatMileage(details.mileage)} ${t("listings.miles")}`
                    : t("common.notProvided")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.fuelType")}
                </div>
                <div className="font-medium">
                  {details.fuelType
                    ? formatFuelType(details.fuelType as FuelType)
                    : "Select an option"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.transmission")}
                </div>
                <div className="font-medium">
                  {details.transmissionType
                    ? t(`listings.transmissionTypes.${details.transmissionType}`)
                    : t("common.notProvided")}
                </div>
              </div>
              {/* Only cars and motorcycles are supported, no special fields for motorcycles */}
            </div>
          </div>

          {/* Advanced Details Section */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">
              {t("listings.advancedDetails")}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Colors */}
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.exteriorColor")}
                </div>
                <div className="font-medium flex items-center gap-2">
                  {details.color || t("common.notProvided")}
                  {details.color && (
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: details.color }}
                    />
                  )}
                </div>
              </div>
              <div>  
              </div>

              {/* Performance */}
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.engine")}
                </div>
                <div className="font-medium">
                  {details.engine || t("common.notProvided")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.torque")}
                </div>
                <div className="font-medium">
                  {details.torque
                    ? `${details.torque} Nm`
                    : t("common.notProvided")}
                </div>
              </div>

              {/* Condition & History */}
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.condition")}
                </div>
                <div className="font-medium">
                  {details.condition
                    ? formatCondition(details.condition)
                    : t("common.notProvided")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.warranty")}
                </div>
                <div className="font-medium">
                  {details.warranty
                    ? `${details.warranty} ${t("common.months")}`
                    : t("common.notProvided")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.serviceHistory")}
                </div>
                <div className="font-medium">
                  {details.serviceHistory
                    ? t(`listings.serviceHistory.${details.serviceHistory}`)
                    : t("common.notProvided")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.previousOwners")}
                </div>
                <div className="font-medium">
                  {details.previousOwners || t("common.notProvided")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {t("listings.registrationStatus")}
                </div>
                <div className="font-medium">
                  {details.registrationStatus
                    ? t(`listings.registrationStatus.${details.registrationStatus}`)
                    : t("common.notProvided")}
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          {details.features &&
            Object.keys(details.features).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                  {t("listings.features")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(details.features).map((feature: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      );
    };

    const renderRealEstateDetails = () => {
      const details = formData.details;
      if (!details) return null;

      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-gray-500">
                {t("listings.propertyType")}
              </div>
              <div className="font-medium">
                {details.propertyType
                  ? t(`listings.propertyTypes.${details.propertyType}`)
                  : t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("listings.size")}</div>
              <div className="font-medium">
                {details.area
                  ? `${details.area} ${t("listings.sqft")}`
                  : t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {t("listings.yearBuilt")}
              </div>
              <div className="font-medium">
                {details.yearBuilt || t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {t("listings.bedrooms")}
              </div>
              <div className="font-medium">
                {details.bedrooms || t("common.notProvided")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {t("listings.bathrooms")}
              </div>
              <div className="font-medium">
                {details.bathrooms || t("common.notProvided")}
              </div>
            </div>
            {details.features &&
              details.features.length > 0 && (
                <div className="col-span-2">
                  <div className="text-sm text-gray-500">
                    {t("listings.features")}
                  </div>
                  <div className="font-medium">
                    {formData.details?.realEstate?.features.join(", ")}
                  </div>
                </div>
              )}
          </div>
        </div>
      );
    };

    const renderImages = () => {
      if (!formData.images || formData.images.length === 0) {
        return null;
      }

      return (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {t("listings.images.uploadedImages")} ({formData.images.length})
            </h3>
            <button
              type="button"
              onClick={() => onEdit("images")}
              className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 text-sm font-medium"
              aria-label={t("listings.images.edit")}
            >
              <FaEdit className="w-4 h-4" />
              <span>{t("common.edit")}</span>
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {formData.images.map((image, index) => {
              // Handle both File objects and URLs
              const src =
                typeof image === "string" ? image : URL.createObjectURL(image);

              return (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  <ImageFallback
                    src={src}
                    alt={`${t("listings.images.image")} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    const getCarFieldDisplayValue = (
      field: ListingFieldSchema,
      vehicleDetails: any,
    ) => {
      const value = vehicleDetails?.[field.name];
      if (field.type === "checkbox" || field.type === "toggle") {
        return value ? t("common.yes") : t("common.no");
      }
      if (field.type === "select" && field.options) {
        const option = Array.isArray(field.options)
          ? field.options.find(
              (opt: any) => opt.value === value || opt === value,
            )
          : undefined;
        return typeof option === "object"
          ? option.label || option.value || value
          : value;
      }
      if (field.type === "featureGroup" && field.featureGroups) {
        // Render feature group toggles
        return (
          <div>
            {Object.entries(field.featureGroups).map(([groupKey, group]) => (
              <div key={groupKey} className="mb-2">
                <div className="font-semibold">{t(group.label)}</div>
                <div className="flex flex-wrap gap-2">
                  {group.features.map((feature) => {
                    // Try to translate, fallback to cleaned label
                    const label =
                      t(feature.label) !== feature.label
                        ? t(feature.label)
                        : feature.label
                            .replace(/^features\./, "")
                            .replace(/([a-z])([A-Z])/g, "$1 $2");
                    return (
                      <div
                        key={feature.name}
                        className="flex items-center gap-1"
                      >
                        <span>{label}</span>
                        <span className="ml-1 font-bold">
                          {vehicleDetails?.[feature.name]
                            ? t("common.yes")
                            : t("common.no")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      }
      if (field.type === "colorpicker") {
        return (
          <span
            className="inline-block w-6 h-6 rounded-full border border-gray-300 align-middle mr-2"
            style={{ backgroundColor: value }}
            title={value}
          />
        );
      }
      return (
        value || (
          <span className="text-gray-400">{t("common.notSpecified")}</span>
        )
      );
    };

    const getAdvancedFieldList = (): ListingFieldSchema[] => {
      if (formData.category?.mainCategory === ListingCategory.VEHICLES) {
        const subCat = formData.category.subCategory;
        return (
          vehicleAdvancedFieldLists[
            subCat as keyof typeof vehicleAdvancedFieldLists
          ] || []
        );
      }
      if (formData.category?.mainCategory === ListingCategory.REAL_ESTATE) {
        const subCat = formData.category.subCategory;
        return (
          propertyAdvancedFieldLists[
            subCat as keyof typeof propertyAdvancedFieldLists
          ] || []
        );
      }
      return [];
    };

    const advancedFieldList = getAdvancedFieldList();

    return (
      <div
        className={`${transitionClasses} space-y-6 opacity-0 translate-y-5 animate-fadeInUp`}
        style={{ animation: "fadeInUp 0.3s ease-out forwards" }}
      >
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        {renderSection(
          t("common.basicDetails"),
          <FaTag className="w-5 h-5 text-blue-500" />,
          renderBasicDetails(),
        )}

        {/* Listing Action */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 md:p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t("listings.listingAction")}
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => setListingAction("SALE")}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors flex flex-col items-center ${
                listingAction === "SALE"
                  ? "bg-blue-100 border-blue-500 dark:bg-blue-900/50 dark:border-blue-500"
                  : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              }`}
              aria-pressed={listingAction === "SALE"}
            >
              <FaCheck
                className={`w-8 h-8 mb-2 ${
                  listingAction === "SALE" ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <span className="text-lg font-medium">{t("listings.sale")}</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                {t("listings.saleDescription")}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setListingAction("RENT")}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors flex flex-col items-center ${
                listingAction === "RENT"
                  ? "bg-green-100 border-green-500 dark:bg-green-900/50 dark:border-green-500"
                  : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              }`}
              aria-pressed={listingAction === "RENT"}
            >
              <FaHistory
                className={`w-8 h-8 mb-2 ${
                  listingAction === "RENT" ? "text-green-500" : "text-gray-400"
                }`}
              />
              <span className="text-lg font-medium">{t("listings.rent")}</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                {t("listings.rentDescription")}
              </p>
            </button>
          </div>
        </div>

        {/* Category-specific Details */}
        {formData.category?.mainCategory === ListingCategory.VEHICLES
          ? renderSection(
              t("listings.vehicleDetails"),
              <FaCar className="w-5 h-5 text-blue-500" />,
              <>
                {renderVehicleDetails()}
                {/* Advanced Details */}
                {advancedFieldList.length > 0 && (
                  <section className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {t("review.advancedDetails")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {advancedFieldList.map((field) => (
                        <div key={field.name} className="flex flex-col">
                          <span className="text-sm text-gray-500">
                            {t(field.label)}
                          </span>
                          <span className="font-medium">
                            {getCarFieldDisplayValue(
                              field,
                              formData.details?.vehicles ||
                                formData.details?.realEstate,
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>,
            )
          : renderSection(
              t("listings.propertyDetails"),
              <FaHome className="w-5 h-5 text-blue-500" />,
              <>
                {renderRealEstateDetails()}
                {/* Advanced Details */}
                {advancedFieldList.length > 0 && (
                  <section className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {t("review.advancedDetails")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {advancedFieldList.map((field) => (
                        <div key={field.name} className="flex flex-col">
                          <span className="text-sm text-gray-500">
                            {t(field.label)}
                          </span>
                          <span className="font-medium">
                            {getCarFieldDisplayValue(
                              field,
                              formData.details?.vehicles ||
                                formData.details?.realEstate,
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>,
            )}

        {/* Images */}
        {renderSection(
          t("listings.images"),
          <FaImages className="w-5 h-5 text-blue-500" />,
          <Suspense fallback={<div>Loading images...</div>}>
            {renderImages()}
          </Suspense>,
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((error, index) => (
              <p key={index} className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 inline-block mr-2" />
              {t("common.back")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaHistory className="animate-spin" />
                  <span>{t("common.submitting")}</span>
                </>
              ) : (
                <>
                  <FaCheck className="w-4 h-4 mr-2" />
                  <span>{t("common.submit")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  },
); // Close the React.memo wrapper
export default ReviewSection;
