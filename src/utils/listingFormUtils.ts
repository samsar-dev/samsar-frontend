export const prepareListingFormData = (
  formData: any,
  images: (File | string)[] = [],
): FormData => {
  const form = new FormData();

  // Add all form fields to FormData
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (typeof value === "object" && !(value instanceof File)) {
        // Handle nested objects (like details)
        form.append(key, JSON.stringify(value));
      } else {
        form.append(key, value as any);
      }
    }
  });

  // Add images
  images.forEach((image, index) => {
    if (image instanceof File) {
      form.append("images", image);
    } else if (typeof image === "string") {
      form.append("existingImages", image);
    }
  });

  return form;
};

export const initializeFormData = (initialData: any = {}) => {
  return {
    title: initialData.title || "",
    description: initialData.description || "",
    price: initialData.price || 0,
    category: initialData.category || "",
    condition: initialData.condition || "new",
    location: initialData.location || {
      address: "",
      city: "",
      state: "",
      country: "",
      coordinates: { lat: 0, lng: 0 },
    },
    details: initialData.details || {},
    images: initialData.images || [],
    deletedImages: [],
  };
};

export const validateListingForm = (
  formData: any,
  isEdit: boolean = false,
): string | null => {
  if (!formData.title?.trim()) {
    return "Title is required";
  }

  if (!formData.description?.trim()) {
    return "Description is required";
  }

  if (formData.price < 0) {
    return "Price cannot be negative";
  }

  if (!formData.category) {
    return "Category is required";
  }

  if (!formData.location?.address?.trim()) {
    return "Address is required";
  }

  // Additional validation for vehicle details if applicable
  if (formData.details?.vehicles) {
    const { make, model, year } = formData.details.vehicles;
    if (!make?.trim()) return "Make is required";
    if (!model?.trim()) return "Model is required";
    if (!year || year < 1900 || year > new Date().getFullYear() + 1) {
      return "Please enter a valid year";
    }
  }

  return null;
};
