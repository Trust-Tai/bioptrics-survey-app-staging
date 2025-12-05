import React from 'react';
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

  return (
    <BlockWrapper
      isDragging={isDragging}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <BlockContainer color={blockColor}>
        <BlockHeader color={blockColor}>
          <BlockHeaderLeft>
            <DragHandle>
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
        
        <BlockContent>
          <ContentBlockRenderer
            block={block}
            isEditing={true}
            onUpdate={onUpdate}
          />
        </BlockContent>
      </BlockContainer>
    </BlockWrapper>
  );
};
