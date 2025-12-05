import React from 'react';
import styled from 'styled-components';
import { FileText, Image, Video, Play, Music, X, FileType, Download, ChevronDown, AlertCircle, MousePointerClick, Folder, Minus, RotateCw, ImageIcon, Grid3x3 } from 'lucide-react';
import type { ContentBlockType } from '../types/contentBlocks';

interface BlockLibraryProps {
  onAddBlock: (blockType: ContentBlockType) => void;
  onClose?: () => void;
}

const LibraryContainer = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const LibraryHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LibraryTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const LibraryContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const CategorySection = styled.div`
  margin-bottom: 24px;
`;

const CategoryTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BlockGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`;

const BlockButton = styled.button`
  padding: 14px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  
  &:hover {
    background: #f9fafb;
    border-color: #6366f1;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const BlockIcon = styled.div<{ color: string }>`
  width: 36px;
  height: 36px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const BlockInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const BlockName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
`;

const BlockDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const blockLibraryData = [
  {
    category: 'Essential',
    blocks: [
      {
        type: 'rich-text' as ContentBlockType,
        name: 'Rich Text',
        description: 'Add formatted text content',
        icon: <FileText size={20} />,
        color: '#3b82f6',
      },
    ],
  },
  {
    category: 'Text & Images',
    blocks: [
      {
        type: 'image-text' as ContentBlockType,
        name: 'Image + Text Block',
        description: 'Combine image with text content',
        icon: <ImageIcon size={20} />,
        color: '#10b981',
      },
    ],
  },
  {
    category: 'Media',
    blocks: [
      {
        type: 'image' as ContentBlockType,
        name: 'Image',
        description: 'Upload and display images',
        icon: <Image size={20} />,
        color: '#10b981',
      },
      {
        type: 'video' as ContentBlockType,
        name: 'YouTube Video',
        description: 'Embed YouTube videos',
        icon: <Video size={20} />,
        color: '#ef4444',
      },
      {
        type: 'video-player' as ContentBlockType,
        name: 'Video Player',
        description: 'Upload and play video files (MP4, WebM)',
        icon: <Play size={20} />,
        color: '#8b5cf6',
      },
      {
        type: 'audio-player' as ContentBlockType,
        name: 'Audio Player',
        description: 'Upload audio files or podcasts (MP3, WAV)',
        icon: <Music size={20} />,
        color: '#f59e0b',
      },
      {
        type: 'pdf' as ContentBlockType,
        name: 'PDF Document',
        description: 'Embed PDF files',
        icon: <FileType size={20} />,
        color: '#8b5cf6',
      },
      {
        type: 'file-download' as ContentBlockType,
        name: 'File Download',
        description: 'Downloadable files list',
        icon: <Download size={20} />,
        color: '#059669',
      },
    ],
  },
  {
    category: 'Layout',
    blocks: [
      {
        type: 'content-grid' as ContentBlockType,
        name: 'Content Grid',
        description: 'Grid of feature cards with images',
        icon: <Grid3x3 size={20} />,
        color: '#10b981',
      },
      {
        type: 'divider' as ContentBlockType,
        name: 'Divider',
        description: 'Horizontal line separator',
        icon: <Minus size={20} />,
        color: '#64748b',
      },
    ],
  },
  {
    category: 'Interactive',
    blocks: [
      {
        type: 'accordion' as ContentBlockType,
        name: 'Accordion',
        description: 'Collapsible sections',
        icon: <ChevronDown size={20} />,
        color: '#8b5cf6',
      },
      {
        type: 'flipboxes' as ContentBlockType,
        name: 'Flipboxes',
        description: 'Interactive flip cards',
        icon: <RotateCw size={20} />,
        color: '#ec4899',
      },
      {
        type: 'callout' as ContentBlockType,
        name: 'Callout',
        description: 'Info, warning, success boxes',
        icon: <AlertCircle size={20} />,
        color: '#06b6d4',
      },
      {
        type: 'button' as ContentBlockType,
        name: 'Button',
        description: 'Call-to-action button',
        icon: <MousePointerClick size={20} />,
        color: '#3b82f6',
      },
      {
        type: 'tabs' as ContentBlockType,
        name: 'Tabs',
        description: 'Tabbed content panels',
        icon: <Folder size={20} />,
        color: '#14b8a6',
      },
    ],
  },
];

export const BlockLibrary: React.FC<BlockLibraryProps> = ({ onAddBlock, onClose }) => {
  return (
    <LibraryContainer>
      <LibraryHeader>
        <LibraryTitle>Add Content Block</LibraryTitle>
        {onClose && (
          <CloseButton onClick={onClose} title="Close">
            <X size={20} />
          </CloseButton>
        )}
      </LibraryHeader>
      
      <LibraryContent>
        {blockLibraryData.map(category => (
          <CategorySection key={category.category}>
            <CategoryTitle>{category.category}</CategoryTitle>
            <BlockGrid>
              {category.blocks.map(block => (
                <BlockButton
                  key={block.type}
                  onClick={() => {
                    onAddBlock(block.type);
                    onClose();
                  }}
                >
                  <BlockIcon color={block.color}>
                    {block.icon}
                  </BlockIcon>
                  <BlockInfo>
                    <BlockName>{block.name}</BlockName>
                    <BlockDescription>{block.description}</BlockDescription>
                  </BlockInfo>
                </BlockButton>
              ))}
            </BlockGrid>
          </CategorySection>
        ))}
      </LibraryContent>
    </LibraryContainer>
  );
};
