import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile } from "react-device-detect";
import imageCompression from "browser-image-compression";
import { FaImage, FaSpinner } from "react-icons/fa";
import ImageEditor from "./ImageEditor";
import DraggableImage from "./DraggableImage";

// Define a unified image type to handle both File objects and URLs
interface UnifiedImage {
  id: string;        // Unique identifier
  type: 'file' | 'url'; // Type of image (file or url)
  src: string;       // URL for display
  data: File | string; // Original data (File object or URL string)
  isExisting: boolean; // Whether this is an existing image
  key?: string;      // React key for stable rendering
  metadata?: {
    fileSize?: string;
    dimensions?: string;
  };
}

interface ImageManagerProps {
  images: File[];
  onChange: (images: File[]) => void;
  maxImages?: number;
  error?: string;
  existingImages?: string[];
  onDeleteExisting?: (url: string) => void;
  onReorderExisting?: (fromIndex: number, toIndex: number) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_FILE_SIZE = 5 * 1024; // 5KB
const ALLOWED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const RESPONSIVE_SIZES = {
  thumbnail: 400, // For thumbnails and previews
  medium: 800, // For medium-sized displays
  large: 1200, // For large displays
  original: 1920, // Maximum width for original images
};

const ImageManager: React.FC<ImageManagerProps> = ({
  images,
  onChange,
  maxImages = 10,
  error,
  existingImages = [],
  onDeleteExisting,
  onReorderExisting,
}) => {
  const { t } = useTranslation("listings");
  // Use a unified image array instead of separate arrays for better control
  const [unifiedImages, setUnifiedImages] = useState<UnifiedImage[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  // Counter for generating unique IDs
  const idCounter = useRef(0);
  
  const [editingImage, setEditingImage] = useState<{
    url: string;
    index: number;
  } | null>(null);
  
  // Function to generate a unique ID
  const generateUniqueId = useCallback((prefix = '') => {
    idCounter.current += 1;
    return `${prefix}${idCounter.current}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);
  const [imageSizes, setImageSizes] = useState<{ [key: string]: number }>({});
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);

  // Keep track of created object URLs to properly clean them up
  const objectUrlsRef = useRef<string[]>([]);

  // Check WebP support on component mount
  useEffect(() => {
    const checkWebP = async () => {
      const result = await checkWebPSupport();
      setSupportsWebP(result);
    };
    checkWebP();
  }, []);

  // Cache for stable IDs to prevent regeneration during re-renders
  const imageIdCacheRef = useRef<Map<string, string>>(new Map());
  
  // Track used IDs to prevent duplicates
  const usedIdsRef = useRef<Set<string>>(new Set());
  
  // Create unified images from both new and existing images
  useEffect(() => {
    // Clear the used IDs set at the start of each render cycle
    usedIdsRef.current.clear();
    // Clean up previous object URLs
    objectUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error revoking URL:", error);
      }
    });
    objectUrlsRef.current = [];
    
    // Process new images (File objects)
    const newImageObjects = images.map((file: File) => {
      try {
        // Generate a stable ID for this file to prevent regeneration
        const fileKey = `file-${file.name}-${file.size}-${file.lastModified}`;
        let id = imageIdCacheRef.current.get(fileKey);
        
        // If we don't have an ID or it's already used (duplicate), generate a new one
        if (!id || usedIdsRef.current.has(id)) {
          // Ensure uniqueness by adding timestamp and random string
          id = fileKey + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          imageIdCacheRef.current.set(fileKey, id);
        }
        
        // Mark this ID as used for this render cycle
        usedIdsRef.current.add(id);
        
        // Find existing object URL if available to prevent duplicate URL creation
        let url = '';
        const existingImage = unifiedImages.find(img => 
          img.type === 'file' && 
          img.data instanceof File && 
          img.data.name === file.name && 
          img.data.size === file.size && 
          img.data.lastModified === file.lastModified
        );
        
        if (existingImage && existingImage.src.startsWith('blob:')) {
          // Reuse existing URL
          url = existingImage.src;
        } else {
          // Create new URL
          url = URL.createObjectURL(file);
          objectUrlsRef.current.push(url);
        }
        
        // Calculate file size for display
        const fileSize = file ? (file.size / 1024).toFixed(1) + ' KB' : '';
        
        // Calculate dimensions (approximate)
        const dimensions = file && imageSizes[file.name]
          ? `${Math.round(Math.sqrt((imageSizes[file.name] * 1024) / 0.92))}px`
          : "";
        
        return {
          id,
          key: id, // Add a stable React key
          type: 'file' as const,
          src: url,
          data: file,
          isExisting: false,
          metadata: {
            fileSize,
            dimensions
          }
        };
      } catch (error) {
        console.error("Error creating URL for file:", error);
        return null;
      }
    }).filter(Boolean) as UnifiedImage[];
    
    // Process existing images (URLs)
    const existingImageObjects = existingImages.map((url: string) => {
      // Generate a stable ID for this URL to prevent regeneration
      const urlKey = `url-${url}`;
      let id = imageIdCacheRef.current.get(urlKey);
      
      // If we don't have an ID or it's already used (duplicate), generate a new one
      if (!id || usedIdsRef.current.has(id)) {
        // Ensure uniqueness by adding timestamp and random string
        id = 'existing-' + url.split('/').pop() + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        imageIdCacheRef.current.set(urlKey, id);
      }
      
      // Mark this ID as used for this render cycle
      usedIdsRef.current.add(id);
      
      return {
        id,
        key: id, // Add a stable React key
        type: 'url' as const,
        src: url,
        data: url,
        isExisting: true
      };
    });
    
    // Create a map to track images by their stable IDs
    const imageMap = new Map<string, UnifiedImage>();
    
    // Process new images first
    newImageObjects.forEach(img => {
      imageMap.set(img.id, img);
    });
    
    // Then process existing images, preserving their order
    existingImageObjects.forEach(img => {
      if (!imageMap.has(img.id)) {
        imageMap.set(img.id, img);
      }
    });
    
    // Convert map back to array while preserving order
    const allImages = Array.from(imageMap.values());
    
    // Set the unified images state
    setUnifiedImages(allImages);
    const urls = newImageObjects.map(img => img.src);
    setPreviewUrls(urls);
    
    // Cleanup function to revoke object URLs
    return () => {
      objectUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error revoking URL:", error);
        }
      });
      objectUrlsRef.current = [];
    };
  }, [images, existingImages, imageSizes]);

  const validateImage = async (file: File): Promise<boolean> => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        t("errors.fileTooLarge", {
          maxSize: "5MB",
          hint: "Try compressing your image or choosing a smaller one.",
        }),
      );
      return false;
    }

    // Check minimum file size
    if (file.size < MIN_FILE_SIZE) {
      toast.error(
        t("errors.fileTooSmall", {
          minSize: "5KB",
          hint: "Try uploading a slightly higher quality photo so it looks great to buyers!",
        }),
      );
      return false;
    }

    // Check file type
    if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
      toast.error(
        t("errors.invalidFileType", {
          formats: "JPG, PNG, or WebP",
          hint: "These formats ensure your images look great everywhere.",
        }),
      );
      return false;
    }

    // Check image dimensions
    try {
      const dimensions = await getImageDimensions(file);
      if (dimensions.width < 200 || dimensions.height < 200) {
        toast.error(
          t("errors.imageTooSmall", {
            minSize: "200×200",
            hint: "Larger images help buyers see more details!",
          }),
        );
        return false;
      }
    } catch (error) {
      toast.error(
        t("errors.invalidImage", {
          hint: "The file might be corrupted. Try another one?",
        }),
      );
      return false;
    }

    return true;
  };

  const getImageDimensions = (
    file: File,
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const compressImage = async (file: File): Promise<File> => {
    // Calculate target size based on image dimensions to maintain quality
    const dimensions = await getImageDimensions(file);
    const isLargeImage = dimensions.width > 2000 || dimensions.height > 2000;
    const targetSize = isLargeImage ? 1.5 : 1; // Allow larger files for high-res images

    // Don't compress if file is already small enough (less than 300KB)
    if (file.size < 300 * 1024) {
      console.log("Image already small enough, skipping compression");
      return file;
    }

    // Determine optimal file type based on browser support and image content
    const fileType = supportsWebP ? "image/webp" : "image/jpeg";

    // Optimize compression options based on image content and size
    const options = {
      maxSizeMB: targetSize,
      maxWidthOrHeight: RESPONSIVE_SIZES.original,
      useWebWorker: true,
      fileType,
      initialQuality: 0.92, // Higher quality for better visual results
      alwaysKeepResolution: true, // Preserve resolution
      exifOrientation: await getExifOrientation(file), // Preserve orientation metadata
    };

    try {
      console.log(
        "Compressing image:",
        file.name,
        "Original size:",
        (file.size / 1024).toFixed(2),
        "KB",
      );
      const compressedBlob = await imageCompression(file, options);
      console.log(
        "Compressed size:",
        (compressedBlob.size / 1024).toFixed(2),
        "KB",
      );

      // Update image size in state for display
      const newSizes = { ...imageSizes };
      newSizes[file.name] = compressedBlob.size;
      setImageSizes(newSizes);

      // Use appropriate extension based on compression type
      const fileExt = fileType === "image/webp" ? "webp" : "jpg";
      const fileName = `image-${Date.now()}.${fileExt}`;

      return new File([compressedBlob], fileName, {
        type: fileType,
        lastModified: new Date().getTime(),
      });
    } catch (error) {
      console.error("Error compressing image:", error);
      return file;
    }
  };

  // Get EXIF orientation to preserve correct image orientation
  const getExifOrientation = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const view = new DataView(e.target?.result as ArrayBuffer);
          if (view.getUint16(0, false) !== 0xffd8) {
            resolve(1); // Not a JPEG
            return;
          }

          const length = view.byteLength;
          let offset = 2;

          while (offset < length) {
            const marker = view.getUint16(offset, false);
            offset += 2;

            if (marker === 0xffe1) {
              if (view.getUint32(offset + 2, false) !== 0x45786966) {
                resolve(1);
                return;
              }

              const little = view.getUint16(offset + 10, false) === 0x4949;
              offset += 12;
              const tags = view.getUint16(offset, little);
              offset += 2;

              for (let i = 0; i < tags; i++) {
                if (view.getUint16(offset + i * 12, little) === 0x0112) {
                  resolve(view.getUint16(offset + i * 12 + 8, little));
                  return;
                }
              }
            } else if ((marker & 0xff00) !== 0xff00) {
              break;
            } else {
              offset += view.getUint16(offset, false);
            }
          }
          resolve(1); // Default orientation
        };
        reader.readAsArrayBuffer(file.slice(0, 64 * 1024)); // Read only first 64KB for efficiency
      } catch (error) {
        console.error("Error reading EXIF data:", error);
        resolve(1); // Default orientation on error
      }
    });
  };

  const checkWebPSupport = async (): Promise<boolean> => {
    // More reliable WebP detection that checks for actual encoding support
    if (!self.createImageBitmap) return false;

    const webpData =
      "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
    const blob = await fetch(webpData).then((r) => r.blob());

    try {
      return await createImageBitmap(blob).then(
        () => true,
        () => false,
      );
    } catch (e) {
      return false;
    }
  };

  const handleImageUpload = async (files: File[]) => {
    // Filter out duplicate files by name and size
    const uniqueNewFiles = files.filter(
      (file, index, self) =>
        index ===
        self.findIndex(
          (f) =>
            f.name === file.name &&
            f.size === file.size &&
            f.lastModified === file.lastModified
        )
    );

    // Filter out files that already exist in the current images
    const existingFileNames = new Set(images.map((img) => img.name));
    const newFiles = uniqueNewFiles.filter(
      (file) => !existingFileNames.has(file.name)
    );

    if (newFiles.length === 0) {
      toast.info(t("errors.duplicateFiles"));
      return;
    }

    if (images.length + existingImages.length + newFiles.length > maxImages) {
      toast.error(t("errors.maxImagesExceeded", { count: maxImages }));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const validFiles = [];
      let processedCount = 0;
      const newSizes = { ...imageSizes };

      // Process only the new, unique files
      for (const file of newFiles) {
        try {
          // Store original size for display
          newSizes[file.name] = file.size;

          const isValid = await validateImage(file);
          if (!isValid) continue;

          // Analyze image to determine optimal compression strategy
          const dimensions = await getImageDimensions(file);
          const aspectRatio = dimensions.width / dimensions.height;

          // Determine if image needs cropping based on aspect ratio
          const needsCropping =
            aspectRatio > 2.5 || // Too wide
            aspectRatio < 0.4 || // Too tall
            dimensions.width < 200 || // Too narrow
            dimensions.height < 200; // Too short

          if (needsCropping) {
            toast.info(
              t("info.imageCropRecommended", {
                hint: "This image has unusual proportions. Consider cropping for better display.",
              }),
            );
          }


          const compressed = await compressImage(file);
          // Generate a unique ID for the file
          const fileWithId = Object.assign(compressed, { 
            uid: generateUniqueId('file-')
          });
          validFiles.push(fileWithId);

          // Update size for compressed file
          newSizes[compressed.name] = compressed.size;
        } catch (compressionError) {
          console.error(
            "Compression failed, using original file:",
            compressionError,
          );
          validFiles.push(file); // Use original if compression fails
        }

        processedCount++;
        setUploadProgress((processedCount / newFiles.length) * 100);
      }

      // Update file sizes state
      setImageSizes(newSizes);

      if (validFiles.length > 0) {
        // Create a copy of the images array to avoid reference issues
        const newImages = [...images, ...validFiles];
        
        // Ensure unique images based on name and lastModified
        const uniqueNewImages = Array.from(
          new Map(newImages.map((file) => [file.name + file.lastModified, file])).values()
        );
        
        onChange(uniqueNewImages);
        toast.success(t("images.upload_success"));
      }
    } catch (error) {
      toast.error(t("upload.uploadFailed"));
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Function to ensure image IDs are unique
  const ensureUniqueIds = useCallback((images: UnifiedImage[]) => {
    // Clear the used IDs set
    const usedIds = new Set<string>();
    
    // Check for and fix duplicate IDs
    return images.map(img => {
      let id = img.id;
      
      // If this ID is already used, generate a new one
      if (usedIds.has(id)) {
        const prefix = img.type === 'file' ? 'file' : 'existing';
        id = `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Update the image with the new ID
        return { ...img, id };
      }
      
      // Mark this ID as used
      usedIds.add(id);
      return img;
    });
  }, []);
  
  // Debounced state update to prevent rapid changes that can cause duplication
  const debouncedSetUnifiedImages = useCallback(
    (newImages: UnifiedImage[]) => {
      // Use a stable reference to the new array
      const uniqueImages = ensureUniqueIds([...newImages]);
      setUnifiedImages(uniqueImages);
    },
    []
  );
  
  // Simple array move helper that maintains references
  const arrayMove = useCallback(<T,>(array: T[], from: number, to: number): T[] => {
    const newArray = array.slice();
    const [removed] = newArray.splice(from, 1);
    newArray.splice(to, 0, removed);
    return newArray;
  }, []);

  // Unified move image function that handles all image types consistently
  const moveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      // Validate indices
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= unifiedImages.length ||
        toIndex >= unifiedImages.length
      ) {
        return;
      }
      // Get the moving image
      const movingImage = unifiedImages[fromIndex];
      if (!movingImage) return;

      // Create a new array with the moved image
      const newUnifiedImages = unifiedImages.filter((_, i) => i !== fromIndex);
      newUnifiedImages.splice(toIndex, 0, movingImage);

      // Update state with the new array
      setUnifiedImages(newUnifiedImages);

      // Update parent components based on image type
      if (movingImage.type === 'file') {
        // Update files array maintaining references
        const newFiles = images.slice();
        const fileIndex = newFiles.findIndex(f => {
          const fileId = `${f.name}-${f.size}-${f.lastModified}`;
          return fileId === movingImage.id;
        });
        if (fileIndex !== -1) {
          const [movedFile] = newFiles.splice(fileIndex, 1);
          newFiles.splice(toIndex, 0, movedFile);
          onChange(newFiles);
        }
      } else if (movingImage.isExisting && onReorderExisting) {
        // Handle existing image reordering
        onReorderExisting(fromIndex, toIndex);
      }

      // Update preview URLs maintaining references
      const newPreviewUrls = newUnifiedImages
        .filter(img => img.type === 'file')
        .map(img => img.src);
      setPreviewUrls(newPreviewUrls);
    },
    [unifiedImages, onChange, onReorderExisting, arrayMove]
  );

  const handleImageDelete = (index: number) => {
    // Get the image to delete
    const imageToDelete = unifiedImages[index];
    
    if (!imageToDelete) return;
    
    // Create a new array without the deleted image
    const newUnifiedImages = unifiedImages.filter((_, i) => i !== index);
    setUnifiedImages(newUnifiedImages);
    
    // Handle based on the image type
    if (imageToDelete.type === 'file') {
      // Only revoke if it's a blob URL we created
      if (imageToDelete.src && imageToDelete.src.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(imageToDelete.src);
          // Remove from our ref array
          objectUrlsRef.current = objectUrlsRef.current.filter(url => url !== imageToDelete.src);
        } catch (error) {
          console.error("Error revoking URL:", error);
        }
      }
      
      // Update the parent component
      const newImages = images.filter((_, i) => {
        // Find the corresponding index in the original images array
        const fileIndex = unifiedImages.findIndex(img => 
          img.type === 'file' && img.data === images[i]
        );
        return fileIndex !== index;
      });
      onChange(newImages);
      
      // Update preview URLs
      const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
      setPreviewUrls(newPreviewUrls);
    } else if (imageToDelete.isExisting) {
      // Handle existing image deletion
      if (onDeleteExisting) {
        onDeleteExisting(imageToDelete.data as string);
      }
    }
  };

  const handleImageEdit = (index: number, url: string) => {
    setEditingImage({ url, index });
  };

  const handleEditSave = async (editedBlob: Blob) => {
    if (editingImage === null) return;

    try {
      // Create a more descriptive filename with timestamp
      const newFile = new File([editedBlob], `edited-image-${Date.now()}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      // Create a deep copy of the images array to avoid reference issues
      const newImages = [...images];
      newImages[editingImage.index] = newFile;

      // Revoke the old URL if it exists
      if (
        previewUrls[editingImage.index] &&
        previewUrls[editingImage.index].startsWith("blob:")
      ) {
        try {
          URL.revokeObjectURL(previewUrls[editingImage.index]);
        } catch (error) {
          console.error("Error revoking URL:", error);
        }
      }

      onChange(newImages);
      setEditingImage(null);
    } catch (error) {
      console.error("Error saving edited image:", error);
      toast.error(t("upload.uploadFailed"));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ALLOWED_TYPES,
    multiple: true,
    disabled: isUploading,
    onDrop: handleImageUpload,
    maxSize: MAX_FILE_SIZE,
  });

  // Use the appropriate backend for drag and drop functionality
  const Backend = isMobile ? TouchBackend : HTML5Backend;
  
  return (
    <DndProvider backend={Backend} options={{ enableMouseEvents: true }}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">{t("images.title")}</h3>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-blue-500 bg-blue-50/80 dark:bg-blue-900/20"
              : "border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500"
          }`}
        >
          <motion.div
            animate={{
              scale: isDragActive ? 1.02 : 1,
              borderColor: isDragActive ? "#3B82F6" : "#E5E7EB",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full w-full"
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ scale: isDragActive ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <FaImage className="mx-auto h-12 w-12 text-gray-400" />
            </motion.div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-2">
              {t("images.dragDropFriendly")}
            </p>
          </motion.div>
        </div>

        {/* Image Count */}
        <p className="text-xs text-gray-500 mt-1">
          {t("images.uploaded")} ({images.length + existingImages.length} /{" "}
          {maxImages})
        </p>

        {/* Upload Progress */}
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative pt-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-600">
                  {t("images.progress", {
                    current: Math.round(uploadProgress),
                    total: 100,
                    hint: "Almost there! Your photos are being optimized...",
                  })}
                </span>
                <FaSpinner className="animate-spin text-blue-600" />
              </div>
            </div>
            <div className="overflow-hidden h-3 mt-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg"
              />
            </div>
          </motion.div>
        )}

        {/* Unified Image Gallery with Drag and Drop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          <AnimatePresence>
            {unifiedImages.map((image, index) => {
              // Use the image's key property for stable rendering
              const stableKey = image.key || image.id;
              
              return (
                <DraggableImage
                  key={stableKey}
                  uid={stableKey}
                  url={image.src}
                  index={index}
                  moveImage={moveImage}
                  onDelete={() => handleImageDelete(index)}
                  onEdit={(url, _) => {
                    // For existing images, we need to handle editing differently
                    if (image.type === 'file') {
                      const fileIndex = images.findIndex(f => f === image.data);
                      handleImageEdit(fileIndex, url);
                    } else {
                      // For existing images, we might need to convert to a file first
                      // This is handled in the edit save function
                      setEditingImage({ url, index });
                    }
                  }}
                  isUploading={isUploading}
                  isExisting={image.isExisting}
                  fileSize={image.metadata?.fileSize}
                  dimensions={image.metadata?.dimensions}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Image Editor Modal */}
        <AnimatePresence>
          {editingImage && (
            <ImageEditor
              imageUrl={editingImage.url}
              onSave={handleEditSave}
              onClose={() => setEditingImage(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
};

export default ImageManager;
