import { memo, useCallback, useId } from "react";
import { FaTrash, FaEdit, FaGripVertical } from "react-icons/fa";

// Props type definition
interface DraggableImageOptimizedProps {
  url: string;
  index: number;
  uid: string;
  moveImage: (fromIndex: number, toIndex: number) => void;
  onDelete: (index: number) => void;
  onEdit: (url: string, index: number) => void;
  isUploading: boolean;
  isExisting?: boolean;
  fileSize?: string;
  dimensions?: string;
  isDragging?: boolean;
  isHovered?: boolean;
}

/**
 * Lightweight DraggableImage component without react-dnd dependency
 * Uses native HTML5 drag and drop API
 */
const DraggableImageOptimized: React.FC<DraggableImageOptimizedProps> = ({
  url,
  index,
  uid,
  moveImage,
  onDelete,
  onEdit,
  isUploading,
  isExisting = false,
  fileSize,
  dimensions,
  isDragging = false,
  isHovered = false,
}) => {
  const id = useId();

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Create drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 50);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
  }, [index]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== index && !isNaN(fromIndex)) {
      moveImage(fromIndex, index);
    }
  }, [index, moveImage]);

  // Handle delete with confirmation
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this image?')) {
      onDelete(index);
    }
  }, [index, onDelete]);

  // Handle edit
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(url, index);
  }, [url, index, onEdit]);

  // Format file size
  const formatFileSize = useCallback((size: string | undefined) => {
    if (!size) return '';
    return size.includes('MB') ? size : `${(parseFloat(size) / 1024 / 1024).toFixed(2)} MB`;
  }, []);

  return (
    <div
      id={`draggable-image-${id}`}
      draggable={!isUploading}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative group rounded-lg overflow-hidden border-2 transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95 rotate-2' : ''}
        ${isHovered ? 'border-blue-400 scale-105 shadow-lg' : 'border-gray-200'}
        ${isExisting ? 'ring-2 ring-green-200' : ''}
        ${isUploading ? 'cursor-not-allowed' : 'cursor-move'}
        hover:shadow-md
      `}
      style={{
        aspectRatio: '1',
        minHeight: '120px',
      }}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="bg-black bg-opacity-50 rounded p-1">
          <FaGripVertical className="h-3 w-3 text-white" />
        </div>
      </div>

      {/* Image */}
      <div className="w-full h-full relative">
        <img
          src={url}
          alt={`Image ${index + 1}`}
          className={`
            w-full h-full object-cover transition-all duration-200
            ${isUploading ? 'opacity-50' : ''}
            ${isDragging ? 'blur-sm' : ''}
          `}
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.jpg'; // Fallback image
          }}
        />

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-xs">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={handleEdit}
            disabled={isUploading}
            className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Edit image"
            aria-label={`Edit image ${index + 1}`}
          >
            <FaEdit className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isUploading}
            className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete image"
            aria-label={`Delete image ${index + 1}`}
          >
            <FaTrash className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Image Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="text-white text-xs space-y-1">
          {/* Existing Image Badge */}
          {isExisting && (
            <div className="flex items-center">
              <span className="inline-block bg-green-600 px-2 py-0.5 rounded text-xs font-medium">
                Existing
              </span>
            </div>
          )}
          
          {/* File Size */}
          {fileSize && (
            <p className="truncate">
              <span className="font-medium">Size:</span> {formatFileSize(fileSize)}
            </p>
          )}
          
          {/* Dimensions */}
          {dimensions && (
            <p className="truncate">
              <span className="font-medium">Dimensions:</span> {dimensions}
            </p>
          )}
          
          {/* Index */}
          <p className="text-gray-300">
            Position: {index + 1}
          </p>
        </div>
      </div>

      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 flex items-center justify-center">
          <div className="text-blue-600 text-center">
            <FaGripVertical className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs font-medium">Dragging...</p>
          </div>
        </div>
      )}

      {/* Drop Indicator */}
      {isHovered && !isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-green-400 bg-green-50 bg-opacity-50 flex items-center justify-center">
          <div className="text-green-600 text-center">
            <p className="text-xs font-medium">Drop here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(DraggableImageOptimized);
