import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

interface ImageGalleryProps {
  images?: (string | File)[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  console.log('ImageGallery received images:', images);

  const imageUrls = images
    .filter(image => {
      console.log('Filtering image:', image);
      return image !== null && image !== undefined;
    })
    .map(image => {
      console.log('Processing image:', image);
      if (typeof image === 'string') {
        console.log('Image is string URL:', image);
        return image;
      }
      if (image instanceof File) {
        console.log('Image is File object');
        return URL.createObjectURL(image);
      }
      if (image && typeof image === 'object' && 'url' in image) {
        console.log('Image is object with url:', image.url);
        return image.url;
      }
      console.log('Invalid image format:', image);
      return '';
    })
    .filter(url => {
      console.log('Filtering URL:', url);
      return Boolean(url);
    });

  console.log('Final processed imageUrls:', imageUrls);

  useEffect(() => {
    if (selectedImage !== null && selectedImage >= imageUrls.length) {
      setSelectedImage(null);
    }
  }, [imageUrls.length, selectedImage]);

  const handlePrevious = () => {
    setSelectedImage(current => 
      current === null || current === 0 ? imageUrls.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    setSelectedImage(current => 
      current === null || current === imageUrls.length - 1 ? 0 : current + 1
    );
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  return (
    <div className="relative">
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {imageUrls.map((url, index) => (
          <div
            key={index}
            className="relative pt-[75%] cursor-pointer rounded-lg overflow-hidden group"
            onClick={() => setSelectedImage(index)}
          >
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="absolute inset-0 w-full h-full object-contain bg-gray-100 dark:bg-gray-900 transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
                e.currentTarget.onerror = null;
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200" />
          </div>
        ))}
      </div>

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
  );
};

export default ImageGallery;
