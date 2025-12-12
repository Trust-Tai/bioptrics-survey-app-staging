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
    // Check for special block-level updates (prefixed with _)
    const isAnimationUpdate = '_animation' in settings;
    const isSpacingUpdate = '_spacing' in settings;
    const isBackgroundUpdate = '_background' in settings;
    const isVisibilityUpdate = '_visibility' in settings;
    const hasBlockLevelUpdates = isAnimationUpdate || isSpacingUpdate || isBackgroundUpdate || isVisibilityUpdate;

    // Debug: Log visibility updates
    if (isVisibilityUpdate) {
      console.log('[useBlockManagement] Visibility update for block:', blockId, settings._visibility);
    }
    
    setContentBlocks(prev =>
      prev.map(block => {
        if (block.id !== blockId) return block;
        
        if (hasBlockLevelUpdates) {
          // Extract block-level properties and remaining settings
          const { _animation, _spacing, _background, _visibility, ...restSettings } = settings;
          const updatedBlock = { ...block };
          
          if (isAnimationUpdate) updatedBlock.animation = _animation;
          if (isSpacingUpdate) updatedBlock.spacing = _spacing;
          if (isBackgroundUpdate) updatedBlock.background = _background;
          if (isVisibilityUpdate) {
            updatedBlock.visibility = _visibility;
            console.log('[useBlockManagement] Updated block visibility:', updatedBlock.visibility);
          }
          
          // Update settings if there are remaining properties
          if (Object.keys(restSettings).length > 0) {
            updatedBlock.settings = { ...block.settings, ...restSettings };
          }
          
          console.log('[useBlockManagement] Final block to save:', { id: updatedBlock.id, visibility: updatedBlock.visibility });
          return updatedBlock;
        }
        
        // Regular settings update
        return { ...block, settings: { ...block.settings, ...settings } };
      })
    );
    
    // Update selected block if it's being edited
    if (selectedBlock?.id === blockId) {
      if (hasBlockLevelUpdates) {
        const { _animation, _spacing, _background, _visibility, ...restSettings } = settings;
        setSelectedBlock(prev => {
          if (!prev) return null;
          const updatedBlock = { ...prev };
          
          if (isAnimationUpdate) updatedBlock.animation = _animation;
          if (isSpacingUpdate) updatedBlock.spacing = _spacing;
          if (isBackgroundUpdate) updatedBlock.background = _background;
          if (isVisibilityUpdate) updatedBlock.visibility = _visibility;
          
          if (Object.keys(restSettings).length > 0) {
            updatedBlock.settings = { ...prev.settings, ...restSettings };
          }
          
          return updatedBlock;
        });
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
