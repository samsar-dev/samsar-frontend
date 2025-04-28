import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type {
  Listing,
  Location,
  ListingUpdateInput,
  ListingFieldSchema,
} from "@/types/listings";
import {
  ListingStatus,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
} from "@/types/enums";
import { listingsAPI } from "@/api/listings.api";
import { Button } from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaSave,
  FaCar,
  FaHome,
  FaInfo,
  FaTools,
  FaHistory,
  FaShieldAlt,
} from "react-icons/fa";
import ListingCard from "@/components/listings/details/ListingCard";
import { useAuth } from "@/hooks/useAuth";
import {
  listingsAdvancedFieldSchema,
  SECTION_CONFIG,
  SectionId,
} from "@/components/listings/create/advanced/listingsAdvancedFieldSchema";
import { set } from "lodash";
import ColorPickerField from "@/components/listings/forms/ColorPickerField";
import FormField, { FormFieldProps } from "@/components/common/FormField";
import ImageManager from "@/components/listings/images/ImageManager";

interface EditFormData {
  title: string;
  description: string;
  price: number;
  location: Location;
  details: {
    vehicles?: Record<string, any>;
    realEstate?: Record<string, any>;
  };
  images: (string | File)[];
  existingImages: string[];
}

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType } = {
    car: FaCar,
    home: FaHome,
    info: FaInfo,
    tools: FaTools,
    history: FaHistory,
    shield: FaShieldAlt,
  };
  return iconMap[iconName] || FaInfo;
};

const EditListing: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isVehicle, setIsVehicle] = useState(true);
  const [listing, setListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    title: "",
    description: "",
    price: 0,
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    details: {
      vehicles: {},
      realEstate: {},
    },
    images: [],
    existingImages: [],
  });

  const vehicleType = formData.details?.vehicles?.vehicleType as
    | VehicleType
    | undefined;
  const propertyType = formData.details?.realEstate?.propertyType as
    | PropertyType
    | undefined;

  // Use type assertion to avoid the indexing issues
  const advancedSchema = ((): ListingFieldSchema[] => {
    if (isVehicle && vehicleType) {
      return (listingsAdvancedFieldSchema as any)[vehicleType] || [];
    } else if (!isVehicle && propertyType) {
      return (listingsAdvancedFieldSchema as any)[propertyType] || [];
    }
    return [];
  })();

  // Get unique sections from the schema and sort them according to SECTION_CONFIG
  const advancedDetail = Array.from(
    new Set(advancedSchema.map((field: ListingFieldSchema) => field.section)),
  )
    .filter(
      (sectionId: unknown): sectionId is SectionId =>
        typeof sectionId === "string" && sectionId in SECTION_CONFIG,
    )
    .map((sectionId: SectionId) => ({
      id: sectionId,
      title: SECTION_CONFIG[sectionId].label || "",
      icon: getIconComponent(SECTION_CONFIG[sectionId].icon),
      order: SECTION_CONFIG[sectionId].order,
      fields: advancedSchema.filter(
        (field: ListingFieldSchema) => field.section === sectionId,
      ),
    }))
    .sort((a, b) => a.order - b.order);

  const advancedDetailFiels = advancedDetail[0]?.fields;

  useEffect(() => {
    // Redirect if not authenticated after auth is initialized
    if (!isAuthLoading && !isAuthenticated) {
      toast.error(t("auth.requiresLogin"));
      navigate("/auth/login", { state: { from: `/listings/${id}/edit` } });
      return;
    }

    // Only fetch if authenticated and we have an ID
    if (isAuthenticated && id) {
      const fetchListing = async () => {
        try {
          setLoading(true);
          const response = await listingsAPI.getListing(id);
          if (response.success && response.data) {
            console.log("Listing res:", response.data);
            setListing(response.data);
            // Parse the location string into components
            const locationParts = response.data.location.split(", ");
            const [city = "", state = "", country = ""] = locationParts;

            // Convert image URLs to strings for existing images
            const existingImages = (response.data.images || []).map(
              (img: any) => (typeof img === "string" ? img : img.url),
            );

            setFormData({
              title: response.data.title,
              description: response.data.description,
              price: response.data.price,
              location: {
                address: response.data.location,
                city,
                state,
                country,
                postalCode: "",
              },
              details: {
                vehicles: response.data.details?.vehicles,
                realEstate: response.data.details?.realEstate,
              },
              images: existingImages,
              existingImages: existingImages,
            });
            setIsVehicle(response.data.details?.vehicles ? true : false);
          }
        } catch (error) {
          console.error("Error fetching listing:", error);
          toast.error(t("errors.fetchFailed"));
          navigate("/profile/listings");
        } finally {
          setLoading(false);
        }
      };

      fetchListing();
    }
  }, [id, isAuthenticated, isAuthLoading, t, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !listing) return;

    try {
      setSaving(true);

      // Create FormData object
      const formDataObj = new FormData();

      // Add basic fields
      formDataObj.append("title", formData.title);
      formDataObj.append("description", formData.description);
      formDataObj.append("price", String(formData.price));
      formDataObj.append("category", String(listing.category));
      formDataObj.append("location", formData.location.city);
      formDataObj.append("status", String(listing.status));

      // Add existing images as JSON string
      formDataObj.append(
        "existingImages",
        JSON.stringify(formData.existingImages),
      );

      // Add new images
      const newImages = formData.images.filter(
        (img): img is File => img instanceof File,
      );
      newImages.forEach((image) => {
        formDataObj.append("images", image);
      });

      // Process details
      const details = {
        vehicles: isVehicle ? formData.details.vehicles : undefined,
        realEstate: !isVehicle ? formData.details.realEstate : undefined,
      };

      delete details.realEstate?.listingId;
      delete details.vehicles?.listingId;

      // Append details as JSON
      formDataObj.append("details", JSON.stringify(details));

      console.log("Submitting form data:", {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        location: formData.location.city,
        details: details,
        existingImages: formData.existingImages,
        newImages: newImages.length,
      });

      const response = await listingsAPI.updateListing(id, formDataObj);
      if (response.success) {
        toast.success(t("listings.updateSuccess"));
        navigate("/profile/listings");
      } else {
        const errorMessage = response.error || t("listings.updateFailed");
        console.error("Update failed:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error updating listing:", error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        error.message ||
        t("listings.updateFailed");
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await listingsAPI.deleteListing(id);
      if (response.success) {
        toast.success(t("listings.deleteSuccess"));
        navigate("/profile/listings");
      } else {
        toast.error(t("listings.deleteFailed"));
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error(t("listings.deleteFailed"));
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[],
  ) => {
    setFormData((prevForm) => {
      const detailsKey = isVehicle ? "vehicles" : "realEstate";

      // Convert numeric fields to numbers
      let processedValue = value;
      if (
        field === "yearBuilt" ||
        field === "mileage" ||
        field === "cargoVolume" ||
        field === "payloadCapacity" ||
        field === "previousOwners" ||
        field === "seatingCapacity" ||
        field === "horsepower" ||
        field === "torque" ||
        field === "luggageSpace"
      ) {
        processedValue =
          typeof value === "string" ? parseInt(value, 10) : value;
      }

      // Ensure warranty is always a string and handle 0 values
      if (field === "warranty") {
        if (value === 0 || value === "0") {
          processedValue = "";
        } else {
          processedValue = String(value || "");
        }
        console.log(
          "Setting warranty value:",
          processedValue,
          "type:",
          typeof processedValue,
        );
      }

      return {
        ...prevForm,
        details: {
          ...prevForm.details,
          [detailsKey]: {
            ...prevForm.details[detailsKey],
            [field]: processedValue,
          },
        },
      };
    });
  };

  const handleImageChange = (images: File[]) => {
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.existingImages || []), ...images].filter(Boolean),
    }));
  };

  const handleImageDelete = (index: number) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const deletedImage = newImages[index];
      newImages.splice(index, 1);

      // If the deleted image was an existing image (string URL), also remove it from existingImages
      if (typeof deletedImage === "string") {
        const newExistingImages = prev.existingImages.filter(
          (img) => img !== deletedImage,
        );
        return {
          ...prev,
          images: newImages,
          existingImages: newExistingImages,
        };
      }

      return {
        ...prev,
        images: newImages,
      };
    });
  };

  if (isAuthLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("listings.notFound")}
        </h2>
      </div>
    );
  }

  // Helper function to format enum options
  const getEnumOptions = (enumObj: Record<string, string>) => {
    return Object.values(enumObj).map((value) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("listings.editListing")}
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate("/profile/listings")}
            className="flex items-center gap-2"
          >
            <FaArrowLeft /> {t("common.back")}
          </Button>
        </div>

        <div className="mb-6">
          <ListingCard
            listing={{
              ...listing,
              vehicleDetails: listing.details?.vehicles,
              realEstateDetails: listing.details?.realEstate,
            }}
            editable={true}
            deletable={true}
            showActions={true}
            showPrice={true}
            showLocation={true}
            onDelete={handleDelete}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("listings.images")}
            </h2>
            <ImageManager
              images={formData.images.filter(
                (img): img is File => img instanceof File,
              )}
              onChange={handleImageChange}
              maxImages={10}
              existingImages={formData.existingImages}
              onDeleteExisting={(url) => {
                setFormData((prev) => ({
                  ...prev,
                  images: prev.images.filter((img) => img !== url),
                  existingImages: prev.existingImages.filter(
                    (img) => img !== url,
                  ),
                }));
              }}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Basic Details
            </h1>
            <FormField
              label={t("listings.title")}
              name="title"
              type="text"
              value={formData.title}
              onChange={(value) =>
                setFormData({ ...formData, title: value as string })
              }
              required
            />

            <FormField
              label={t("listings.description")}
              name="description"
              type="textarea"
              value={formData.description}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  description: value as string,
                })
              }
              required
            />

            <FormField
              label={t("listings.price")}
              name="price"
              type="number"
              value={formData.price.toString()}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  price: parseFloat(value as string) || 0,
                })
              }
              required
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {t("listings.location")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={t("listings.city")}
                  name="city"
                  type="text"
                  value={formData.location.city}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        city: value as string,
                      },
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Details
            </h1>

            {/* Add special fields here for Transmission, FuelType, and Condition */}
            {isVehicle && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                <FormField
                  label={t("listings.fields.transmissionType")}
                  name="transmissionType"
                  type="select"
                  value={formData.details?.vehicles?.transmissionType || ""}
                  options={getEnumOptions(TransmissionType)}
                  onChange={(value) =>
                    handleInputChange("transmissionType", value)
                  }
                  required
                />

                <FormField
                  label={t("listings.fields.fuelType")}
                  name="fuelType"
                  type="select"
                  value={formData.details?.vehicles?.fuelType || ""}
                  options={getEnumOptions(FuelType)}
                  onChange={(value) => handleInputChange("fuelType", value)}
                  required
                />

                <FormField
                  label={t("listings.fields.condition")}
                  name="condition"
                  type="select"
                  value={formData.details?.vehicles?.condition || ""}
                  options={getEnumOptions(Condition)}
                  onChange={(value) => handleInputChange("condition", value)}
                  required
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                {advancedDetailFiels &&
                  advancedDetailFiels.map((field: any, idx: number) => {
                    // Skip fields we're now handling separately
                    if (
                      ["transmissionType", "fuelType", "condition"].includes(
                        field.name,
                      )
                    ) {
                      return null;
                    }

                    const currentValue = isVehicle
                      ? formData.details?.vehicles?.[field.name]
                      : formData.details?.realEstate?.[field.name];

                    if (field.type === "colorpicker") {
                      return (
                        <ColorPickerField
                          key={field.name || idx}
                          label={field.label}
                          value={(currentValue as string) || "#000000"}
                          onChange={(value) =>
                            handleInputChange(field.name, value)
                          }
                          required={field.required}
                        />
                      );
                    }
                    return (
                      <FormField
                        key={field.name || idx}
                        label={field.label}
                        name={field.name}
                        type={field.type as FormFieldProps["type"]}
                        value={currentValue || ""}
                        options={field.options?.map((key: string) => ({
                          value: key,
                          label: key,
                        }))}
                        onChange={(value) =>
                          handleInputChange(field.name, value)
                        }
                        required={field.required}
                      />
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/profile/listings")}
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2"
            >
              <FaSave />
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
