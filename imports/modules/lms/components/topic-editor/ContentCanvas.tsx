import React from 'react';
import { Plus } from 'lucide-react';
import { BlockItem } from './BlockItem';
import { EmptyStateView } from './EmptyStateView';
import { TopicTitle } from './TopicTitle';
import type { ContentBlock } from '../../types/contentBlocks';
import {
  Canvas,
  CanvasInner,
  ContentSection,
  BlocksList,
  AddBlockButton,
} from '../../styles/topicEditor.styles';

interface ContentCanvasProps {
  topicTitle: string;
  isEditingTitle: boolean;
  editTitleValue: string;
  onEditTitleChange: (value: string) => void;
  onStartEditTitle: () => void;
  onSaveTitle: () => void;
  onCancelEditTitle: () => void;
  blocks: ContentBlock[];
  draggedIndex: number | null;
  onAddBlock: () => void;
  onEditBlock: (block: ContentBlock) => void;
  onDeleteBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, settings: any) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export const ContentCanvas: React.FC<ContentCanvasProps> = ({
  topicTitle,
  isEditingTitle,
  editTitleValue,
  onEditTitleChange,
  onStartEditTitle,
  onSaveTitle,
  onCancelEditTitle,
  blocks,
  draggedIndex,
  onAddBlock,
  onEditBlock,
  onDeleteBlock,
  onUpdateBlock,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  return (
    <Canvas>
      <CanvasInner>
        <TopicTitle
          title={topicTitle}
          isEditing={isEditingTitle}
          editValue={editTitleValue}
          onEditValueChange={onEditTitleChange}
          onStartEdit={onStartEditTitle}
          onSave={onSaveTitle}
          onCancel={onCancelEditTitle}
        />

        <ContentSection>
          {blocks.length === 0 ? (
            <EmptyStateView onAddFirstBlock={onAddBlock} />
          ) : (
            <BlocksList>
              {blocks.map((block, index) => (
                <BlockItem
                  key={block.id}
                  block={block}
                  isDragging={draggedIndex === index}
                  onDragStart={() => onDragStart(index)}
                  onDragOver={e => onDragOver(e, index)}
                  onDrop={e => onDrop(e, index)}
                  onEdit={() => onEditBlock(block)}
                  onDelete={() => onDeleteBlock(block.id)}
                  onUpdate={settings => onUpdateBlock(block.id, settings)}
                />
              ))}
              
              <AddBlockButton onClick={onAddBlock}>
                <Plus size={20} />
                Add Content Block
              </AddBlockButton>
            </BlocksList>
          )}
        </ContentSection>
      </CanvasInner>
    </Canvas>
  );
};
