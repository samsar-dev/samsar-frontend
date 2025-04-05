import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from "browser-image-compression";
import { FaTrash, FaImage, FaSpinner } from "react-icons/fa";

interface ImageManagerProps {
  images: File[];
  onChange: (images: File[]) => void;
  maxImages?: number;
  error?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const ImageManager: React.FC<ImageManagerProps> = ({
  images,
  onChange,
  maxImages = 10,
  error,
}) => {
  const { t } = useTranslation();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    // Create preview URLs for images
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Cleanup function to revoke object URLs
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const validateImage = async (file: File): Promise<boolean> => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("errors.fileTooLarge", { maxSize: "5MB" }));
      return false;
    }

    // Check file type
    if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
      toast.error(t("errors.invalidFileType"));
      return false;
    }

    // Check image dimensions
    try {
      const dimensions = await getImageDimensions(file);
      if (dimensions.width < 200 || dimensions.height < 200) {
        toast.error(t("errors.imageTooSmall"));
        return false;
      }
    } catch (error) {
      toast.error(t("errors.invalidImage"));
      return false;
    }

    return true;
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type as "image/jpeg" | "image/png" | "image/webp",
      initialQuality: 0.8,
    };
    
    try {
      const compressedBlob = await imageCompression(file, options);
      return new File([compressedBlob], file.name, { 
        type: compressedBlob.type || file.type,
        lastModified: new Date().getTime()
      });
    } catch (error) {
      console.error("Error compressing image:", error);
      return file;
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      toast.error(t("errors.maxImagesExceeded", { count: maxImages }));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const validFiles = [];
      for (const file of files) {
        const isValid = await validateImage(file);
        if (isValid) {
          const compressed = await compressImage(file);
          validFiles.push(compressed);
        }
        setUploadProgress((prev) => Math.min(prev + (100 / files.length), 100));
      }

      if (validFiles.length > 0) {
        const newImages = [...images, ...validFiles];
        onChange(newImages);
        toast.success(t("success.imagesUploaded"));
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
    URL.revokeObjectURL(previewUrls[index]);
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
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
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500"
        }`}
      >
        <input {...getInputProps()} />
        <FaImage className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {isDragActive
            ? t("dropzone.drop")
            : t("dropzone.dragDrop")}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("dropzone.maxSize", { size: "5MB" })}
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="relative pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-blue-600">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <FaSpinner className="animate-spin text-blue-600" />
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            />
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        <AnimatePresence>
          {previewUrls.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group aspect-square"
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-2">
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
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default ImageManager;
