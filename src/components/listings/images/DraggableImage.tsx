import React, { useRef, memo, useMemo, useCallback, useId } from "react";
import type { Identifier } from 'dnd-core';
import { useDrag, useDrop } from "react-dnd";
import { motion } from "framer-motion";
import { FaTrash, FaEdit } from "react-icons/fa";
import ImageFallback from "@/components/media/ImageFallback";

interface DragItem {
  type: string;
  index: number;
  id: string;
}

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
  const ref = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);
  const componentId = useId();
  
  // Create a stable identifier that persists across re-renders
  const stableId = useMemo(() => `${componentId}-${index}`, [componentId, index]);

  const [{ isDragging }, drag, preview] = useDrag({
    type: "image",
    item: () => ({ type: "image", index, id: stableId }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isUploading,
    // Optimize performance by preventing expensive operations during drag
    isDragging: (monitor) => {
      const item = monitor.getItem() as DragItem | null;
      return item ? item.id === stableId : false;
    },
  });

  const [, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: "image",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current || item.id === stableId) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Get bounding rectangle of the hovered item
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (!hoverBoundingRect || !clientOffset) {
        return;
      }

      // Get vertical middle of the hovered item
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      if (
        (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
        (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
      ) {
        return;
      }

      // Time to actually perform the action
      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // Memoize handlers with stable references
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(index);
    },
    [onDelete, index]
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(url, index);
    },
    [onEdit, url, index]
  );

  // Set up refs for drag and drop
  const setDragRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        // Store the node reference
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        // Setup drag and drop
        drag(drop(node));
        // Setup preview if preview ref is available
        if (dragPreviewRef.current) {
          preview(dragPreviewRef);
        }
      }
    },
    [drag, drop, preview]
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`relative group ${isDragging ? "opacity-40" : "opacity-100"}`}
      ref={setDragRef}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800" ref={dragPreviewRef}>
        <ImageFallback
          src={url}
          alt="Listing image"
          className="w-full h-full object-cover"
          width={200}
          height={200}
          quality={75}
          priority={index === 0}
          loading={index < 3 ? 'eager' : 'lazy'}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
