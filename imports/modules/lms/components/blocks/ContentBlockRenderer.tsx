import React from 'react';
import styled, { css } from 'styled-components';
import type { ContentBlock, SpacingSettings, BackgroundSettings, VisibilitySettings } from '../../types/contentBlocks';
import { RichTextBlock } from './RichTextBlock';
import { ImageBlock } from './ImageBlock';
import { VideoBlock } from './VideoBlock';
import { VideoPlayerBlock } from './VideoPlayerBlock';
import { AudioPlayerBlock } from './AudioPlayerBlock';
import { MediaBlock } from './MediaBlock';
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
import { BannerBlock } from './BannerBlock';
import { TestimonialsBlock } from './TestimonialsBlock';
import { TimelineBlock } from './TimelineBlock';
import { AnimationWrapper } from './AnimationWrapper';

// Helper to generate CSS styles from spacing and background settings
const getBlockStyles = (spacing?: SpacingSettings, background?: BackgroundSettings): React.CSSProperties => {
  const styles: React.CSSProperties = {};

  // Apply spacing
  if (spacing) {
    const { padding, margin } = spacing;
    styles.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    styles.margin = `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`;
  }

  // Apply background color with opacity
  if (background?.color) {
    if (background.opacity < 100) {
      // Convert hex to rgba
      const hex = background.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      styles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${background.opacity / 100})`;
    } else {
      styles.backgroundColor = background.color;
    }
  }

  // Apply background image
  if (background?.image) {
    styles.backgroundImage = `url(${background.image})`;
    styles.backgroundSize = background.size === 'custom' ? background.customSize : background.size;
    styles.backgroundPosition = background.position === 'custom' 
      ? background.customPosition 
      : background.position.replace('-', ' ');
    styles.backgroundRepeat = background.repeat;
    styles.backgroundAttachment = background.attachment;
  }

  return styles;
};

// Styled wrapper for block with overlay and visibility support
const BlockStyleWrapper = styled.div<{ 
  $hasOverlay: boolean; 
  $overlayColor: string; 
  $overlayOpacity: number;
  $hideOnDesktop: boolean;
  $hideOnTablet: boolean;
  $hideOnMobile: boolean;
}>`
  position: relative;
  border-radius: 4px;

  ${props => props.$hasOverlay && css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: ${props.$overlayColor};
      opacity: ${props.$overlayOpacity / 100};
      pointer-events: none;
      border-radius: inherit;
      z-index: 0;
    }

    & > * {
      position: relative;
      z-index: 1;
    }
  `}

  /* Hide on Mobile (< 768px) */
  ${props => props.$hideOnMobile && css`
    @media (max-width: 767px) {
      display: none !important;
    }
  `}

  /* Hide on Tablet (768px - 991px) */
  ${props => props.$hideOnTablet && css`
    @media screen and (min-width: 768px) and (max-width: 991px) {
      display: none !important;
    }
  `}

  /* Hide on Desktop (992px+) */
  ${props => props.$hideOnDesktop && css`
    @media screen and (min-width: 992px) {
      display: none !important;
    }
  `}
`;

interface ContentBlockRendererProps {
  block: ContentBlock;
  isEditing: boolean;
  onUpdate: (settings: any) => void;
  onEdit?: () => void;
}

// Helper to check if a block has no content (empty)
const isBlockEmpty = (block: ContentBlock): boolean => {
  const settings: any = block.settings || {};
  
  switch (block.type) {
    case 'audio-player':
      return !settings.audioUrl && !settings.audioFile;
    
    case 'video-player':
      return !settings.videoUrl && !settings.videoFile;
    
    case 'video':
      return !settings.url && !settings.videoUrl;
    
    case 'image':
      return !settings.imageUrl && !settings.src;
    
    case 'pdf':
      return !settings.pdfUrl && !settings.pdfFile;
    
    case 'file-download':
      return !settings.files || settings.files.length === 0;
    
    case 'rich-text':
      // Check if content is empty or just whitespace/empty HTML
      const content = settings.content || '';
      const strippedContent = content.replace(/<[^>]*>/g, '').trim();
      return !strippedContent;
    
    case 'image-text':
      // Show if has image or meaningful text
      const hasImage = settings.imageUrl || settings.imageSrc;
      const hasHeading = settings.heading?.trim();
      const textContent = (settings.content || '').replace(/<[^>]*>/g, '').trim();
      return !hasImage && !hasHeading && !textContent;
    
    default:
      return false;
  }
};

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({
  block,
  isEditing,
  onUpdate,
  onEdit,
}) => {
  // Skip empty blocks in learner view (non-editing mode)
  if (!isEditing && isBlockEmpty(block)) {
    return null;
  }

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
      
      case 'media':
        return <MediaBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'pdf':
        return <PDFBlock block={block} isEditing={isEditing} onUpdate={onUpdate} onEdit={onEdit} />;
      
      case 'file-download':
        return <FileDownloadBlock block={block} isEditing={isEditing} onUpdate={onUpdate} onEdit={onEdit} />;
      
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
      
      case 'banner':
        return <BannerBlock block={block} isEditing={isEditing} />;
      
      case 'testimonials':
        return <TestimonialsBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      case 'timeline':
        return <TimelineBlock block={block} isEditing={isEditing} onUpdate={onUpdate} />;
      
      default:
        return (
          <div style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>
            Unknown block type: {(block as any).type}
          </div>
        );
    }
  };

  // Get styles from spacing and background settings
  const blockStyles = getBlockStyles(block.spacing, block.background);
  
  // Check if overlay is needed
  const hasOverlay = !!(block.background?.image && block.background?.overlay?.color && block.background?.overlay?.opacity > 0);
  const overlayColor = block.background?.overlay?.color || '#000000';
  const overlayOpacity = block.background?.overlay?.opacity || 0;

  // Get visibility settings (default all true)
  const visibility = block.visibility || { desktop: true, tablet: true, mobile: true };
  // Only apply visibility hiding in non-editing mode (learner view)
  const hideOnDesktop = !isEditing && !visibility.desktop;
  const hideOnTablet = !isEditing && !visibility.tablet;
  const hideOnMobile = !isEditing && !visibility.mobile;

  // Debug logging for visibility
  if (!isEditing) {
    console.log(`[Visibility] Block ${block.type} (${block.id}):`, {
      visibility: block.visibility,
      resolved: visibility,
      hideOnDesktop,
      hideOnTablet,
      hideOnMobile
    });
  }

  // Wrap block content with AnimationWrapper and BlockStyleWrapper
  // In editing mode, animations are disabled for better editing experience
  return (
    <BlockStyleWrapper
      style={blockStyles}
      $hasOverlay={hasOverlay}
      $overlayColor={overlayColor}
      $overlayOpacity={overlayOpacity}
      $hideOnDesktop={hideOnDesktop}
      $hideOnTablet={hideOnTablet}
      $hideOnMobile={hideOnMobile}
    >
      <AnimationWrapper animation={block.animation} isEditing={isEditing}>
        {renderBlock()}
      </AnimationWrapper>
    </BlockStyleWrapper>
  );
};
