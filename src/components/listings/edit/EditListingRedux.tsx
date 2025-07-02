import { useEffect, useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaSave } from "react-icons/fa";

import { useListingStore } from "@/hooks/useListingStore";
import { PRICE_CHANGE } from "@/constants/socketEvents";
import { FormField } from "@/components/form/FormField";
import ImageManager from "@/components/listings/images/ImageManager";
import { Button } from "@/components/ui/Button2";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/contexts/SocketContext";
import { getFieldsBySection } from "@/utils/listingSchemaUtils";
import { VehicleType, PropertyType } from "@/types/enums";
import type { Listing, ListingFieldSchema } from "@/types/listings";
import { updateListing } from "@/store/listing/listing.actions";


type SectionId = 'basic' | 'essential' | 'advanced' | 'features' | 'location' | 'media' | 'pricing' | 'contact';
type SupportedFieldType = 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'color' | 'boolean' | 'multiselect' | 'date';

interface ExtendedFieldProps {
  name: string;
  label: string;
  type: SupportedFieldType;
  value: any;
  onChange: (value: any) => void;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  placeholder?: string;
}

interface ExtendedListing extends Omit<Listing, 'listingType'> {
  listingType?: VehicleType | PropertyType | string;
  [key: string]: any;
}

interface FormData {
  [key: string]: any;
  details?: {
    [key: string]: any;
    vehicles?: {
      [key: string]: any;
    };
  };
}

interface ExtendedFieldSchema extends Omit<ListingFieldSchema, 'placeholder'> {
  placeholder?: string;
}

export const EditListingRedux = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const {
    formData,
    images,
    loading,
    error,
    currentListing,
    fetchListing: fetchListingAction,
    setFormData: setFormDataAction,
    setLoading: setLoadingAction,
    addImage: addImageAction,
    removeImage: removeImageAction,
    resetListingState
  } = useListingStore();

  const [activeTab, setActiveTab] = useState<SectionId>('basic');

  // Get field value helper function
  const getFieldValue = useCallback((obj: any, path: string): any => {
    if (!obj) return undefined;
    return path.split('.').reduce((o, p) => (o || {})[p], obj);
  }, []);

  // Get the listing type safely
  const listingType = useMemo<VehicleType | PropertyType | null>(() => {
    if (!currentListing) return null;
    const listing = currentListing as ExtendedListing;
    const type = listing.listingType;
    if (!type) return null;
    
    if (Object.values(VehicleType).includes(type as VehicleType)) {
      return type as VehicleType;
    }
    if (Object.values(PropertyType).includes(type as PropertyType)) {
      return type as PropertyType;
    }
    return null;
  }, [currentListing]);
  
  const setFieldValue = useCallback((name: string, value: any) => {
    setFormDataAction((prev: FormData) => {
      if (name.includes('.')) {
        const [parent, ...rest] = name.split('.');
        const child = rest.join('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent] || {}),
            [child]: value
          }
        };
      }
      return { ...prev, [name]: value };
    });
  }, [setFormDataAction]);

  // Map schema field types to supported form field types
  const mapFieldType = (type: string): SupportedFieldType => {
    const typeMap: Record<string, SupportedFieldType> = {
      text: 'text',
      number: 'number',
      textarea: 'textarea',
      select: 'select',
      toggle: 'checkbox',
      colorpicker: 'color',
      boolean: 'checkbox',
      multiselect: 'multiselect',
      date: 'date'
    };
    return typeMap[type] || 'text';
  };

  // Get the current section fields based on the active tab and schema
  const currentFields = useMemo<ExtendedFieldProps[]>(() => {
    if (!currentListing || !listingType) return [];
    
    try {
      const section = activeTab === 'basic' ? 'essential' : 
                    activeTab === 'advanced' ? 'advanced' : 'essential';
      
      const sectionFields = (getFieldsBySection(listingType, section) || []) as ExtendedFieldSchema[];
      
      return sectionFields.map((field) => {
        const value = getFieldValue(currentListing, field.name);
        const mappedType = mapFieldType(field.type || 'text');
        
        const options = Array.isArray(field.options) 
          ? field.options.map(opt => 
              typeof opt === 'string' ? { value: opt, label: opt } : opt
            )
          : undefined;
        
        const fieldProps: Omit<ExtendedFieldProps, 'onChange'> = {
          name: field.name,
          label: field.label || field.name,
          type: mappedType,
          value: mappedType === 'checkbox' ? Boolean(value) : value,
          options,
          required: field.required,
          placeholder: (field as any).placeholder
        };
        
        return {
          ...fieldProps,
          onChange: (newValue: any) => {
            const finalValue = mappedType === 'checkbox' ? Boolean(newValue) : newValue;
            setFieldValue(field.name, finalValue);
          },
        };
      });
    } catch (error) {
      console.error('Error loading fields:', error);
      return [];
    }
  }, [currentListing, listingType, activeTab, getFieldValue, setFieldValue]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentListing?.id) return;

    try {
      setLoadingAction(true);
      
      const formDataToSubmit = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSubmit.append(key, value.toString());
        }
      });

      // Add images to form data
      images.forEach((img, index) => {
        if (typeof img === 'string') {
          formDataToSubmit.append(`images[${index}]`, img);
        } else if (img instanceof File) {
          formDataToSubmit.append(`images[${index}]`, img);
        }
      });

      // Update the listing using the Redux action
      const result = await updateListing(currentListing.id, formDataToSubmit)(
        // @ts-ignore - TypeScript doesn't recognize the thunk action
        (action) => {
          // This is a no-op dispatch function since we're not using it
          return action;
        },
        // @ts-ignore - TypeScript doesn't recognize the getState parameter
        () => ({}),
        undefined
      );

      if (result?.success) {
        toast.success(t('listings.updateSuccess'));
        navigate(`/listings/${currentListing.id}`);
      } else {
        throw new Error(result?.error || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error(error instanceof Error ? error.message : t('common.errorOccurred'));
    } finally {
      setLoadingAction(false);
    }
  }, [user, currentListing?.id, formData, navigate, setLoadingAction, t, updateListing]);

  // Handle image updates
  const handleImagesChange = useCallback((newImages: (string | File)[]) => {
    // Handle image updates
    newImages.forEach(img => {
      if (typeof img === 'string') {
        addImageAction(img);
      } else if (img instanceof File) {
        // Convert File to data URL if needed
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            addImageAction(e.target.result as string);
          }
        };
        reader.readAsDataURL(img);
      }
    });
  }, [addImageAction]);

  // Fetch listing data on mount
  useEffect(() => {
    const loadListing = async () => {
      if (!id) return;
      
      try {
        setLoadingAction(true);
        await fetchListingAction(id);
      } catch (error) {
        console.error('Error loading listing:', error);
        toast.error(t('listings.loadError'));
        navigate('/listings');
      } finally {
        setLoadingAction(false);
      }
    };

    loadListing();

    // Cleanup on unmount
    return () => {
      resetListingState();
    };
  }, [id, fetchListingAction, resetListingState, setLoadingAction, t, navigate]);

  // Listen for price updates via WebSocket
  useEffect(() => {
    if (!socket || !currentListing?.id) return;

    const handlePriceUpdate = (data: { listingId: string; newPrice: number }) => {
      if (data.listingId === currentListing.id) {
        setFieldValue('price', data.newPrice.toString());
        toast(t('listings.priceUpdated', { price: data.newPrice }));
      }
    };

    socket.on(PRICE_CHANGE, handlePriceUpdate);
    return () => {
      socket.off(PRICE_CHANGE, handlePriceUpdate);
    };
  }, [socket, currentListing, setFieldValue, t]);

  if (loading && !currentListing) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("listings.editListing")}</h1>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="mr-2" />
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
                    ? 'border-blue-500 text-blue-600'
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
              name={field.name}
              label={field.label}
              type={field.type}
              value={field.value}
              onChange={field.onChange}
              options={field.options}
              required={field.required}
              placeholder={field.placeholder}
            />
          ))}

          {/* Image manager */}
          {activeTab === 'media' && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">{t('listings.images')}</h3>
              <ImageManager
                images={images.filter((img): img is File => img instanceof File)}
                existingImages={images.filter((img): img is string => typeof img === 'string')}
                onChange={handleImagesChange}
                onDeleteExisting={(url) => {
                  const index = images.findIndex(img => img === url);
                  if (index !== -1) {
                    removeImageAction(index, true);
                  }
                }}
                maxImages={10}
              />
            </div>
          )}
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
            className="flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin">↻</span>
            ) : (
              <FaSave />
            )}
            {t("common.saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditListingRedux;
