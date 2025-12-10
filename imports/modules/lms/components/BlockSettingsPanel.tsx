import React, { useState } from 'react';
import { X, Settings, Sparkles } from 'lucide-react';
import type { ContentBlock, BannerBlock } from '../types/contentBlocks';

// Import shared components from the modular folder
import { AnimationSettingsPanel } from './BlockSettingsPanel/shared/AnimationSettingsPanel';

// Import all settings components
import {
  RichTextSettings,
  ImageSettings,
  VideoSettings,
  VideoPlayerSettings,
  AudioPlayerSettings,
  PDFSettings,
  FileDownloadSettings,
  AccordionSettings,
  CalloutSettings,
  ButtonSettings,
  DividerSettings,
  QuizSettings,
  TabsSettings,
  FlipboxesSettings,
  ImageTextSettings,
  ContentGridSettings,
  BannerSettings,
  BannerStyleSettings,
  TestimonialsSettings,
  TimelineSettings,
} from './BlockSettingsPanel/settings';
import {
  PanelContainer,
  PanelHeader,
  PanelTitle,
  TitleText,
  CloseButton,
  PanelContent,
  TabsContainer,
  Tab,
} from './BlockSettingsPanel/shared/StyledComponents';

interface BlockSettingsPanelProps {
  block: ContentBlock;
  onUpdate: (settings: any) => void;
  onClose: () => void;
}

type SettingsTab = 'content' | 'style';

export const BlockSettingsPanel: React.FC<BlockSettingsPanelProps> = ({ block, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('content');

  const renderSettings = () => {
    switch (block.type) {
      case 'rich-text':
        return <RichTextSettings block={block} onUpdate={onUpdate} />;
      case 'image':
        return <ImageSettings block={block} onUpdate={onUpdate} />;
      case 'video':
        return <VideoSettings block={block} onUpdate={onUpdate} />;
      case 'video-player':
        return <VideoPlayerSettings block={block} onUpdate={onUpdate} />;
      case 'audio-player':
        return <AudioPlayerSettings block={block} onUpdate={onUpdate} />;
      case 'pdf':
        return <PDFSettings block={block} onUpdate={onUpdate} />;
      case 'file-download':
        return <FileDownloadSettings block={block} onUpdate={onUpdate} />;
      case 'accordion':
        return <AccordionSettings block={block} onUpdate={onUpdate} />;
      case 'callout':
        return <CalloutSettings block={block} onUpdate={onUpdate} />;
      case 'button':
        return <ButtonSettings block={block} onUpdate={onUpdate} />;
      case 'quiz':
        return <QuizSettings block={block} onUpdate={onUpdate} />;
      case 'tabs':
        return <TabsSettings block={block} onUpdate={onUpdate} />;
      case 'divider':
        return <DividerSettings block={block} onUpdate={onUpdate} />;
      case 'flipboxes':
        return <FlipboxesSettings block={block} onUpdate={onUpdate} />;
      case 'image-text':
        return <ImageTextSettings block={block} onUpdate={onUpdate} />;
      case 'content-grid':
        return <ContentGridSettings block={block} onUpdate={onUpdate} />;
      case 'banner':
        return <BannerSettings block={block} onUpdate={onUpdate} />;
      case 'testimonials':
        return <TestimonialsSettings block={block} onUpdate={onUpdate} />;
      case 'timeline':
        return <TimelineSettings block={block} onUpdate={onUpdate} />;
      default:
        return <div>No settings available</div>;
    }
  };

  const getBlockName = () => {
    switch (block.type) {
      case 'rich-text': return 'Rich Text';
      case 'image': return 'Image';
      case 'video': return 'Video';
      case 'video-player': return 'Video Player';
      case 'audio-player': return 'Audio Player';
      case 'pdf': return 'PDF Document';
      case 'file-download': return 'File Download';
      case 'accordion': return 'Accordion';
      case 'callout': return 'Callout';
      case 'button': return 'Button';
      case 'quiz': return 'Quiz';
      case 'tabs': return 'Tabs';
      case 'divider': return 'Divider';
      case 'flipboxes': return 'Flipboxes';
      case 'image-text': return 'Image-Text Block';
      case 'content-grid': return 'Content Grid';
      case 'banner': return 'Hero Banner';
      case 'testimonials': return 'Testimonials';
      case 'timeline': return 'Timeline';
      default: return 'Block';
    }
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>
          <Settings size={18} color="#6b7280" />
          <TitleText>{getBlockName()} Settings</TitleText>
        </PanelTitle>
        <CloseButton onClick={onClose} title="Close">
          <X size={20} />
        </CloseButton>
      </PanelHeader>
      
      <TabsContainer>
        <Tab 
          $active={activeTab === 'content'} 
          onClick={() => setActiveTab('content')}
        >
          <Settings size={14} />
          Content
        </Tab>
        <Tab 
          $active={activeTab === 'style'} 
          onClick={() => setActiveTab('style')}
        >
          <Sparkles size={14} />
          Style & Animation
        </Tab>
      </TabsContainer>

      <PanelContent>
        {activeTab === 'content' ? (
          renderSettings()
        ) : (
          <>
            {block.type === 'banner' && (
              <BannerStyleSettings block={block as BannerBlock} onUpdate={onUpdate} />
            )}
            <AnimationSettingsPanel block={block} onUpdate={onUpdate} />
          </>
        )}
      </PanelContent>
    </PanelContainer>
  );
};
