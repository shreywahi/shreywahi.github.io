import { useState, useRef } from "react";

/**
 * DragDrop
 * @param {Array} items - The array of items to render and reorder.
 * @param {Function} renderItem - (item, dragProps, index, isDragged, isDropTarget) => ReactNode
 * @param {Function} onChange - (newOrder) => void
 * @param {String} className - Optional className for the container.
 */
export default function DragDrop({ items, renderItem, onChange, className = "" }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndexState, setDragOverIndexState] = useState(null);
  const dragOverIndex = useRef(null);

  // Preview order during drag
  const getPreviewList = () => {
    if (
      draggedIndex !== null &&
      dragOverIndexState !== null &&
      draggedIndex !== dragOverIndexState
    ) {
      const updated = [...items];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(dragOverIndexState, 0, removed);
      return updated;
    }
    return items;
  };

  // Drag handlers
  const onDragStart = (index) => {
    setDraggedIndex(index);
    setDragOverIndexState(index);
  };

  const onDragOver = (index, e) => {
    e.preventDefault();
    if (dragOverIndexState !== index) {
      setDragOverIndexState(index);
    }
    dragOverIndex.current = index;
  };

  const onDrop = () => {
    if (
      draggedIndex !== null &&
      dragOverIndexState !== null &&
      draggedIndex !== dragOverIndexState
    ) {
      const updated = [...items];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(dragOverIndexState, 0, removed);
      onChange(updated);
    }
    setDraggedIndex(null);
    setDragOverIndexState(null);
    dragOverIndex.current = null;
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndexState(null);
    dragOverIndex.current = null;
  };

  const previewList = getPreviewList();

  return (
    <div className={className}>
      {previewList.map((item, index) => {
        const originalIndex = items.indexOf(item);
        const isDragged = draggedIndex === originalIndex;
        const isDropTarget = dragOverIndexState === index && draggedIndex !== null && !isDragged;
        const dragProps = {
          draggable: true,
          onDragStart: () => onDragStart(originalIndex),
          onDragOver: (e) => onDragOver(index, e),
          onDrop,
          onDragEnd,
          tabIndex: 0,
        };
        return renderItem(item, dragProps, index, isDragged, isDropTarget);
      })}
    </div>
  );
}
