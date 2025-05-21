import React, { useRef, memo, useMemo, useCallback } from "react";
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
  uid: string;
  moveImage: (fromIndex: number, toIndex: number) => void;
  onDelete: (index: number) => void;
  onEdit: (url: string, index: number) => void;
  isUploading: boolean;
  isExisting?: boolean;
  fileSize?: string;
  dimensions?: string;
}

// In DraggableImage.tsx
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
  const ref = useRef<HTMLDivElement | null>(null);
  
  // Create a stable identifier that persists across re-renders
  const stableId = useMemo(() => `${url}-${index}`, [url, index]);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: { type: 'image', index, id: stableId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isUploading,
  });

  const [, drop] = useDrop({
    accept: 'image',
    hover(item: { type: string; index: number; id: string }, monitor) {
      if (!ref.current || item.id === stableId) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      if (
        (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
        (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
      ) {
        return;
      }

      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // Memoize handlers
  const handleDelete = useCallback(() => onDelete(index), [onDelete, index]);
  const handleEdit = useCallback(() => onEdit(url, index), [onEdit, url, index]);

  // Set up the ref for drag and drop
  const setDragRef = (node: HTMLDivElement | null) => {
    if (node) {
      ref.current = node;
      drag(drop(node));
    }
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`relative group ${isDragging ? 'opacity-40' : 'opacity-100'}`}
      ref={setDragRef}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <ImageFallback
          src={url}
          alt="Listing image"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Image metadata overlay */}
        {(fileSize || dimensions) && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
            <div className="flex justify-between px-2">
              {fileSize && <span>{fileSize}</span>}
              {dimensions && <span>{dimensions}</span>}
            </div>
          </div>
        )}
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            title="Edit image"
          >
            <FaEdit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isUploading}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            title="Delete image"
          >
            <FaTrash className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
      {isExisting && (
        <div className="absolute top-2 left-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-[10px] font-medium px-2 py-0.5 rounded-full border border-yellow-300 dark:border-yellow-700 shadow-sm">
          Existing
        </div>
      )}
    </motion.div>
  );
};

export default memo(DraggableImage);
