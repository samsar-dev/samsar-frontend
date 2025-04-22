import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCrop, FaEraser, FaSave, FaUndo, FaSlidersH } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImage: Blob) => void;
  onClose: () => void;
}

interface BlurRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onClose }) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [blurRegions, setBlurRegions] = useState<BlurRegion[]>([]);
  const [isDrawingBlur, setIsDrawingBlur] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<'crop' | 'blur'>('crop');
  const [blurIntensity, setBlurIntensity] = useState(10);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imageRefCallback = useCallback((node: HTMLImageElement | null) => {
    if (node !== null) {
      imgRef.current = node;
      setImageRef(node);
    }
  }, []);

  // Function to get the scaled coordinates
  const getScaledCoordinates = (clientX: number, clientY: number, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    const scaleX = (originalImage?.width || 0) / rect.width;
    const scaleY = (originalImage?.height || 0) / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Enhanced blur preview with debouncing
  useEffect(() => {
    const updateBlurPreview = () => {
      if (mode !== 'blur' || !originalImage || !previewCanvasRef.current) return;

      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions to match original image
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw original image
      ctx.drawImage(originalImage, 0, 0);

      if (blurRegions.length > 0) {
        // Create temporary canvas for blur effect
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.drawImage(canvas, 0, 0);

        // Apply blur to each region
        blurRegions.forEach(region => {
          if (region.width === 0 || region.height === 0) return;

          ctx.save();
          ctx.beginPath();
          ctx.rect(region.x, region.y, region.width, region.height);
          ctx.closePath();
          ctx.clip();

          // Enhanced blur effect
          ctx.filter = `blur(${blurIntensity}px)`;
          ctx.drawImage(tempCanvas, 0, 0);

          // Add slight darkening effect for better visibility
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.fillRect(region.x, region.y, region.width, region.height);

          ctx.restore();
        });
      }
    };

    const timeoutId = setTimeout(updateBlurPreview, 50); // Debounce time
    return () => clearTimeout(timeoutId);
  }, [mode, originalImage, blurRegions, blurIntensity]);

  // Load and cache the original image
  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous"; // Enable CORS
    img.onload = () => {
      setOriginalImage(img);
      if (!crop) {
        // Set initial crop area to 80% of image
        setCrop({
          unit: '%',
          width: 80,
          height: 80,
          x: 10,
          y: 10
        });
      }
    };
  }, [imageUrl]);

  const onImageLoad = useCallback((image: HTMLImageElement) => {
    setImageRef(image);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'blur' || !imageRef) return;
    
    const coords = getScaledCoordinates(e.clientX, e.clientY, e.currentTarget);
    setStartPoint(coords);
    setIsDrawingBlur(true);
    
    setBlurRegions(prev => [...prev, { 
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0
    }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingBlur || !startPoint || !imageRef) return;

    const coords = getScaledCoordinates(e.clientX, e.clientY, e.currentTarget);
    
    const width = Math.abs(coords.x - startPoint.x);
    const height = Math.abs(coords.y - startPoint.y);
    const x = Math.min(coords.x, startPoint.x);
    const y = Math.min(coords.y, startPoint.y);

    setBlurRegions(prev => {
      const regions = [...prev];
      regions[regions.length - 1] = { x, y, width, height };
      return regions;
    });
  };

  const handleMouseUp = () => {
    if (isDrawingBlur && startPoint) {
      setIsDrawingBlur(false);
      setStartPoint(null);
    }
  };

  const removeLastBlurRegion = () => {
    setBlurRegions(prev => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to original image dimensions
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Draw the original image
    ctx.drawImage(originalImage, 0, 0);

    // Apply crop if in crop mode and crop is completed
    if (mode === 'crop' && completedCrop && imgRef.current) {
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');
      if (!croppedCtx) return;

      // Calculate actual pixel values for crop
      const scaleX = originalImage.width / imgRef.current.width;
      const scaleY = originalImage.height / imgRef.current.height;

      croppedCanvas.width = completedCrop.width * scaleX;
      croppedCanvas.height = completedCrop.height * scaleY;

      croppedCtx.drawImage(
        canvas,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );

      // Update main canvas with cropped image
      canvas.width = croppedCanvas.width;
      canvas.height = croppedCanvas.height;
      ctx.drawImage(croppedCanvas, 0, 0);
    }

    // Apply blur regions
    if (blurRegions.length > 0) {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.drawImage(canvas, 0, 0);

      blurRegions.forEach(region => {
        if (region.width === 0 || region.height === 0) return;

        ctx.save();
        ctx.beginPath();
        ctx.rect(region.x, region.y, region.width, region.height);
        ctx.closePath();
        ctx.clip();

        // Enhanced blur effect
        ctx.filter = `blur(${blurIntensity}px)`;
        ctx.drawImage(tempCanvas, 0, 0);

        // Add slight darkening for better visibility
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(region.x, region.y, region.width, region.height);

        ctx.restore();
      });
    }

    // Convert to blob and save
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onSave(blob);
        }
      },
      'image/jpeg',
      0.95
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setMode('crop')}
              className={`p-2 rounded flex items-center ${mode === 'crop' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              title={t('crop')}
            >
              <FaCrop className="mr-2" />
              <span>{t('crop')}</span>
            </button>
            <button
              onClick={() => setMode('blur')}
              className={`p-2 rounded flex items-center ${mode === 'blur' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              title={t('blur')}
            >
              <FaEraser className="mr-2" />
              <span>{t('blur')}</span>
            </button>
            {mode === 'blur' && (
              <>
                <button
                  onClick={removeLastBlurRegion}
                  className="p-2 rounded flex items-center text-gray-600 hover:bg-gray-100"
                  title={t('undo')}
                >
                  <FaUndo className="mr-2" />
                  <span>{t('undo')}</span>
                </button>
                <div className="flex items-center space-x-2">
                  <FaSlidersH className="text-gray-600" />
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={blurIntensity}
                    onChange={(e) => setBlurIntensity(Number(e.target.value))}
                    className="w-24"
                    title={t('blurIntensity')}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
            >
              <FaSave className="mr-2" />
              {t('save')}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
              title={t('close')}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-auto p-4">
          <div
            className="relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {mode === 'crop' ? (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
              >
                <img
                  ref={imageRefCallback}
                  src={imageUrl}
                  alt="Edit"
                  onLoad={(e) => onImageLoad(e.currentTarget)}
                  className="max-w-full"
                  crossOrigin="anonymous"
                />
              </ReactCrop>
            ) : (
              <div className="relative">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: mode === 'blur' ? 'block' : 'none'
                  }}
                />
                <img
                  src={imageUrl}
                  alt="Edit"
                  ref={imageRefCallback}
                  className="max-w-full"
                  style={{ display: mode === 'blur' ? 'none' : 'block' }}
                  crossOrigin="anonymous"
                />
                {blurRegions.map((region, index) => (
                  <div
                    key={index}
                    className="absolute bg-blue-500 bg-opacity-30 border-2 border-blue-500"
                    style={{
                      left: `${(region.x / (originalImage?.width || 1)) * 100}%`,
                      top: `${(region.y / (originalImage?.height || 1)) * 100}%`,
                      width: `${(region.width / (originalImage?.width || 1)) * 100}%`,
                      height: `${(region.height / (originalImage?.height || 1)) * 100}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageEditor; 