import React from 'react';
import type { ContentBlock } from '../../types/contentBlocks';
import { RichTextBlock } from './RichTextBlock';
import { ImageBlock } from './ImageBlock';
import { VideoBlock } from './VideoBlock';
import { VideoPlayerBlock } from './VideoPlayerBlock';
import { AudioPlayerBlock } from './AudioPlayerBlock';
import { PDFBlock } from './PDFBlock';
import { FileDownloadBlock } from './FileDownloadBlock';
import { AccordionBlock } from './AccordionBlock';
import { CalloutBlock } from './CalloutBlock';
import { ButtonBlock } from './ButtonBlock';
import { QuizBlock } from './QuizBlock';
import { TabsBlock } from './TabsBlock';
import { DividerBlock } from './DividerBlock';
import { FlipboxesBlock } from './FlipboxesBlock';
import { ImageTextBlock } from './ImageTextBlock';
import { ContentGridBlock } from './ContentGridBlock';
import { AnimationWrapper } from './AnimationWrapper';

interface ContentBlockRendererProps {
  block: ContentBlock;
  isEditing: boolean;
  onUpdate: (settings: any) => void;
}

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({
  block,
  isEditing,
  onUpdate,
}) => {
  const renderBlock = () => {
    switch (block.type) {
      case 'rich-text':
        return <RichTextBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'image':
        return <ImageBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'video':
        return <VideoBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'video-player':
        return <VideoPlayerBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'audio-player':
        return <AudioPlayerBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'pdf':
        return <PDFBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'file-download':
        return <FileDownloadBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'accordion':
        return <AccordionBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'callout':
        return <CalloutBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'button':
        return <ButtonBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'quiz':
        return <QuizBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'tabs':
        return <TabsBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'divider':
        return <DividerBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'flipboxes':
        return <FlipboxesBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'image-text':
        return <ImageTextBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'content-grid':
        return <ContentGridBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      default:
        return (
          <div style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>
            Unknown block type: {(block as any).type}
          </div>
        );
    }
  };

  // Wrap block content with AnimationWrapper
  // In editing mode, animations are disabled for better editing experience
  return (
    <AnimationWrapper animation={block.animation} isEditing={isEditing}>
      {renderBlock()}
    </AnimationWrapper>
  );
};
