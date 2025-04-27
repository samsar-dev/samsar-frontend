import React, { useState, useEffect } from "react";
import PreloadImages from '@/components/common/PreloadImages';
import ResponsiveImage from '@/components/common/ResponsiveImage';
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

// Updated type to handle different image formats
type ImageType = string | File | { url: string };

interface ImageGalleryProps {
  images?: ImageType[];
}


const ImageGallery: React.FC<ImageGalleryProps> = ({ images = [] }) => {
  // For carousel animation direction: 1 for next, -1 for previous
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

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

  useEffect(() => {
    // Clean up object URLs to prevent memory leaks
    return () => {
      imageUrls.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  useEffect(() => {
    if (selectedImage !== null && selectedImage >= imageUrls.length) {
      setSelectedImage(null);
    }
  }, [imageUrls.length, selectedImage]);

  const handlePrevious = () => {
    setDirection(-1);
    setSelectedImage((current) =>
      current === null || current === 0 ? imageUrls.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setSelectedImage((current) =>
      current === null || current === imageUrls.length - 1 ? 0 : current + 1
    );
  };

  // CarouselImage component for animated sliding
  interface CarouselImageProps {
    src: string;
    alt: string;
    direction: 1 | -1;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
  }

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const CarouselImage: React.FC<CarouselImageProps> = ({ src, alt, direction, onSwipeLeft, onSwipeRight }) => {
    return (
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={src}
          className="w-full h-full flex items-center justify-center absolute left-0 top-0"
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          custom={direction}
          initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction < 0 ? 300 : -300, opacity: 0 }}
          transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              onSwipeLeft();
            } else if (swipe > swipeConfidenceThreshold) {
              onSwipeRight();
            }
          }}
          tabIndex={0}
        >
          <ResponsiveImage
            src={src}
            alt={alt}
            className="object-contain max-h-[400px] w-auto h-auto"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={true}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
              e.currentTarget.onerror = null;
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  };


  const handleClose = () => {
    setSelectedImage(null);
  };

  // Preload the first image for LCP
  const firstImage = imageUrls[0];

  return (
    <>
      {firstImage && <PreloadImages imageUrls={[firstImage]} />}
      <div className="w-full flex flex-col items-center">
        {/* Main Image */}
        <div className="w-full rounded-2xl overflow-hidden shadow-md bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative select-none" style={{ minHeight: 350, maxHeight: 450 }}>
          {/* Carousel Arrows */}
          {imageUrls.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 dark:bg-gray-900/60 hover:bg-white/90 dark:hover:bg-gray-900/80 rounded-full p-2 shadow focus:outline-none"
                onClick={handlePrevious}
                tabIndex={0}
                type="button"
              >
                <FaChevronLeft size={24} />
              </button>
              <button
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 dark:bg-gray-900/60 hover:bg-white/90 dark:hover:bg-gray-900/80 rounded-full p-2 shadow focus:outline-none"
                onClick={handleNext}
                tabIndex={0}
                type="button"
              >
                <FaChevronRight size={24} />
              </button>
            </>
          )}

          {/* Carousel Main Image with Animation */}
          <div
  onClick={() => {
    if (selectedImage === null) setSelectedImage(0);
  }}
  style={{ cursor: "zoom-in", width: "100%", height: "100%" }}
  tabIndex={0}
  role="button"
  aria-label="Open image fullscreen"
>
  <CarouselImage
    key={selectedImage ?? 0}
    src={imageUrls[selectedImage ?? 0]}
    alt={`Gallery image ${selectedImage ?? 0}`}
    direction={direction}
    onSwipeLeft={handleNext}
    onSwipeRight={handlePrevious}
  />
</div>
        </div>

        {/* Thumbnails Carousel */}
        {imageUrls.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto w-full justify-center scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {imageUrls.map((url, idx) => (
              <button
                key={idx}
                className={`border-2 ${selectedImage === idx ? 'border-blue-500' : 'border-transparent'} rounded-lg focus:outline-none transition-shadow duration-200 bg-white dark:bg-gray-800 flex-shrink-0`}
                style={{ width: 72, height: 72 }}
                onClick={() => setSelectedImage(idx)}
                tabIndex={0}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="object-cover w-full h-full rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg";
                    e.currentTarget.onerror = null;
                  }}
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
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
              onClick={handleClose}
            >
              <div className="relative max-w-7xl mx-auto px-4 w-full h-full flex items-center justify-center">
                <button
                  className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                  onClick={handleClose}
                >
                  <FaTimes size={24} />
                </button>

                <button
                  className="absolute left-4 text-white hover:text-gray-300 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                >
                  <FaChevronLeft size={24} />
                </button>

                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <img
                    src={imageUrls[selectedImage]}
                    alt={`Image ${selectedImage + 1}`}
                    className="max-h-[90vh] max-w-full w-auto h-auto object-contain"
                    onClick={(e) => e.stopPropagation()}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                      e.currentTarget.onerror = null;
                    }}
                  />
                </motion.div>

                <button
                  className="absolute right-4 text-white hover:text-gray-300 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <FaChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ImageGallery;
