/**
 * Lightweight drag and drop utilities to replace react-dnd
 * Provides HTML5 drag and drop functionality without heavy dependencies
 */

export interface DragDropState {
  isDragging: boolean;
  dragIndex: number | null;
  hoverIndex: number | null;
  dragData: any;
}

export interface DragDropCallbacks {
  onDragStart?: (index: number, data: any) => void;
  onDragEnd?: (index: number, data: any) => void;
  onDrop?: (fromIndex: number, toIndex: number, data: any) => void;
  onHover?: (hoverIndex: number) => void;
}

/**
 * Custom hook for drag and drop functionality
 */
export const useDragDrop = (
  items: any[],
  callbacks: DragDropCallbacks = {}
) => {
  const [state, setState] = React.useState<DragDropState>({
    isDragging: false,
    dragIndex: null,
    hoverIndex: null,
    dragData: null,
  });

  const handleDragStart = React.useCallback(
    (e: React.DragEvent, index: number, data?: any) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify({ index, data }));
      
      setState({
        isDragging: true,
        dragIndex: index,
        hoverIndex: null,
        dragData: data,
      });

      callbacks.onDragStart?.(index, data);
    },
    [callbacks]
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (state.dragIndex !== null && state.dragIndex !== index) {
        setState(prev => ({ ...prev, hoverIndex: index }));
        callbacks.onHover?.(index);
      }
    },
    [state.dragIndex, callbacks]
  );

  const handleDragEnter = React.useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (state.dragIndex !== null && state.dragIndex !== index) {
        setState(prev => ({ ...prev, hoverIndex: index }));
      }
    },
    [state.dragIndex]
  );

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      // Only clear hover if we're leaving the container
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setState(prev => ({ ...prev, hoverIndex: null }));
      }
    },
    []
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      
      try {
        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const fromIndex = dragData.index;
        
        if (fromIndex !== toIndex) {
          callbacks.onDrop?.(fromIndex, toIndex, dragData.data);
        }
      } catch (error) {
        console.error('Failed to parse drag data:', error);
      }

      setState({
        isDragging: false,
        dragIndex: null,
        hoverIndex: null,
        dragData: null,
      });
    },
    [callbacks]
  );

  const handleDragEnd = React.useCallback(
    (e: React.DragEvent, index: number, data?: any) => {
      setState({
        isDragging: false,
        dragIndex: null,
        hoverIndex: null,
        dragData: null,
      });

      callbacks.onDragEnd?.(index, data);
    },
    [callbacks]
  );

  return {
    state,
    handlers: {
      handleDragStart,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
    },
  };
};

/**
 * Drag source hook for individual draggable items
 */
export const useDragSource = (
  index: number,
  data: any,
  callbacks: DragDropCallbacks = {}
) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const dragProps = React.useMemo(() => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify({ index, data }));
      setIsDragging(true);
      callbacks.onDragStart?.(index, data);
    },
    onDragEnd: (e: React.DragEvent) => {
      setIsDragging(false);
      callbacks.onDragEnd?.(index, data);
    },
  }), [index, data, callbacks]);

  return {
    isDragging,
    dragProps,
  };
};

/**
 * Drop target hook for drop zones
 */
export const useDropTarget = (
  index: number,
  callbacks: DragDropCallbacks = {}
) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const dropProps = React.useMemo(() => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      callbacks.onHover?.(index);
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      setIsHovered(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsHovered(false);
      }
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setIsHovered(false);
      
      try {
        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const fromIndex = dragData.index;
        
        if (fromIndex !== index) {
          callbacks.onDrop?.(fromIndex, index, dragData.data);
        }
      } catch (error) {
        console.error('Failed to parse drag data:', error);
      }
    },
  }), [index, callbacks]);

  return {
    isHovered,
    dropProps,
  };
};

/**
 * File drop zone hook for file uploads
 */
export const useFileDropZone = (
  onDrop: (files: File[]) => void,
  options: {
    accept?: string[];
    maxFiles?: number;
    maxSize?: number;
    minSize?: number;
  } = {}
) => {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [isDragReject, setIsDragReject] = React.useState(false);

  const validateFiles = React.useCallback(
    (files: FileList) => {
      const fileArray = Array.from(files);
      
      if (options.maxFiles && fileArray.length > options.maxFiles) {
        return false;
      }

      return fileArray.every(file => {
        if (options.accept && !options.accept.includes(file.type)) {
          return false;
        }
        if (options.maxSize && file.size > options.maxSize) {
          return false;
        }
        if (options.minSize && file.size < options.minSize) {
          return false;
        }
        return true;
      });
    },
    [options]
  );

  const dropZoneProps = React.useMemo(() => ({
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragActive(false);
        setIsDragReject(false);
      }
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isValid = validateFiles(e.dataTransfer.files);
      setIsDragReject(!isValid);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragActive(false);
      setIsDragReject(false);

      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(file => {
        if (options.accept && !options.accept.includes(file.type)) {
          return false;
        }
        if (options.maxSize && file.size > options.maxSize) {
          return false;
        }
        if (options.minSize && file.size < options.minSize) {
          return false;
        }
        return true;
      });

      if (options.maxFiles) {
        validFiles.splice(options.maxFiles);
      }

      onDrop(validFiles);
    },
  }), [onDrop, options, validateFiles]);

  return {
    isDragActive,
    isDragReject,
    dropZoneProps,
  };
};

/**
 * Reorder array utility
 */
export const reorderArray = <T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

/**
 * Move item between arrays utility
 */
export const moveItemBetweenArrays = <T>(
  sourceArray: T[],
  targetArray: T[],
  sourceIndex: number,
  targetIndex: number
): { source: T[]; target: T[] } => {
  const newSource = [...sourceArray];
  const newTarget = [...targetArray];
  
  const [removed] = newSource.splice(sourceIndex, 1);
  newTarget.splice(targetIndex, 0, removed);
  
  return {
    source: newSource,
    target: newTarget,
  };
};

/**
 * Get drag preview element
 */
export const createDragPreview = (
  element: HTMLElement,
  options: {
    opacity?: number;
    scale?: number;
    rotation?: number;
  } = {}
): HTMLElement => {
  const { opacity = 0.8, scale = 0.9, rotation = 5 } = options;
  
  const preview = element.cloneNode(true) as HTMLElement;
  preview.style.position = 'absolute';
  preview.style.top = '-1000px';
  preview.style.left = '-1000px';
  preview.style.opacity = opacity.toString();
  preview.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
  preview.style.pointerEvents = 'none';
  preview.style.zIndex = '9999';
  
  document.body.appendChild(preview);
  
  // Clean up after a short delay
  setTimeout(() => {
    if (document.body.contains(preview)) {
      document.body.removeChild(preview);
    }
  }, 100);
  
  return preview;
};

// Re-export React for the hooks
import React from 'react';
