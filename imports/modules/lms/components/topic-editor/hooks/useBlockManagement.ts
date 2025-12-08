import { useState } from 'react';
import type { ContentBlock, ContentBlockType } from '../../../types/contentBlocks';
import { createDefaultBlock, reorderBlocks } from '../../../utils/blockHelpers';

export const useBlockManagement = () => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const addBlock = (blockType: ContentBlockType) => {
    const newBlock = createDefaultBlock(blockType, contentBlocks.length);
    setContentBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (blockId: string, settings: any) => {
    // Check if this is an animation update (special _animation key)
    const isAnimationUpdate = '_animation' in settings;
    
    setContentBlocks(prev =>
      prev.map(block => {
        if (block.id !== blockId) return block;
        
        if (isAnimationUpdate) {
          // Update the animation property on the block itself
          const { _animation, ...restSettings } = settings;
          return { 
            ...block, 
            animation: _animation,
            settings: Object.keys(restSettings).length > 0 
              ? { ...block.settings, ...restSettings } 
              : block.settings 
          };
        }
        
        // Regular settings update
        return { ...block, settings: { ...block.settings, ...settings } };
      })
    );
    
    // Update selected block if it's being edited
    if (selectedBlock?.id === blockId) {
      if (isAnimationUpdate) {
        const { _animation, ...restSettings } = settings;
        setSelectedBlock(prev => prev ? { 
          ...prev, 
          animation: _animation,
          settings: Object.keys(restSettings).length > 0 
            ? { ...prev.settings, ...restSettings } 
            : prev.settings 
        } : null);
      } else {
        setSelectedBlock(prev => prev ? { ...prev, settings: { ...prev.settings, ...settings } } : null);
      }
    }
  };

  const deleteBlock = (blockId: string) => {
    setContentBlocks(prev => {
      const filtered = prev.filter(block => block.id !== blockId);
      // Reorder remaining blocks
      return filtered.map((block, index) => ({ ...block, order: index }));
    });
    
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
    
    setDeleteConfirm(null);
  };

  const reorderBlocksHandler = (fromIndex: number, toIndex: number) => {
    if (fromIndex !== toIndex) {
      const reordered = reorderBlocks(contentBlocks, fromIndex, toIndex);
      setContentBlocks(reordered);
    }
    setDraggedIndex(null);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderBlocksHandler(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
  };

  return {
    contentBlocks,
    setContentBlocks,
    selectedBlock,
    setSelectedBlock,
    draggedIndex,
    deleteConfirm,
    setDeleteConfirm,
    addBlock,
    updateBlock,
    deleteBlock,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
};
