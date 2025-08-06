import React, { useState, useCallback, useEffect, useRef } from "react";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import { FaCrop } from "@react-icons/all-files/fa/FaCrop";
import { FaEraser } from "@react-icons/all-files/fa/FaEraser";
import { FaSave } from "@react-icons/all-files/fa/FaSave";
import { FaUndo } from "@react-icons/all-files/fa/FaUndo";
import { FaSlidersH } from "@react-icons/all-files/fa/FaSlidersH";
import { FaRedo } from "@react-icons/all-files/fa/FaRedo";
import { FaUndoAlt } from "@react-icons/all-files/fa/FaUndoAlt";
import { useTranslation } from "react-i18next";

interface ImageEditorOptimizedProps {
  imageUrl: string;
  onSave: (editedImage: Blob) => void;
  onClose: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BlurRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Filters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  rotation: number;
}

const ImageEditorOptimized: React.FC<ImageEditorOptimizedProps> = ({
  imageUrl,
  onSave,
  onClose,
}) => {
  const { t: _t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<"crop" | "blur" | "filters">("crop");

  // Crop state
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isDrawingCrop, setIsDrawingCrop] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Blur state
  const [blurRegions, setBlurRegions] = useState<BlurRegion[]>([]);
  const [isDrawingBlur, setIsDrawingBlur] = useState(false);
  const [blurStart, setBlurStart] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Filters state
  const [filters, setFilters] = useState<Filters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    rotation: 0,
  });

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  );

  // Initialize image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setOriginalImage(img);
      setIsLoading(false);
      drawCanvas();
    };
    img.onerror = () => {
      console.error("Failed to load image");
      setIsLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw canvas with current state
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !originalImage) return;

    // Set canvas size
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply filters
    ctx.filter = `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturation}%) 
      blur(${filters.blur}px)
    `;

    // Save context for rotation
    ctx.save();

    // Apply rotation
    if (filters.rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((filters.rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Draw image
    ctx.drawImage(originalImage, 0, 0);

    // Restore context
    ctx.restore();

    // Apply blur regions
    blurRegions.forEach((region) => {
      ctx.save();
      ctx.filter = "blur(10px)";
      ctx.drawImage(
        originalImage,
        region.x,
        region.y,
        region.width,
        region.height,
        region.x,
        region.y,
        region.width,
        region.height,
      );
      ctx.restore();
    });

    // Draw crop overlay
    if (cropArea) {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

      // Draw overlay outside crop area
      ctx.fillRect(0, 0, canvas.width, cropArea.y);
      ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
      ctx.fillRect(
        cropArea.x + cropArea.width,
        cropArea.y,
        canvas.width - cropArea.x - cropArea.width,
        cropArea.height,
      );
      ctx.fillRect(
        0,
        cropArea.y + cropArea.height,
        canvas.width,
        canvas.height - cropArea.y - cropArea.height,
      );

      // Draw crop border
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

      ctx.restore();
    }

    // Draw blur regions overlay
    blurRegions.forEach((region) => {
      ctx.save();
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(region.x, region.y, region.width, region.height);
      ctx.restore();
    });
  }, [originalImage, filters, cropArea, blurRegions]);

  // Redraw canvas when state changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Cache canvas measurements to prevent forced reflows
  const canvasMeasurements = useRef<{
    rect?: DOMRect;
    scaleX?: number;
    scaleY?: number;
  }>({});

  // Reset measurements when image loads or canvas changes
  useEffect(() => {
    canvasMeasurements.current = {};
  }, [imageUrl]);

  // Update measurements on window resize
  useEffect(() => {
    const handleResize = () => {
      canvasMeasurements.current = {};
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse event handlers for crop - optimized to prevent forced reflows
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Cache measurements to avoid repeated getBoundingClientRect calls
      if (!canvasMeasurements.current.rect) {
        canvasMeasurements.current.rect = canvas.getBoundingClientRect();
        canvasMeasurements.current.scaleX =
          canvas.width / canvasMeasurements.current.rect.width;
        canvasMeasurements.current.scaleY =
          canvas.height / canvasMeasurements.current.rect.height;
      }

      const { scaleX, scaleY, rect } = canvasMeasurements.current;
      if (!rect || !scaleX || !scaleY) return;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (mode === "crop") {
        setIsDrawingCrop(true);
        setCropStart({ x, y });
        setCropArea(null);
      } else if (mode === "blur") {
        setIsDrawingBlur(true);
        setBlurStart({ x, y });
      }
    },
    [mode],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingCrop || !cropStart) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Use cached measurements
      const { scaleX, scaleY, rect } = canvasMeasurements.current;
      if (!rect || !scaleX || !scaleY) return;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const width = x - cropStart.x;
      const height = y - cropStart.y;

      // Use RAF to prevent layout thrashing
      requestAnimationFrame(() => {
        setCropArea({
          x: width > 0 ? cropStart.x : x,
          y: height > 0 ? cropStart.y : y,
          width: Math.abs(width),
          height: Math.abs(height),
        });
      });
    },
    [isDrawingCrop, cropStart],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDrawingCrop) {
        setIsDrawingCrop(false);
        setCropStart(null);
      } else if (isDrawingBlur && blurStart) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Use cached measurements
        const { scaleX, scaleY, rect } = canvasMeasurements.current;
        if (!rect || !scaleX || !scaleY) return;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const width = x - blurStart.x;
        const height = y - blurStart.y;

        if (Math.abs(width) > 10 && Math.abs(height) > 10) {
          const newBlurRegion = {
            x: width > 0 ? blurStart.x : x,
            y: height > 0 ? blurStart.y : y,
            width: Math.abs(width),
            height: Math.abs(height),
          };

          // Use RAF for state updates
          requestAnimationFrame(() => {
            setBlurRegions((prev) => [...prev, newBlurRegion]);
          });
        }
        setIsDrawingBlur(false);
        setBlurStart(null);
      }
    },
    [isDrawingCrop, isDrawingBlur, blurStart],
  );

  // Apply crop
  const applyCrop = useCallback(() => {
    if (!cropArea || !originalImage) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    ctx.drawImage(
      originalImage,
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
          onSave(blob);
        }
      },
      "image/jpeg",
      0.9,
    );
  }, [cropArea, originalImage, onSave]);

  // Save edited image
  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (cropArea) {
      applyCrop();
    } else {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            onSave(blob);
          }
        },
        "image/jpeg",
        0.9,
      );
    }
  }, [applyCrop, cropArea, onSave]);

  // Reset all edits
  const handleReset = useCallback(() => {
    setCropArea(null);
    setBlurRegions([]);
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      rotation: 0,
    });
  }, []);

  // Rotate image
  const handleRotate = useCallback((direction: "left" | "right") => {
    setFilters((prev) => ({
      ...prev,
      rotation: prev.rotation + (direction === "right" ? 90 : -90),
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-center">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl max-h-[95vh] w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Image Editor</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMode("crop")}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                mode === "crop"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <FaCrop className="h-4 w-4" />
              <span>Crop</span>
            </button>
            <button
              onClick={() => setMode("blur")}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                mode === "blur"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <FaEraser className="h-4 w-4" />
              <span>Blur</span>
            </button>
            <button
              onClick={() => setMode("filters")}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                mode === "filters"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              <FaSlidersH className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleRotate("left")}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              title="Rotate Left"
            >
              <FaUndoAlt className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleRotate("right")}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              title="Rotate Right"
            >
              <FaRedo className="h-4 w-4" />
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaUndo className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 p-4 flex items-center justify-center bg-gray-100">
            <div className="max-w-full max-h-full overflow-auto">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="max-w-full max-h-full border border-gray-300 cursor-crosshair"
                style={{ maxHeight: "60vh" }}
              />
            </div>
          </div>

          {/* Sidebar */}
          {mode === "filters" && (
            <div className="w-80 p-4 border-l bg-white overflow-y-auto">
              <h4 className="font-semibold mb-4">Filters</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Brightness: {filters.brightness}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.brightness}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        brightness: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contrast: {filters.contrast}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.contrast}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        contrast: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Saturation: {filters.saturation}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.saturation}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        saturation: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Blur: {filters.blur}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={filters.blur}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        blur: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {mode === "crop" && "Click and drag to select crop area"}
            {mode === "blur" && "Click and drag to add blur regions"}
            {mode === "filters" && "Adjust filters using the sidebar"}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaSave className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorOptimized;
