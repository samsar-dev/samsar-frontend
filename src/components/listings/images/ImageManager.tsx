import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from "browser-image-compression";
import { FaTrash, FaImage, FaSpinner, FaEdit } from "react-icons/fa";
import ImageEditor from "./ImageEditor";
import PreloadImages from "@/components/media/PreloadImages";
import ImageFallback from "@/components/common/ImageFallback";

interface ImageManagerProps {
  images: File[];
  onChange: (images: File[]) => void;
  maxImages?: number;
  error?: string;
  existingImages?: string[];
  onDeleteExisting?: (url: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_FILE_SIZE = 5 * 1024; // 5KB
const ALLOWED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const RESPONSIVE_SIZES = {
  thumbnail: 400,  // For thumbnails and previews
  medium: 800,     // For medium-sized displays
  large: 1200,     // For large displays
  original: 1920,  // Maximum width for original images
};

const ImageManager: React.FC<ImageManagerProps> = ({
  images,
  onChange,
  maxImages = 10,
  error,
  existingImages = [],
  onDeleteExisting,
}) => {
  const { t } = useTranslation();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [editingImage, setEditingImage] = useState<{
    url: string;
    index: number;
  } | null>(null);
  const [imageSizes, setImageSizes] = useState<{[key: string]: number}>({});
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

  useEffect(() => {
    // Clean up previous object URLs
    objectUrlsRef.current.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error revoking URL:", error);
      }
    });
    objectUrlsRef.current = [];

    // Create preview URLs for images
    const urls = images.map((file: File) => {
      try {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.push(url);
        return url;
      } catch (error) {
        console.error("Error creating URL for file:", error);
        return "";
      }
    }).filter(Boolean); // Remove any empty strings

    // Log preview URLs for debugging
    console.log('Created preview URLs:', urls);
    setPreviewUrls(urls);

    setPreviewUrls(urls);

    // Cleanup function to revoke object URLs
    return () => {
      objectUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error revoking URL:", error);
        }
      });
      objectUrlsRef.current = [];
    };
  }, [images]);

  const validateImage = async (file: File): Promise<boolean> => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("errors.fileTooLarge", { 
        maxSize: "5MB",
        hint: "Try compressing your image or choosing a smaller one."
      }));
      return false;
    }

    // Check minimum file size
    if (file.size < MIN_FILE_SIZE) {
      toast.error(t("errors.fileTooSmall", {
        minSize: "5KB",
        hint: "Try uploading a slightly higher quality photo so it looks great to buyers!"
      }));
      return false;
    }

    // Check file type
    if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
      toast.error(t("errors.invalidFileType", {
        formats: "JPG, PNG, or WebP",
        hint: "These formats ensure your images look great everywhere."
      }));
      return false;
    }

    // Check image dimensions
    try {
      const dimensions = await getImageDimensions(file);
      if (dimensions.width < 200 || dimensions.height < 200) {
        toast.error(t("errors.imageTooSmall", {
          minSize: "200×200",
          hint: "Larger images help buyers see more details!"
        }));
        return false;
      }
    } catch (error) {
      toast.error(t("errors.invalidImage", {
        hint: "The file might be corrupted. Try another one?"
      }));
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
      console.log('Image already small enough, skipping compression');
      return file;
    }

    // Determine optimal file type based on browser support and image content
    const fileType = supportsWebP ? 'image/webp' : 'image/jpeg';
    
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
      console.log('Compressing image:', file.name, 'Original size:', (file.size / 1024).toFixed(2), 'KB');
      const compressedBlob = await imageCompression(file, options);
      console.log('Compressed size:', (compressedBlob.size / 1024).toFixed(2), 'KB');

      // Update image size in state for display
      const newSizes = {...imageSizes};
      newSizes[file.name] = compressedBlob.size;
      setImageSizes(newSizes);

      // Use appropriate extension based on compression type
      const fileExt = fileType === 'image/webp' ? 'webp' : 'jpg';
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
          if (view.getUint16(0, false) !== 0xFFD8) {
            resolve(1); // Not a JPEG
            return;
          }
          
          const length = view.byteLength;
          let offset = 2;
          
          while (offset < length) {
            const marker = view.getUint16(offset, false);
            offset += 2;
            
            if (marker === 0xFFE1) {
              if (view.getUint32(offset + 2, false) !== 0x45786966) {
                resolve(1);
                return;
              }
              
              const little = view.getUint16(offset + 10, false) === 0x4949;
              offset += 12;
              const tags = view.getUint16(offset, little);
              offset += 2;
              
              for (let i = 0; i < tags; i++) {
                if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                  resolve(view.getUint16(offset + (i * 12) + 8, little));
                  return;
                }
              }
            } else if ((marker & 0xFF00) !== 0xFF00) {
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
    
    const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    const blob = await fetch(webpData).then(r => r.blob());
    
    try {
      return await createImageBitmap(blob).then(() => true, () => false);
    } catch (e) {
      return false;
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (images.length + existingImages.length + files.length > maxImages) {
      toast.error(t("errors.maxImagesExceeded", { count: maxImages }));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const validFiles = [];
      let processedCount = 0;
      const newSizes = {...imageSizes};
      
      for (const file of files) {
        // Store original size for display
        newSizes[file.name] = file.size;
        
        const isValid = await validateImage(file);
        if (isValid) {
          try {
            // Analyze image to determine optimal compression strategy
            const dimensions = await getImageDimensions(file);
            const aspectRatio = dimensions.width / dimensions.height;
            
            // Determine if image needs cropping based on aspect ratio
            const needsCropping = (
              aspectRatio > 2.5 || // Too wide
              aspectRatio < 0.4 || // Too tall
              dimensions.width < 200 || // Too narrow
              dimensions.height < 200 // Too short
            );
            
            if (needsCropping) {
              toast.info(t("info.imageCropRecommended", {
                hint: "This image has unusual proportions. Consider cropping for better display."
              }));
            }
            
            const compressed = await compressImage(file);
            validFiles.push(compressed);
            
            // Update size for compressed file
            newSizes[compressed.name] = compressed.size;
          } catch (compressionError) {
            console.error("Compression failed, using original file:", compressionError);
            validFiles.push(file); // Use original if compression fails
          }
        }
        
        processedCount++;
        setUploadProgress((processedCount / files.length) * 100);
      }

      // Update file sizes state
      setImageSizes(newSizes);

      if (validFiles.length > 0) {
        // Create a copy of the images array to avoid reference issues
        const newImages = [...images, ...validFiles];
        onChange(newImages);
        toast.success(t("success.imagesUploaded", {
          count: validFiles.length,
          hint: "Your photos are looking great! ✨"
        }));
      }
    } catch (error) {
      toast.error(t("errors.uploadFailed"));
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageDelete = (index: number) => {
    // Only revoke if it's a blob URL we created
    const url = previewUrls[index];
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error revoking URL:", error);
      }
    }
    
    // Create a new array without the deleted image
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
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
        lastModified: Date.now()
      });

      // Create a deep copy of the images array to avoid reference issues
      const newImages = [...images];
      newImages[editingImage.index] = newFile;
      
      // Revoke the old URL if it exists
      if (previewUrls[editingImage.index] && previewUrls[editingImage.index].startsWith('blob:')) {
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
      toast.error(t("errors.editFailed"));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ALLOWED_TYPES,
    multiple: true,
    disabled: isUploading,
    onDrop: handleImageUpload,
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">{t("upload_images")}</h3>

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
            borderColor: isDragActive ? '#3B82F6' : '#E5E7EB'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="h-full w-full"
        >
          <input {...getInputProps()} />
          <motion.div
            animate={{ scale: isDragActive ? 1.1 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <FaImage className="mx-auto h-12 w-12 text-gray-400" />
          </motion.div>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mt-2">
            {isDragActive 
              ? t("common.dropzone.drop")
              : t("common.dropzone.dragDropFriendly")}
          </p>
        </motion.div>
      </div>

      {/* Image Count */}
      <p className="text-xs text-gray-500 mt-1">
        {images.length + existingImages.length} / {maxImages} {t("images.uploaded")}
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
                {t("upload.progress", {
                  current: Math.round(uploadProgress),
                  total: 100,
                  hint: "Almost there! Your photos are being optimized..."
                })}
              </span>
              <FaSpinner className="animate-spin text-blue-600" />
            </div>
          </div>
          <div className="overflow-hidden h-3 mt-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg"
            />
          </div>
        </motion.div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("listings.existingImages")} ({existingImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {existingImages.map((url, index) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative pt-[75%] group"
                >
                  {/* Preload the first existing image for LCP */}
                  {index === 0 && url && <PreloadImages imageUrls={[url]} />}
                  <ImageFallback
                    src={url}
                    alt={`Existing ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-contain bg-gray-100 dark:bg-gray-900 rounded-lg"
                    loading="lazy"
                    onError={() => {
                      // Handle error if needed
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleImageEdit(index, url)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors duration-200"
                      title={t("edit")}
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteExisting?.(url)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors duration-200"
                      title={t("delete")}
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* New Images Preview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        <AnimatePresence>
          {previewUrls.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative pt-[75%] group"
            >
              {/* Preload the first preview image for LCP */}
              {index === 0 && url && <PreloadImages imageUrls={[url]} />}
              <div className="absolute inset-0 w-full h-full overflow-hidden rounded-lg">
                <ImageFallback
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e: React.SyntheticEvent) => {
                    console.error('Image error:', e);
                  }}
                  width={300}
                  height={200}
                />
              </div>
              {/* Display file size */}
              {images[index] && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
                  {(imageSizes[images[index].name] || images[index].size) 
                    ? ((imageSizes[images[index].name] || images[index].size) / 1024).toFixed(1) + " KB"
                    : ""}
                </div>
              )}
              {/* Display image dimensions */}
              {images[index] && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
                  {imageSizes[images[index].name] ? `${Math.sqrt(imageSizes[images[index].name] * 1024 / 0.92)} × ${Math.sqrt(imageSizes[images[index].name] * 1024 / 0.92)}` : ""}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
                <button
                  onClick={() => handleImageEdit(index, url)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors duration-200"
                  title={t("edit")}
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleImageDelete(index)}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors duration-200"
                  title={t("delete")}
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
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
  );
};

export default ImageManager;
