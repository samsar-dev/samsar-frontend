import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  Suspense,
  lazy,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FaImage } from "@react-icons/all-files/fa/FaImage";
import { FaSpinner } from "@react-icons/all-files/fa/FaSpinner";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { FaEdit } from "@react-icons/all-files/fa/FaEdit";

import { useDragDrop, useFileDropZone } from "@/utils/dragDropUtils";
import { compressImage, validateImageFile } from "@/utils/imageUtils";
const ImageEditor = lazy(() => import("@/components/listings/images/ImageEditor"));

// Lightweight drag and drop implementation without react-dnd


// Define a unified image type
interface UnifiedImage {
  id: string;
  type: "file" | "url";
  src: string;
  data: File | string;
  isExisting: boolean;
  key?: string;
  metadata?: {
    fileSize?: string;
    dimensions?: string;
  };
  fileSize?: string;
  dimensions?: string;
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
  "image/gif": [".gif"],
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
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [editingImage, setEditingImage] = useState<{ url: string; index: number } | null>(null);
  const [_editedImage, _setEditedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine existing images and new uploads
  const allImages = useMemo(() => {
    const existingUnified: UnifiedImage[] = existingImages.map((url, index) => ({
      id: `existing-${index}`,
      type: "url" as const,
      src: url,
      data: url,
      isExisting: true,
      key: `existing-${index}`,
    }));

    const newUnified: UnifiedImage[] = images.map((file, index) => ({
      id: `new-${index}`,
      type: "file" as const,
      src: URL.createObjectURL(file),
      data: file,
      isExisting: false,
      key: `new-${index}`,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    }));

    return [...existingUnified, ...newUnified];
  }, [existingImages, images]);

  const { state: dragState, handlers: dragHandlers } = useDragDrop(allImages, {
    onDragStart: (index: number, _data: any) => {
      // Store the current state for onDrop
      const fromImage = allImages[index];
      const toImage = allImages[index];

      // Store the data needed for reordering
      return {
        fromIndex: index,
        fromImage,
        toImage
      };
    },
    onDragEnd: (_index: number, _data: any) => {
      // Reset any drag state
      return null;
    },
    onDrop: (_fromIndex: number, _toIndex: number, data: any) => {
      const fromImage = data?.fromImage;
      const toImage = data?.toImage;

      if (!fromImage || !toImage) return;

      if (fromImage.isExisting && toImage.isExisting && onReorderExisting) {
        const existingFromIndex = existingImages.indexOf(fromImage.data as string);
        const existingToIndex = existingImages.indexOf(toImage.data as string);
        onReorderExisting(existingFromIndex, existingToIndex);
      } else if (!fromImage.isExisting && !toImage.isExisting) {
        const newImages = [...images];
        const fromImageIndex = images.findIndex(img => URL.createObjectURL(img) === fromImage.src);
        const toImageIndex = images.findIndex(img => URL.createObjectURL(img) === toImage.src);
        
        if (fromImageIndex !== -1 && toImageIndex !== -1) {
          const [movedImage] = newImages.splice(fromImageIndex, 1);
          newImages.splice(toImageIndex, 0, movedImage);
          onChange(newImages);
        }
      }
    }
  });

  const handleDragStart = dragHandlers.handleDragStart;
  const handleDragOver = dragHandlers.handleDragOver;
  const handleDrop = useCallback((_data: any, _index: number) => {
    // No-op
  }, []);

  const handleDragEnd = dragHandlers.handleDragEnd;

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (allImages.length + files.length > maxImages) {
      toast.error(t("imageManager.errors.tooManyImages", { max: maxImages }));
      return;
    }

    setIsUploading(true);
    const validFiles: File[] = [];

    for (const file of files) {
      const { isValid, errors } = await validateImageFile(file, {
        maxSize: MAX_FILE_SIZE,
        minSize: MIN_FILE_SIZE,
        allowedTypes: Object.keys(ALLOWED_TYPES)
      });
      
      if (!isValid) {
        toast.error(`${file.name}: ${errors.join(', ')}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setIsUploading(false);
      return;
    }

    try {
      const compressedFiles: File[] = [];
      
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadProgress(prev => ({ ...prev, [file.name]: 50 }));
        
        const compressedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8
        });
        compressedFiles.push(compressedFile);
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      onChange([...images, ...compressedFiles]);
      toast.success(t("imageManager.success.uploaded", { count: compressedFiles.length }));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("imageManager.errors.uploadFailed"));
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  }, [allImages.length, maxImages, images, onChange, t]);

  const { dropZoneProps, isDragActive, isDragReject } = useFileDropZone(
    handleFileUpload,
    {
      accept: Object.keys(ALLOWED_TYPES),
      maxFiles: maxImages - allImages.length,
      maxSize: MAX_FILE_SIZE,
      minSize: MIN_FILE_SIZE,
    }
  );

  const getRootProps = () => dropZoneProps;
  const getInputProps = () => ({
    type: 'file' as const,
    multiple: true,
    accept: Object.keys(ALLOWED_TYPES).join(','),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFileUpload(files);
      e.target.value = '';
    },
  });

  const handleDelete = useCallback((index: number) => {
    const image = allImages[index];
    if (image.isExisting && onDeleteExisting) {
      onDeleteExisting(image.data as string);
    } else {
      const newImages = images.filter((_, i) => {
        const imageIndex = images.findIndex(img => URL.createObjectURL(img) === image.src);
        return i !== imageIndex;
      });
      onChange(newImages);
    }
  }, [allImages, images, onChange, onDeleteExisting]);

  const handleEdit = useCallback((url: string, index: number) => {
    setEditingImage({ url, index });
    setIsEditing(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setIsEditing(false);
    setEditingImage(null);
  }, []);

  const handleEditSave = useCallback((editedBlob: Blob) => {
    if (!editingImage) return;

    try {
      const file = new File([editedBlob], `edited-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      const newImages = [...images];
      const imageIndex = images.findIndex(img => URL.createObjectURL(img) === editingImage.url);
      if (imageIndex !== -1) {
        newImages[imageIndex] = file;
        onChange(newImages);

        setEditingImage(null);
        toast.success(t("imageManager.success.edited"));
      }
    } catch (error) {
      console.error("Edit save error:", error);
      toast.error(t("imageManager.errors.editFailed"));
      setEditingImage(null);
    }
  }, [editingImage, allImages, images, onChange, t]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        onClick={(e) => {
          e.stopPropagation();
          if (allImages.length < maxImages) {
            fileInputRef.current?.click();
          }
        }}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive
            ? isDragReject
              ? "border-red-400 bg-red-50"
              : "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
          }
          ${allImages.length >= maxImages ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} className="hidden" />
        <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          {(() => {
            const text = t("imageManager.dropzone.placeholder");
            return text.includes("imageManager.dropzone.placeholder") ? "اسحب وأفلت الصور هنا" : text;
          })()}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Image Editor Modal */}
      {isEditing && editingImage && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        }>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold mb-4">Edit Image</h2>
                <ImageEditor
                  imageUrl={editingImage.url}
                  onSave={handleEditSave}
                  onClose={handleEditClose}
                />
              </div>
            </div>
          </div>
        </Suspense>
      )}

      {/* Images Grid */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allImages.map((image, index) => (
            <div
              key={image.key}
              draggable
              onDragStart={(e) => handleDragStart(e, index, image)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={(e) => handleDragEnd(e, index, image)}
              className={`
                relative group rounded-lg overflow-hidden border-2 transition-all cursor-move
                ${dragState.dragIndex === index ? "opacity-50 scale-95" : ""}
                ${dragState.hoverIndex === index ? "border-blue-400 scale-105" : "border-gray-200"}
                ${image.isExisting ? "ring-2 ring-green-200" : ""}
              `}
            >
              <div className="aspect-square">
                <img
                  src={image.src}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Upload Progress */}
              {isUploading && uploadProgress[image.id] && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <FaSpinner className="animate-spin mx-auto mb-2" />
                    <p className="text-sm">{uploadProgress[image.id]}%</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 flex justify-between p-2 text-white">
                {/* Edit Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(image.src, index);
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-10 rounded"
                  title="Edit"
                >
                  <FaEdit className="h-4 w-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-10 rounded"
                  title="Delete"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <div className="text-white text-xs">
                  {image.isExisting && (
                    <span className="inline-block bg-green-600 px-1 py-0.5 rounded text-xs mb-1">
                      {t("imageManager.labels.existing")}
                    </span>
                  )}
                  {image.fileSize && (
                    <p className="truncate">{image.fileSize}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple Image Editor Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">{t("imageManager.editor.title")}</h3>
            </div>
            <div className="p-4">
              <img
                src={editingImage.url}
                alt="Edit"
                className="max-w-full max-h-96 mx-auto"
              />
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingImage(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                {t("imageManager.buttons.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Simple save - convert current image to blob
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                      if (blob) handleEditSave(blob);
                    }, 'image/jpeg', 0.9);
                  };
                  img.src = editingImage.url;
                }}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                {t("imageManager.buttons.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ImageManager };