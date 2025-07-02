import { useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaSave } from "react-icons/fa";

import { useListingStore } from "@/hooks/useListingStore";
import { prepareListingFormData, validateListingForm } from "@/utils/listingFormUtils";
import { listingsAPI } from "@/api/listings.api";
import { PRICE_CHANGE } from "@/constants/socketEvents";
import { FormField } from "@/components/form/FormField";
import ImageManager from "@/components/listings/images/ImageManager";
import { Button } from "@/components/ui/Button2";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/contexts/SocketContext";
import { getFieldsBySection, getFieldValue } from "@/utils/listingSchemaUtils";
import type { ListingFieldSchema, VehicleType, PropertyType } from "@/types/listings";

type SectionId = 'basic' | 'details' | 'features' | 'location' | 'media' | 'pricing' | 'contact';

interface ExtendedFieldProps extends ListingFieldSchema {
  value: any;
  onChange: (value: any) => void;
  options?: Array<{ value: string; label: string }>;
}

const EditListingRedux: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  // Get state and actions from Redux store
  const {
    formData,
    images,
    loading,
    error,
    currentListing,
    setFormData: setFormDataAction,
    addImage: addImageAction,
    removeImage: removeImageAction,
    setLoading: setLoadingAction,
    setError: setErrorAction,
    updateListing: updateListingAction,
    fetchListing: fetchListingAction,
    resetListingState
  } = useListingStore();

  // Set up active tab state
  const [activeTab, setActiveTab] = useState<SectionId>('basic');
  
  // Determine if this is a vehicle listing
  const isVehicle = useMemo(() => {
    return formData.details?.vehicles !== undefined;
  }, [formData.details]);

  // Get the current section fields based on the active tab and schema
  const currentFields = useMemo<ExtendedFieldProps[]>(() => {
    if (!activeTab) return [];

    const listingType = isVehicle
      ? (formData.details.vehicles?.vehicleType as VehicleType)
      : (formData.details.realEstate?.propertyType as PropertyType);

    if (!listingType) return [];

    // Get fields from schema utils
    const fields = getFieldsBySection(listingType, activeTab);

    return fields.map((field) => ({
      ...field,
      value: getFieldValue(formData, field.name),
      options: Array.isArray(field.options)
        ? field.options.map((opt) =>
            typeof opt === "string" ? { value: opt, label: opt } : opt
          )
        : undefined,
      onChange: (value: any) => {
        const fieldType = isVehicle ? "vehicles" : "realEstate";
        handleInputChange(field.name, value, fieldType);
      },
    }));
  }, [activeTab, isVehicle, formData]);

  // Fetch listing data when component mounts
  useEffect(() => {
    if (!id) return;
    
    const loadListing = async () => {
      try {
        setLoadingAction(true);
        const result = await fetchListingAction(id);
        
        if (!result.success) {
          toast.error(t("errors.failedToLoadListing"));
          navigate("/dashboard/listings");
        }
      } catch (err) {
        console.error("Error loading listing:", err);
        toast.error(t("errors.failedToLoadListing"));
        navigate("/dashboard/listings");
      } finally {
        setLoadingAction(false);
      }
    };

    loadListing();

    // Clean up when component unmounts
    return () => {
      resetListingState();
    };
  }, [id, navigate, t]);

  // Handle form input changes
  const handleInputChange = useCallback(
    (name: string, value: any, fieldType?: "vehicles" | "realEstate" | "location") => {
      setFormDataAction(prev => {
        // Handle nested fields (e.g., details.vehicles.make)
        if (name.includes('.')) {
          const [parent, child] = name.split('.');
          return {
            ...prev,
            [parent]: {
              ...prev[parent as keyof typeof prev],
              [child]: value
            }
          };
        }
        
        // Handle direct form fields
        return { ...prev, [name]: value };
      });
    },
    [setFormDataAction]
  );

  // Handle image uploads
  const handleImageUpload = useCallback((files: File[]) => {
    files.forEach(file => {
      addImageAction(file);
    });
  }, [addImageAction]);

  // Handle image removal
  const handleImageRemove = useCallback((index: number, isUrl: boolean) => {
    removeImageAction(index, isUrl);
  }, [removeImageAction]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t("errors.unauthorized"));
      return;
    }

    // Validate form data
    const validationError = validateListingForm(formData, true);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoadingAction(true);
      
      // Prepare form data for submission
      const formDataToSubmit = prepareListingFormData(formData, images);
      
      // Update the listing
      const result = await updateListingAction(id!, formDataToSubmit);
      
      if (result.success) {
        toast.success(t("listings.updateSuccess"));
        
        // Notify about price change via socket if price changed
        if (currentListing && formData.price !== currentListing.price) {
          socket?.emit(PRICE_CHANGE, {
            listingId: id,
            oldPrice: currentListing.price,
            newPrice: formData.price,
            userId: user.id,
          });
        }
        
        navigate(`/listings/${id}`);
      } else {
        toast.error(result.error || t("errors.updateFailed"));
      }
    } catch (err) {
      console.error("Error updating listing:", err);
      setErrorAction(t("errors.updateFailed"));
      toast.error(t("errors.updateFailed"));
    } finally {
      setLoadingAction(false);
    }
  }, [
    user, 
    formData, 
    images, 
    id, 
    currentListing, 
    socket, 
    t, 
    navigate, 
    setLoadingAction, 
    setErrorAction, 
    updateListingAction
  ]);

  if (loading && !formData) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("listings.editListing")}</h1>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          startIcon={<FaArrowLeft />}
        >
          {t("common.back")}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['basic', 'details', 'features', 'location', 'media', 'pricing'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as SectionId)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t(`listings.tabs.${tab}`)}
              </button>
            ))}
          </nav>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {currentFields.map((field) => (
            <FormField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              value={field.value}
              onChange={field.onChange}
              options={field.options}
              required={field.required}
              disabled={loading}
              placeholder={field.placeholder}
            />
          ))}
        </div>

        {/* Image manager */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-4">{t("listings.images")}</h2>
          <ImageManager
            images={images}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            maxFiles={10}
            disabled={loading}
          />
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            startIcon={<FaSave />}
            loading={loading}
            disabled={loading}
          >
            {t("common.saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditListingRedux;
