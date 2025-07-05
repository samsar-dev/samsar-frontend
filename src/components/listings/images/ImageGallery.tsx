import React, { useState, useEffect } from "react";
import ImageFallback from "@/components/media/ImageFallback";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

type ImageType = string | File | { url: string };

interface ImageGalleryProps {
  images?: ImageType[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previousImageIndex, setPreviousImageIndex] = useState<number | null>(null);

  // Simplified image URL extraction
  const imageUrls = React.useMemo(() => {
    return images
      .map((image) => {
        if (typeof image === "string") return image;
        if (image instanceof File) return URL.createObjectURL(image);
        if (image && typeof image === "object" && "url" in image) return image.url;
        return "";
      })
      .filter(Boolean);
  }, [images]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (isLoading || selectedImage === null) return;
    
    setIsLoading(true);
    const current = selectedImage;
    const newIndex = direction === 'next' 
      ? (current === imageUrls.length - 1 ? 0 : current + 1)
      : (current === 0 ? imageUrls.length - 1 : current - 1);
    
    setPreviousImageIndex(current);
    
    // Preload the next/previous image
    const img = new window.Image();
    img.src = imageUrls[newIndex];
    img.onload = () => {
      setSelectedImage(newIndex);
      setTimeout(() => {
        setIsLoading(false);
        setPreviousImageIndex(null);
      }, 200);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setPreviousImageIndex(null);
    };
  };

  const handlePrevious = () => navigateImage('prev');
  const handleNext = () => navigateImage('next');
  const handleClose = () => setSelectedImage(null);
  const handleThumbnailClick = (index: number) => {
    if (index !== selectedImage) {
      setPreviousImageIndex(selectedImage);
      setSelectedImage(index);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-0">
      {/* Main Image */}
      <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-md bg-gray-100 dark:bg-gray-800">
        <button
          className="w-full h-full flex items-center justify-center"
          onClick={() => setSelectedImage(0)}
          tabIndex={0}
          style={{ minHeight: 300, maxHeight: 400 }}
        >
          <ImageFallback
            src={imageUrls[0] || ''}
            alt="Main Image"
            className="object-contain w-auto max-w-full h-[300px] sm:h-[350px] md:h-[400px] hover:scale-105 transition-transform duration-300 cursor-pointer"
            width={800}
            height={600}
            priority={true}
            quality={85}
            sizes="(max-width: 768px) 100vw, 75vw"
          />
        </button>
      </div>

      {/* Thumbnails Carousel */}
      {imageUrls.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto w-full justify-center scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2">
          {imageUrls.map((url, idx) => (
            <button
              key={idx}
              className={`border-2 ${selectedImage === idx ? "border-blue-500" : "border-transparent"} rounded-lg focus:outline-none transition-shadow duration-200 bg-white dark:bg-gray-800 flex-shrink-0`}
              style={{ width: 72, height: 72 }}
              onClick={() => handleThumbnailClick(idx)}
              tabIndex={0}
            >
              <ImageFallback
                src={url}
                alt={`Thumbnail ${idx + 1}`}
                className="object-cover w-full h-full rounded-lg"
                width={72}
                height={72}
                quality={60}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={handleClose}
          >
            {/* Background overlay */}
            <div className="absolute inset-0 bg-black/90" />

            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-20 p-2 bg-black/50 rounded-full"
              onClick={handleClose}
            >
              <FaTimes size={24} />
            </button>

            {/* Navigation buttons */}
            <button
              className={`absolute left-4 text-white hover:text-gray-300 z-20 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              disabled={isLoading}
            >
              <FaChevronLeft size={24} />
            </button>

            <button
              className={`absolute right-4 text-white hover:text-gray-300 z-20 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              disabled={isLoading}
            >
              <FaChevronRight size={24} />
            </button>

            {/* Image container */}
            <div className="relative w-full h-full max-w-6xl mx-auto flex items-center justify-center">
              {/* Previous image (fading out) */}
              {previousImageIndex !== null && previousImageIndex !== selectedImage && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={imageUrls[previousImageIndex]}
                    alt="Previous image"
                    className="max-h-[90vh] max-w-full w-auto h-auto object-contain"
                  />
                </motion.div>
              )}
              
              {/* Current image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isLoading ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <ImageFallback
                    src={imageUrls[selectedImage]}
                    alt={`Image ${selectedImage + 1}`}
                    className="max-h-[90vh] max-w-full w-auto h-auto object-contain"
                    width={1200}
                    height={900}
                    quality={90}
                    priority={true}
                    sizes="(max-width: 768px) 100vw, 90vw"
                    onLoad={() => setIsLoading(false)}
                  />
                </motion.div>
                
                {/* Loading spinner */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImage + 1} / {imageUrls.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGallery;
