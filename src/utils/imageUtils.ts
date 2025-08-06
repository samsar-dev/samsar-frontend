export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * Get image dimensions from file or URL
 */
export const getImageDimensions = (
  src: string | File,
): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;

    if (typeof src === "string") {
      img.src = src;
    } else {
      img.src = URL.createObjectURL(src);
    }
  });
};

/**
 * Compress image file
 */
export const compressImage = async (
  file: File,
  options: CompressOptions = {},
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeMB = 5,
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;

        // Maintain aspect ratio while fitting within max dimensions
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image with new dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            // Check if compressed size is within limit
            const sizeMB = blob.size / 1024 / 1024;
            if (sizeMB > maxSizeMB && quality > 0.1) {
              // Recursively compress with lower quality if still too large
              const lowerQuality = Math.max(0.1, quality - 0.1);
              compressImage(file, { ...options, quality: lowerQuality })
                .then(resolve)
                .catch(reject);
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality,
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Crop image to specified dimensions
 */
export const cropImage = (
  imageUrl: string,
  cropArea: { x: number; y: number; width: number; height: number },
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    img.onload = () => {
      try {
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        ctx.drawImage(
          img,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          cropArea.width,
          cropArea.height,
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to crop image"));
            }
          },
          "image/jpeg",
          0.9,
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
};

/**
 * Resize image to specific dimensions
 */
export const resizeImage = (
  file: File,
  targetWidth: number,
  targetHeight: number,
  quality: number = 0.9,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    img.onload = () => {
      try {
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error("Failed to resize image"));
            }
          },
          file.type,
          quality,
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert image to different format
 */
export const convertImageFormat = (
  file: File,
  targetFormat: "image/jpeg" | "image/png" | "image/webp",
  quality: number = 0.9,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const extension = targetFormat.split("/")[1];
              const fileName = file.name.replace(/\.[^/.]+$/, `.${extension}`);

              const convertedFile = new File([blob], fileName, {
                type: targetFormat,
                lastModified: Date.now(),
              });
              resolve(convertedFile);
            } else {
              reject(new Error("Failed to convert image"));
            }
          },
          targetFormat,
          quality,
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate thumbnail from image
 */
export const generateThumbnail = (
  file: File,
  size: number = 150,
  quality: number = 0.8,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    if (!ctx) {
      reject(new Error("Canvas context not available"));
      return;
    }

    img.onload = () => {
      try {
        // Calculate dimensions for square thumbnail
        const { width, height } = img;
        const minDimension = Math.min(width, height);

        canvas.width = size;
        canvas.height = size;

        // Center the image in the square canvas
        const sourceX = (width - minDimension) / 2;
        const sourceY = (height - minDimension) / 2;

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          minDimension,
          minDimension,
          0,
          0,
          size,
          size,
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], `thumb_${file.name}`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(thumbnailFile);
            } else {
              reject(new Error("Failed to generate thumbnail"));
            }
          },
          "image/jpeg",
          quality,
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (
  file: File,
  options: {
    maxSize?: number;
    minSize?: number;
    allowedTypes?: string[];
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
  } = {},
): Promise<{ isValid: boolean; errors: string[] }> => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    minSize = 1024, // 1KB
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  } = options;

  return new Promise((resolve) => {
    const errors: string[] = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(
        `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    if (file.size < minSize) {
      errors.push(
        `File size ${file.size} bytes is below minimum ${minSize} bytes`,
      );
    }

    // If we need to check dimensions
    if (
      options.maxWidth ||
      options.maxHeight ||
      options.minWidth ||
      options.minHeight
    ) {
      getImageDimensions(file)
        .then(({ width, height }) => {
          if (options.maxWidth && width > options.maxWidth) {
            errors.push(
              `Image width ${width}px exceeds maximum ${options.maxWidth}px`,
            );
          }
          if (options.maxHeight && height > options.maxHeight) {
            errors.push(
              `Image height ${height}px exceeds maximum ${options.maxHeight}px`,
            );
          }
          if (options.minWidth && width < options.minWidth) {
            errors.push(
              `Image width ${width}px is below minimum ${options.minWidth}px`,
            );
          }
          if (options.minHeight && height < options.minHeight) {
            errors.push(
              `Image height ${height}px is below minimum ${options.minHeight}px`,
            );
          }

          resolve({ isValid: errors.length === 0, errors });
        })
        .catch(() => {
          errors.push("Failed to read image dimensions");
          resolve({ isValid: false, errors });
        });
    } else {
      resolve({ isValid: errors.length === 0, errors });
    }
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Format image dimensions for display
 */
export const formatDimensions = (width: number, height: number): string => {
  return `${width} × ${height}`;
};
