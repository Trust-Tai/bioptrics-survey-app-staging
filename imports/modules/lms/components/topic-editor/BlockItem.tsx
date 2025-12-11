import React, { useRef } from 'react';
import { GripVertical, Edit2, Trash2 } from 'lucide-react';
import { ContentBlockRenderer } from '../blocks/ContentBlockRenderer';
import { getBlockColor } from '../../utils/blockHelpers';
import type { ContentBlock, ContentBlockType } from '../../types/contentBlocks';
import {
  BlockWrapper,
  BlockContainer,
  BlockHeader,
  BlockHeaderLeft,
  DragHandle,
  BlockTitle,
  BlockActions,
  IconButton,
  BlockContent,
} from '../../styles/topicEditor.styles';

interface BlockItemProps {
  block: ContentBlock;
  isDragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (settings: any) => void;
}

const getBlockTypeName = (type: ContentBlockType): string => {
  switch (type) {
    case 'rich-text': return 'Rich Text';
    case 'image': return 'Image';
    case 'video': return 'Video';
    default: return 'Block';
  }
};

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onEdit,
  onDelete,
  onUpdate,
}) => {
  const blockColor = getBlockColor(block.type);
  const isDraggingRef = useRef(false);

  // Only allow drag when initiated from drag handle
  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggingRef.current) {
      e.preventDefault();
      return;
    }
    onDragStart();
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };

  // Enable drag only when mousedown on handle
  const handleMouseDownOnHandle = () => {
    isDraggingRef.current = true;
  };

  // Prevent drag from content area (allows text selection)
  const handleContentMouseDown = () => {
    isDraggingRef.current = false;
  };

  return (
    <BlockWrapper
      isDragging={isDragging}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <BlockContainer color={blockColor}>
        <BlockHeader color={blockColor}>
          <BlockHeaderLeft>
            <DragHandle onMouseDown={handleMouseDownOnHandle}>
              <GripVertical size={18} />
            </DragHandle>
            <BlockTitle>{getBlockTypeName(block.type)}</BlockTitle>
          </BlockHeaderLeft>
          
          <BlockActions>
            <IconButton onClick={onEdit} title="Settings">
              <Edit2 size={16} />
            </IconButton>
            <IconButton onClick={onDelete} title="Delete">
              <Trash2 size={16} />
            </IconButton>
          </BlockActions>
        </BlockHeader>
        
        <BlockContent onMouseDown={handleContentMouseDown}>
          <ContentBlockRenderer
            block={block}
            isEditing={true}
            onUpdate={onUpdate}
            onEdit={onEdit}
          />
        </BlockContent>
      </BlockContainer>
    </BlockWrapper>
  );
};
