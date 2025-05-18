import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import { FaTrash, FaEdit } from "react-icons/fa";
import ImageFallback from "@/components/common/ImageFallback";

/**
 * DraggableImage component for drag-and-drop image reordering
 */
interface DraggableImageProps {
  url: string;
  index: number;
  moveImage: (fromIndex: number, toIndex: number) => void;
  onDelete: (index: number) => void;
  onEdit: (url: string, index: number) => void;
  isUploading: boolean;
  isExisting?: boolean;
  fileSize?: string;
  dimensions?: string;
}

const DraggableImage: React.FC<DraggableImageProps> = ({
  url,
  index,
  moveImage,
  onDelete,
  onEdit,
  isUploading,
  isExisting = false,
  fileSize,
  dimensions,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: "image",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "image",
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isUploading ? "wait" : "grab",
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
        <ImageFallback
          src={url}
          alt={`Preview ${index + 1}`}
          className="w-full h-full object-cover"
          width={200}
          height={200}
        />
      </div>
      {/* File size indicator */}
      {fileSize && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
          {fileSize}
        </div>
      )}
      {/* Dimensions indicator */}
      {dimensions && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
          {dimensions}
        </div>
      )}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity duration-200">
          <button
            type="button"
            onClick={() => onEdit(url, index)}
            disabled={isUploading}
            className="p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 transition-colors"
            title="Edit image"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          {!isExisting && (
            <button
              type="button"
              onClick={() => onDelete(index)}
              disabled={isUploading}
              className="p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 text-red-600 transition-colors"
              title="Remove image"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {isExisting && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
          Existing
        </div>
      )}
    </motion.div>
  );
};

export default DraggableImage;
