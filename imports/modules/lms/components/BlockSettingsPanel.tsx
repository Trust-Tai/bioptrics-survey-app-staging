import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Settings, Plus, Trash2, Sparkles, Palette } from 'lucide-react';
import type { ContentBlock, RichTextBlock, ImageBlock, VideoBlock, VideoPlayerBlock, AudioPlayerBlock, PDFBlock, FileDownloadBlock, FileItem, AccordionBlock, AccordionPanel, CalloutBlock, ButtonBlock, QuizBlock, QuizQuestion, QuizAnswer, TabsBlock, TabItem, DividerBlock, FlipboxesBlock, FlipboxItem, ImageTextBlock, ContentGridBlock, GridCardItem, BannerBlock, BannerButton, TestimonialsBlock, TestimonialItem, TimelineBlock, TimelineItem, AnimationType, AnimationSettings, AnimationTrigger } from '../types/contentBlocks';

interface BlockSettingsPanelProps {
  block: ContentBlock;
  onUpdate: (settings: any) => void;
  onClose: () => void;
}

const PanelContainer = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TitleText = styled.h3`
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

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.$active ? '#6366f1' : '#6b7280'};
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#6366f1' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    color: ${props => props.$active ? '#6366f1' : '#374151'};
    background: ${props => props.$active ? 'white' : '#f3f4f6'};
  }
`;

const TabContent = styled.div`
  padding: 20px;
`;

const SettingGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
  transition: all 0.2s;
  
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s;
  
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const ColorInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 4px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #374151;
  cursor: pointer;
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 16px 0;
`;

const HelpText = styled.p`
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #6b7280;
`;

const FileListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
`;

const FileItemCard = styled.div`
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

const FileItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const FileItemTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

const DeleteFileButton = styled.button`
  padding: 4px;
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #fee2e2;
  }
`;

const AddFileButton = styled.button`
  width: 100%;
  padding: 10px;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    border-color: #9ca3af;
    background: #f9fafb;
    color: #374151;
  }
`;

const SmallInput = styled(Input)`
  font-size: 13px;
  padding: 6px 10px;
`;

const SectionDivider = styled.div`
  margin: 24px 0 16px 0;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const RangeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RangeInput = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  appearance: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6366f1;
    cursor: pointer;
  }
`;

const RangeValue = styled.span`
  font-size: 13px;
  color: #6b7280;
  min-width: 40px;
  text-align: right;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
`;

const RadioInput = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const ItemTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const ItemTab = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${props => props.$active ? '#6366f1' : '#e5e7eb'};
  background: ${props => props.$active ? '#eef2ff' : 'white'};
  color: ${props => props.$active ? '#6366f1' : '#6b7280'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #6366f1;
    color: #6366f1;
  }
`;

const DeleteItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
  
  &:hover {
    background: #fee2e2;
    border-color: #fca5a5;
  }
`;

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

// Rich Text Settings
const RichTextSettings: React.FC<{ block: RichTextBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  return (
    <>
      <SettingGroup>
        <Label>Font Size</Label>
        <Input
          type="text"
          value={block.settings.fontSize || '16px'}
          onChange={e => onUpdate({ fontSize: e.target.value })}
          placeholder="16px"
        />
        <HelpText>Enter size with unit (e.g., 16px, 1rem)</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Text Alignment</Label>
        <Select
          value={block.settings.textAlign || 'left'}
          onChange={e => onUpdate({ textAlign: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Text Color</Label>
        <ColorInput
          type="color"
          value={block.settings.textColor || '#374151'}
          onChange={e => onUpdate({ textColor: e.target.value })}
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Background Color</Label>
        <ColorInput
          type="color"
          value={block.settings.backgroundColor || '#ffffff'}
          onChange={e => onUpdate({ backgroundColor: e.target.value })}
        />
        <HelpText>Use #ffffff for transparent</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Padding</Label>
        <Input
          type="text"
          value={block.settings.padding || '16px'}
          onChange={e => onUpdate({ padding: e.target.value })}
          placeholder="16px"
        />
      </SettingGroup>
    </>
  );
};

// Image Settings
const ImageSettings: React.FC<{ block: ImageBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  return (
    <>
      <SettingGroup>
        <Label>Alt Text</Label>
        <Input
          type="text"
          value={block.settings.altText || ''}
          onChange={e => onUpdate({ altText: e.target.value })}
          placeholder="Describe the image"
        />
        <HelpText>Important for accessibility and SEO</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Caption</Label>
        <Textarea
          value={block.settings.caption || ''}
          onChange={e => onUpdate({ caption: e.target.value })}
          placeholder="Optional image caption"
        />
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showCaption"
            checked={block.settings.showCaption !== false}
            onChange={e => onUpdate({ showCaption: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showCaption">Show caption</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Alignment</Label>
        <Select
          value={block.settings.alignment || 'center'}
          onChange={e => onUpdate({ alignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Max Width</Label>
        <Input
          type="text"
          value={block.settings.maxWidth || '100%'}
          onChange={e => onUpdate({ maxWidth: e.target.value })}
          placeholder="100%"
        />
        <HelpText>E.g., 100%, 600px, 50%</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Border Radius</Label>
        <Input
          type="text"
          value={block.settings.borderRadius || '8px'}
          onChange={e => onUpdate({ borderRadius: e.target.value })}
          placeholder="8px"
        />
      </SettingGroup>
    </>
  );
};

// Video Settings
const VideoSettings: React.FC<{ block: VideoBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  return (
    <>
      <SettingGroup>
        <Label>Video Title</Label>
        <Input
          type="text"
          value={block.settings.title || ''}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Video title (optional)"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Aspect Ratio</Label>
        <Select
          value={block.settings.aspectRatio || '16:9'}
          onChange={e => onUpdate({ aspectRatio: e.target.value })}
        >
          <option value="16:9">16:9 (Widescreen)</option>
          <option value="4:3">4:3 (Standard)</option>
          <option value="1:1">1:1 (Square)</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Playback Options</Label>
        
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="showControls"
            checked={block.settings.showControls !== false}
            onChange={e => onUpdate({ showControls: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showControls">Show player controls</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="autoplay"
            checked={block.settings.autoplay || false}
            onChange={e => onUpdate({ autoplay: e.target.checked })}
          />
          <CheckboxLabel htmlFor="autoplay">Autoplay video</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="muted"
            checked={block.settings.muted || false}
            onChange={e => onUpdate({ muted: e.target.checked })}
          />
          <CheckboxLabel htmlFor="muted">Muted by default</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="loop"
            checked={block.settings.loop || false}
            onChange={e => onUpdate({ loop: e.target.checked })}
          />
          <CheckboxLabel htmlFor="loop">Loop video</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <Label>Start Time (seconds)</Label>
        <Input
          type="number"
          min="0"
          value={block.settings.startTime || 0}
          onChange={e => onUpdate({ startTime: parseInt(e.target.value) || 0 })}
          placeholder="0"
        />
        <HelpText>Start video at specific timestamp</HelpText>
      </SettingGroup>
    </>
  );
};

// Video Player Settings
const VideoPlayerSettings: React.FC<{ block: VideoPlayerBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const posterInputRef = React.useRef<HTMLInputElement>(null);

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ posterUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Video Title</Label>
        <Input
          type="text"
          value={block.settings.title || ''}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Video title (optional)"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Poster Image (Thumbnail)</Label>
        {block.settings.posterUrl && (
          <div style={{ marginBottom: '8px' }}>
            <img 
              src={block.settings.posterUrl} 
              alt="Poster" 
              style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }} 
            />
          </div>
        )}
        <button
          onClick={() => posterInputRef.current?.click()}
          style={{
            padding: '8px 16px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {block.settings.posterUrl ? 'Change Poster' : 'Upload Poster'}
        </button>
        <input
          ref={posterInputRef}
          type="file"
          accept="image/*"
          onChange={handlePosterUpload}
          style={{ display: 'none' }}
        />
        <HelpText>Thumbnail shown before video plays</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Aspect Ratio</Label>
        <Select
          value={block.settings.aspectRatio || '16:9'}
          onChange={e => onUpdate({ aspectRatio: e.target.value })}
        >
          <option value="16:9">16:9 (Widescreen)</option>
          <option value="4:3">4:3 (Standard)</option>
          <option value="1:1">1:1 (Square)</option>
          <option value="auto">Auto (Original Size)</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Playback Options</Label>
        
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="controls-player"
            checked={block.settings.controls !== false}
            onChange={e => onUpdate({ controls: e.target.checked })}
          />
          <CheckboxLabel htmlFor="controls-player">Show player controls</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="autoplay-player"
            checked={block.settings.autoplay || false}
            onChange={e => onUpdate({ autoplay: e.target.checked })}
          />
          <CheckboxLabel htmlFor="autoplay-player">Autoplay video</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="muted-player"
            checked={block.settings.muted || false}
            onChange={e => onUpdate({ muted: e.target.checked })}
          />
          <CheckboxLabel htmlFor="muted-player">Muted by default</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="loop-player"
            checked={block.settings.loop || false}
            onChange={e => onUpdate({ loop: e.target.checked })}
          />
          <CheckboxLabel htmlFor="loop-player">Loop video</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <Label>Preload</Label>
        <Select
          value={block.settings.preload || 'metadata'}
          onChange={e => onUpdate({ preload: e.target.value })}
        >
          <option value="none">None</option>
          <option value="metadata">Metadata Only</option>
          <option value="auto">Auto (Full Video)</option>
        </Select>
        <HelpText>How much video to load before playing</HelpText>
      </SettingGroup>
    </>
  );
};

// Audio Player Settings
const AudioPlayerSettings: React.FC<{ block: AudioPlayerBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ coverImageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Track Title</Label>
        <Input
          type="text"
          value={block.settings.title || ''}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Enter track title"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Artist Name</Label>
        <Input
          type="text"
          value={block.settings.artist || ''}
          onChange={e => onUpdate({ artist: e.target.value })}
          placeholder="Enter artist name (optional)"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Cover Image (Album Art)</Label>
        {block.settings.coverImageUrl && (
          <div style={{ marginBottom: '8px' }}>
            <img 
              src={block.settings.coverImageUrl} 
              alt="Cover" 
              style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }} 
            />
          </div>
        )}
        <button
          onClick={() => coverInputRef.current?.click()}
          style={{
            padding: '8px 16px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {block.settings.coverImageUrl ? 'Change Cover' : 'Upload Cover'}
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          style={{ display: 'none' }}
        />
        <HelpText>Album art or thumbnail image</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Player Type</Label>
        <Select
          value={block.settings.playerType || 'static'}
          onChange={e => onUpdate({ playerType: e.target.value })}
        >
          <option value="static">Static (Inline)</option>
          <option value="sticky">Sticky (Fixed Bottom)</option>
        </Select>
        <HelpText>Static: Inline player • Sticky: Fixed at bottom of screen</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Playback Options</Label>
        
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="controls-audio"
            checked={block.settings.controls !== false}
            onChange={e => onUpdate({ controls: e.target.checked })}
          />
          <CheckboxLabel htmlFor="controls-audio">Show player controls</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="autoplay-audio"
            checked={block.settings.autoplay || false}
            onChange={e => onUpdate({ autoplay: e.target.checked })}
          />
          <CheckboxLabel htmlFor="autoplay-audio">Autoplay audio</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="loop-audio"
            checked={block.settings.loop || false}
            onChange={e => onUpdate({ loop: e.target.checked })}
          />
          <CheckboxLabel htmlFor="loop-audio">Loop audio</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="download-audio"
            checked={block.settings.showDownload !== false}
            onChange={e => onUpdate({ showDownload: e.target.checked })}
          />
          <CheckboxLabel htmlFor="download-audio">Show download button</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <Label>Default Volume</Label>
        <Input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={block.settings.volume || 0.8}
          onChange={e => onUpdate({ volume: parseFloat(e.target.value) })}
        />
        <HelpText>Volume: {Math.round((block.settings.volume || 0.8) * 100)}%</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Preload</Label>
        <Select
          value={block.settings.preload || 'metadata'}
          onChange={e => onUpdate({ preload: e.target.value })}
        >
          <option value="none">None</option>
          <option value="metadata">Metadata Only</option>
          <option value="auto">Auto (Full Audio)</option>
        </Select>
        <HelpText>How much audio to load before playing</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={block.settings.backgroundColor || '#ffffff'}
          onChange={e => onUpdate({ backgroundColor: e.target.value })}
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Accent Color</Label>
        <Input
          type="color"
          value={block.settings.accentColor || '#6366f1'}
          onChange={e => onUpdate({ accentColor: e.target.value })}
        />
        <HelpText>Color for play button and progress bar</HelpText>
      </SettingGroup>
    </>
  );
};

// PDF Settings
const PDFSettings: React.FC<{ block: PDFBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // Create a temporary URL for the PDF
      const pdfUrl = URL.createObjectURL(file);
      onUpdate({ 
        pdfUrl,
        fileName: file.name 
      });
    } else {
      alert('Please select a valid PDF file');
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>PDF Document</Label>
        <Input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileUpload}
        />
        {block.settings.fileName && (
          <HelpText>Current file: {block.settings.fileName}</HelpText>
        )}
      </SettingGroup>

      <SettingGroup>
        <Label>File Name (Display)</Label>
        <Input
          type="text"
          value={block.settings.fileName || ''}
          onChange={e => onUpdate({ fileName: e.target.value })}
          placeholder="document.pdf"
        />
        <HelpText>Name shown to users</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>PDF URL (Alternative)</Label>
        <Input
          type="url"
          value={block.settings.pdfUrl || ''}
          onChange={e => onUpdate({ pdfUrl: e.target.value })}
          placeholder="https://example.com/document.pdf"
        />
        <HelpText>Or paste a direct link to a PDF file</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Display Height</Label>
        <Select
          value={block.settings.displayHeight || '600px'}
          onChange={e => onUpdate({ displayHeight: e.target.value })}
        >
          <option value="400px">Small (400px)</option>
          <option value="600px">Medium (600px)</option>
          <option value="800px">Large (800px)</option>
          <option value="100vh">Full Screen</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Download Options</Label>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="allowDownload"
            checked={block.settings.allowDownload !== false}
            onChange={e => onUpdate({ allowDownload: e.target.checked })}
          />
          <CheckboxLabel htmlFor="allowDownload">Allow users to download PDF</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>
    </>
  );
};

// File Download Settings
const FileDownloadSettings: React.FC<{ block: FileDownloadBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const files = block.settings?.files || [];

  const handleAddFile = () => {
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: 'New File',
      displayName: '',
      description: '',
      url: '',
      type: '',
      size: '',
    };
    onUpdate({ files: [...files, newFile] });
  };

  const handleRemoveFile = (fileId: string) => {
    onUpdate({ files: files.filter((f: FileItem) => f.id !== fileId) });
  };

  const handleUpdateFile = (fileId: string, updates: Partial<FileItem>) => {
    onUpdate({
      files: files.map((f: FileItem) => 
        f.id === fileId ? { ...f, ...updates } : f
      ),
    });
  };

  const handleFileUpload = (fileId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      handleUpdateFile(fileId, {
        url: fileUrl,
        name: file.name,
        displayName: file.name,
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
        size: file.size,
      });
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Files</Label>
        <FileListContainer>
          {files.map((file: FileItem, index: number) => (
            <FileItemCard key={file.id}>
              <FileItemHeader>
                <FileItemTitle>File {index + 1}</FileItemTitle>
                <DeleteFileButton
                  onClick={() => handleRemoveFile(file.id)}
                  title="Remove file"
                >
                  <Trash2 size={16} />
                </DeleteFileButton>
              </FileItemHeader>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Upload File</Label>
                <Input
                  type="file"
                  onChange={(e) => handleFileUpload(file.id, e)}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
                {file.name && (
                  <HelpText>Current: {file.name}</HelpText>
                )}
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Display Name</Label>
                <SmallInput
                  type="text"
                  value={file.displayName || ''}
                  onChange={(e) => handleUpdateFile(file.id, { displayName: e.target.value })}
                  placeholder="File name to display"
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>File URL (Alternative)</Label>
                <SmallInput
                  type="url"
                  value={file.url}
                  onChange={(e) => handleUpdateFile(file.id, { url: e.target.value })}
                  placeholder="https://example.com/file.pdf"
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Description</Label>
                <Textarea
                  value={file.description || ''}
                  onChange={(e) => handleUpdateFile(file.id, { description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <Label style={{ fontSize: '12px', marginBottom: '4px' }}>File Type</Label>
                  <SmallInput
                    type="text"
                    value={file.type || ''}
                    onChange={(e) => handleUpdateFile(file.id, { type: e.target.value })}
                    placeholder="PDF"
                  />
                </div>
                <div>
                  <Label style={{ fontSize: '12px', marginBottom: '4px' }}>File Size</Label>
                  <SmallInput
                    type="text"
                    value={file.size || ''}
                    onChange={(e) => handleUpdateFile(file.id, { size: e.target.value })}
                    placeholder="2.5 MB"
                  />
                </div>
              </div>
            </FileItemCard>
          ))}
        </FileListContainer>

        <AddFileButton onClick={handleAddFile}>
          <Plus size={16} />
          Add File
        </AddFileButton>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Button Style</Label>
        <Select
          value={block.settings?.buttonStyle || 'button'}
          onChange={(e) => onUpdate({ buttonStyle: e.target.value })}
        >
          <option value="button">Button</option>
          <option value="card">Card Style</option>
          <option value="link">Text Link</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Display Options</Label>
        
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="showFileSize"
            checked={block.settings?.showFileSize !== false}
            onChange={(e) => onUpdate({ showFileSize: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showFileSize">Show file size</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="showFileType"
            checked={block.settings?.showFileType !== false}
            onChange={(e) => onUpdate({ showFileType: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showFileType">Show file type</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showDescription"
            checked={block.settings?.showDescription !== false}
            onChange={(e) => onUpdate({ showDescription: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showDescription">Show descriptions</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <Label>Analytics & Security</Label>
        
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="trackDownloads"
            checked={block.settings?.trackDownloads !== false}
            onChange={(e) => onUpdate({ trackDownloads: e.target.checked })}
          />
          <CheckboxLabel htmlFor="trackDownloads">Track download analytics</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="requireLogin"
            checked={block.settings?.requireLogin || false}
            onChange={(e) => onUpdate({ requireLogin: e.target.checked })}
          />
          <CheckboxLabel htmlFor="requireLogin">Require login to download</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>
    </>
  );
};

// Accordion Settings
const AccordionSettings: React.FC<{ block: AccordionBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const panels = block.settings?.panels || [];

  const handleAddPanel = () => {
    const newPanel: AccordionPanel = {
      id: `panel-${Date.now()}`,
      title: 'New Section',
      content: '<p>Add your content here...</p>',
    };
    onUpdate({ panels: [...panels, newPanel] });
  };

  const handleRemovePanel = (panelId: string) => {
    onUpdate({ panels: panels.filter((p: AccordionPanel) => p.id !== panelId) });
  };

  const handleUpdatePanel = (panelId: string, updates: Partial<AccordionPanel>) => {
    onUpdate({
      panels: panels.map((p: AccordionPanel) => 
        p.id === panelId ? { ...p, ...updates } : p
      ),
    });
  };

  const toggleDefaultExpanded = (panelId: string) => {
    const defaultExpanded = block.settings?.defaultExpanded || [];
    const isExpanded = defaultExpanded.includes(panelId);
    
    if (isExpanded) {
      onUpdate({ defaultExpanded: defaultExpanded.filter(id => id !== panelId) });
    } else {
      onUpdate({ defaultExpanded: [...defaultExpanded, panelId] });
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Accordion Panels</Label>
        <FileListContainer>
          {panels.map((panel: AccordionPanel, index: number) => (
            <FileItemCard key={panel.id}>
              <FileItemHeader>
                <FileItemTitle>Section {index + 1}</FileItemTitle>
                <DeleteFileButton
                  onClick={() => handleRemovePanel(panel.id)}
                  title="Remove panel"
                >
                  <Trash2 size={16} />
                </DeleteFileButton>
              </FileItemHeader>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Section Title</Label>
                <SmallInput
                  type="text"
                  value={panel.title}
                  onChange={(e) => handleUpdatePanel(panel.id, { title: e.target.value })}
                  placeholder="Section title"
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Content</Label>
                <Textarea
                  value={panel.content}
                  onChange={(e) => handleUpdatePanel(panel.id, { content: e.target.value })}
                  placeholder="Add content here..."
                  rows={4}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
                <HelpText>Supports HTML formatting</HelpText>
              </div>

              <CheckboxWrapper>
                <Checkbox
                  type="checkbox"
                  id={`expanded-${panel.id}`}
                  checked={(block.settings?.defaultExpanded || []).includes(panel.id)}
                  onChange={() => toggleDefaultExpanded(panel.id)}
                />
                <CheckboxLabel htmlFor={`expanded-${panel.id}`}>
                  Open by default
                </CheckboxLabel>
              </CheckboxWrapper>
            </FileItemCard>
          ))}
        </FileListContainer>

        <AddFileButton onClick={handleAddPanel}>
          <Plus size={16} />
          Add Panel
        </AddFileButton>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Behavior</Label>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="allowMultipleOpen"
            checked={block.settings?.allowMultipleOpen || false}
            onChange={(e) => onUpdate({ allowMultipleOpen: e.target.checked })}
          />
          <CheckboxLabel htmlFor="allowMultipleOpen">
            Allow multiple sections open
          </CheckboxLabel>
        </CheckboxWrapper>
        <HelpText>If disabled, opening a section will close others</HelpText>
      </SettingGroup>
    </>
  );
};

// Callout Settings
const CalloutSettings: React.FC<{ block: CalloutBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  return (
    <>
      <SettingGroup>
        <Label>Callout Type</Label>
        <Select
          value={block.settings?.calloutType || 'info'}
          onChange={(e) => onUpdate({ calloutType: e.target.value })}
        >
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </Select>
        <HelpText>Choose the callout message type</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Style Variant</Label>
        <Select
          value={block.settings?.variant || 'bordered'}
          onChange={(e) => onUpdate({ variant: e.target.value })}
        >
          <option value="bordered">Bordered (Left accent)</option>
          <option value="filled">Filled (Solid background)</option>
          <option value="outlined">Outlined (Border only)</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={block.settings?.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Optional title"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Content</Label>
        <Textarea
          value={block.settings?.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Add your message here..."
          rows={6}
        />
        <HelpText>Supports HTML formatting</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Display Options</Label>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showIcon"
            checked={block.settings?.showIcon !== false}
            onChange={(e) => onUpdate({ showIcon: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showIcon">Show icon</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>
    </>
  );
};

// Button Settings
const ButtonSettings: React.FC<{ block: ButtonBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  return (
    <>
      <SettingGroup>
        <Label>Button Text</Label>
        <Input
          type="text"
          value={block.settings?.buttonText || ''}
          onChange={(e) => onUpdate({ buttonText: e.target.value })}
          placeholder="Click Here"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Button URL</Label>
        <Input
          type="url"
          value={block.settings?.buttonUrl || ''}
          onChange={(e) => onUpdate({ buttonUrl: e.target.value })}
          placeholder="https://example.com"
        />
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="openInNewTab"
            checked={block.settings?.openInNewTab || false}
            onChange={(e) => onUpdate({ openInNewTab: e.target.checked })}
          />
          <CheckboxLabel htmlFor="openInNewTab">Open in new tab</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Button Style</Label>
        <Select
          value={block.settings?.buttonStyle || 'primary'}
          onChange={(e) => onUpdate({ buttonStyle: e.target.value })}
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
          <option value="ghost">Ghost</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Button Size</Label>
        <Select
          value={block.settings?.buttonSize || 'medium'}
          onChange={(e) => onUpdate({ buttonSize: e.target.value })}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Alignment</Label>
        <Select
          value={block.settings?.alignment || 'left'}
          onChange={(e) => onUpdate({ alignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Icon</Label>
        <Select
          value={block.settings?.icon || 'none'}
          onChange={(e) => onUpdate({ icon: e.target.value })}
        >
          <option value="none">None</option>
          <option value="arrow-right">Arrow Right</option>
          <option value="external">External Link</option>
          <option value="download">Download</option>
          <option value="check">Checkmark</option>
        </Select>
      </SettingGroup>

      {block.settings?.icon && block.settings.icon !== 'none' && (
        <SettingGroup>
          <Label>Icon Position</Label>
          <Select
            value={block.settings?.iconPosition || 'right'}
            onChange={(e) => onUpdate({ iconPosition: e.target.value })}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </Select>
        </SettingGroup>
      )}

      <Divider />

      <SettingGroup>
        <Label>Background Color</Label>
        <ColorInput
          type="color"
          value={block.settings?.backgroundColor || '#3b82f6'}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Text Color</Label>
        <ColorInput
          type="color"
          value={block.settings?.textColor || '#ffffff'}
          onChange={(e) => onUpdate({ textColor: e.target.value })}
        />
      </SettingGroup>
    </>
  );
};

// Quiz Settings
const QuizSettings: React.FC<{ block: QuizBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const questions = block.settings?.questions || [];

  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `question-${Date.now()}`,
      question: 'New Question',
      answers: [
        { id: `answer-${Date.now()}-1`, text: 'Answer 1' },
        { id: `answer-${Date.now()}-2`, text: 'Answer 2' },
      ],
      correctAnswer: '',
      explanation: '',
    };
    onUpdate({ questions: [...questions, newQuestion] });
  };

  const handleRemoveQuestion = (questionId: string) => {
    onUpdate({ questions: questions.filter((q: QuizQuestion) => q.id !== questionId) });
  };

  const handleUpdateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    onUpdate({
      questions: questions.map((q: QuizQuestion) => 
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const handleAddAnswer = (questionId: string) => {
    const question = questions.find((q: QuizQuestion) => q.id === questionId);
    if (question) {
      const newAnswer: QuizAnswer = {
        id: `answer-${Date.now()}`,
        text: 'New Answer',
      };
      handleUpdateQuestion(questionId, {
        answers: [...(question.answers || []), newAnswer],
      });
    }
  };

  const handleRemoveAnswer = (questionId: string, answerId: string) => {
    const question = questions.find((q: QuizQuestion) => q.id === questionId);
    if (question) {
      handleUpdateQuestion(questionId, {
        answers: (question.answers || []).filter((a: QuizAnswer) => a.id !== answerId),
      });
    }
  };

  const handleUpdateAnswer = (questionId: string, answerId: string, text: string) => {
    const question = questions.find((q: QuizQuestion) => q.id === questionId);
    if (question) {
      handleUpdateQuestion(questionId, {
        answers: (question.answers || []).map((a: QuizAnswer) =>
          a.id === answerId ? { ...a, text } : a
        ),
      });
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Quiz Questions</Label>
        <FileListContainer>
          {questions.map((question: QuizQuestion, index: number) => (
            <FileItemCard key={question.id}>
              <FileItemHeader>
                <FileItemTitle>Question {index + 1}</FileItemTitle>
                <DeleteFileButton
                  onClick={() => handleRemoveQuestion(question.id)}
                  title="Remove question"
                >
                  <Trash2 size={16} />
                </DeleteFileButton>
              </FileItemHeader>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Question Text</Label>
                <Textarea
                  value={question.question}
                  onChange={(e) => handleUpdateQuestion(question.id, { question: e.target.value })}
                  placeholder="Enter your question"
                  rows={2}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Answers</Label>
                {(question.answers || []).map((answer: QuizAnswer) => (
                  <div key={answer.id} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <SmallInput
                      type="text"
                      value={answer.text}
                      onChange={(e) => handleUpdateAnswer(question.id, answer.id, e.target.value)}
                      placeholder="Answer text"
                    />
                    <DeleteFileButton
                      onClick={() => handleRemoveAnswer(question.id, answer.id)}
                      title="Remove answer"
                      style={{ flexShrink: 0 }}
                    >
                      <Trash2 size={14} />
                    </DeleteFileButton>
                  </div>
                ))}
                <button
                  onClick={() => handleAddAnswer(question.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  + Add Answer
                </button>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Correct Answer</Label>
                <Select
                  value={question.correctAnswer || ''}
                  onChange={(e) => handleUpdateQuestion(question.id, { correctAnswer: e.target.value })}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                >
                  <option value="">Select correct answer</option>
                  {(question.answers || []).map((answer: QuizAnswer) => (
                    <option key={answer.id} value={answer.id}>
                      {answer.text}
                    </option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Explanation (Optional)</Label>
                <Textarea
                  value={question.explanation || ''}
                  onChange={(e) => handleUpdateQuestion(question.id, { explanation: e.target.value })}
                  placeholder="Explain the correct answer"
                  rows={2}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
              </div>
            </FileItemCard>
          ))}
        </FileListContainer>

        <AddFileButton onClick={handleAddQuestion}>
          <Plus size={16} />
          Add Question
        </AddFileButton>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Quiz Options</Label>
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="showScoreImmediately"
            checked={block.settings?.showScoreImmediately !== false}
            onChange={(e) => onUpdate({ showScoreImmediately: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showScoreImmediately">Show score immediately</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="allowRetry"
            checked={block.settings?.allowRetry !== false}
            onChange={(e) => onUpdate({ allowRetry: e.target.checked })}
          />
          <CheckboxLabel htmlFor="allowRetry">Allow retry</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>
    </>
  );
};

// Tabs Settings
const TabsSettings: React.FC<{ block: TabsBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const tabs = block.settings?.tabs || [];

  const handleAddTab = () => {
    const newTab: TabItem = {
      id: `tab-${Date.now()}`,
      label: 'New Tab',
      content: '<p>Add your content here...</p>',
    };
    onUpdate({ tabs: [...tabs, newTab] });
  };

  const handleRemoveTab = (tabId: string) => {
    onUpdate({ tabs: tabs.filter((t: TabItem) => t.id !== tabId) });
    // If removing default tab, reset it
    if (block.settings?.defaultTab === tabId) {
      onUpdate({ defaultTab: tabs.length > 1 ? tabs.find((t: TabItem) => t.id !== tabId)?.id : '' });
    }
  };

  const handleUpdateTab = (tabId: string, updates: Partial<TabItem>) => {
    onUpdate({
      tabs: tabs.map((t: TabItem) => 
        t.id === tabId ? { ...t, ...updates } : t
      ),
    });
  };

  return (
    <>
      <SettingGroup>
        <Label>Tabs</Label>
        <FileListContainer>
          {tabs.map((tab: TabItem, index: number) => (
            <FileItemCard key={tab.id}>
              <FileItemHeader>
                <FileItemTitle>Tab {index + 1}</FileItemTitle>
                <DeleteFileButton
                  onClick={() => handleRemoveTab(tab.id)}
                  title="Remove tab"
                >
                  <Trash2 size={16} />
                </DeleteFileButton>
              </FileItemHeader>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Tab Label</Label>
                <SmallInput
                  type="text"
                  value={tab.label}
                  onChange={(e) => handleUpdateTab(tab.id, { label: e.target.value })}
                  placeholder="Tab name"
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '4px' }}>Tab Content</Label>
                <Textarea
                  value={tab.content}
                  onChange={(e) => handleUpdateTab(tab.id, { content: e.target.value })}
                  placeholder="Add content here..."
                  rows={4}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                />
                <HelpText>Supports HTML formatting</HelpText>
              </div>

              <CheckboxWrapper>
                <Checkbox
                  type="checkbox"
                  id={`default-${tab.id}`}
                  checked={block.settings?.defaultTab === tab.id}
                  onChange={(e) => onUpdate({ defaultTab: e.target.checked ? tab.id : '' })}
                />
                <CheckboxLabel htmlFor={`default-${tab.id}`}>
                  Set as default tab
                </CheckboxLabel>
              </CheckboxWrapper>
            </FileItemCard>
          ))}
        </FileListContainer>

        <AddFileButton onClick={handleAddTab}>
          <Plus size={16} />
          Add Tab
        </AddFileButton>
      </SettingGroup>
    </>
  );
};

// Divider Settings
const DividerSettings: React.FC<{ block: DividerBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  return (
    <>
      <SettingGroup>
        <Label>Divider Style</Label>
        <Select
          value={block.settings?.dividerStyle || 'solid'}
          onChange={(e) => onUpdate({ dividerStyle: e.target.value })}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
          <option value="gradient">Gradient</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Color</Label>
        <ColorInput
          type="color"
          value={block.settings?.color || '#e5e7eb'}
          onChange={(e) => onUpdate({ color: e.target.value })}
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Thickness</Label>
        <Input
          type="text"
          value={block.settings?.thickness || '2px'}
          onChange={(e) => onUpdate({ thickness: e.target.value })}
          placeholder="2px"
        />
        <HelpText>Enter size with unit (e.g., 2px, 4px)</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Spacing (Top/Bottom)</Label>
        <Input
          type="text"
          value={block.settings?.spacing || '16px'}
          onChange={(e) => onUpdate({ spacing: e.target.value })}
          placeholder="16px"
        />
        <HelpText>Space above and below divider</HelpText>
      </SettingGroup>
    </>
  );
};

// Flipboxes Settings
const FlipboxesSettings: React.FC<{ block: FlipboxesBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const flipboxes = block.settings?.flipboxes || [];

  const handleAddFlipbox = () => {
    const newFlipbox: FlipboxItem = {
      id: `flipbox-${Date.now()}`,
      frontTitle: 'Front Title',
      frontDescription: 'Front description',
      frontIcon: '✨',
      backTitle: 'Back Title',
      backDescription: 'Back description',
      backIcon: '💡',
    };
    onUpdate({ flipboxes: [...flipboxes, newFlipbox] });
  };

  const handleRemoveFlipbox = (flipboxId: string) => {
    onUpdate({ flipboxes: flipboxes.filter((f: FlipboxItem) => f.id !== flipboxId) });
  };

  const handleUpdateFlipbox = (flipboxId: string, updates: Partial<FlipboxItem>) => {
    onUpdate({
      flipboxes: flipboxes.map((f: FlipboxItem) => 
        f.id === flipboxId ? { ...f, ...updates } : f
      ),
    });
  };

  return (
    <>
      <SettingGroup>
        <Label>Flipboxes</Label>
        <FileListContainer>
          {flipboxes.map((flipbox: FlipboxItem, index: number) => (
            <FileItemCard key={flipbox.id}>
              <FileItemHeader>
                <FileItemTitle>Flipbox {index + 1}</FileItemTitle>
                <DeleteFileButton
                  onClick={() => handleRemoveFlipbox(flipbox.id)}
                  title="Remove flipbox"
                >
                  <Trash2 size={16} />
                </DeleteFileButton>
              </FileItemHeader>

              <div style={{ marginBottom: '12px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>Front Side</Label>
                
                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Icon/Emoji</Label>
                  <SmallInput
                    type="text"
                    value={flipbox.frontIcon || ''}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontIcon: e.target.value })}
                    placeholder="✨"
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Title</Label>
                  <SmallInput
                    type="text"
                    value={flipbox.frontTitle}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontTitle: e.target.value })}
                    placeholder="Front title"
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Description</Label>
                  <Textarea
                    value={flipbox.frontDescription || ''}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontDescription: e.target.value })}
                    placeholder="Front description"
                    rows={2}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>BG Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.frontBgColor || block.settings?.frontBgColor || '#3b82f6'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontBgColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Text Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.frontTextColor || block.settings?.frontTextColor || '#ffffff'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontTextColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Divider />

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>Back Side</Label>
                
                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Icon/Emoji</Label>
                  <SmallInput
                    type="text"
                    value={flipbox.backIcon || ''}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { backIcon: e.target.value })}
                    placeholder="💡"
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Title</Label>
                  <SmallInput
                    type="text"
                    value={flipbox.backTitle}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { backTitle: e.target.value })}
                    placeholder="Back title"
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Description</Label>
                  <Textarea
                    value={flipbox.backDescription || ''}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { backDescription: e.target.value })}
                    placeholder="Back description"
                    rows={2}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>BG Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.backBgColor || block.settings?.backBgColor || '#1e40af'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { backBgColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Text Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.backTextColor || block.settings?.backTextColor || '#ffffff'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { backTextColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </FileItemCard>
          ))}
        </FileListContainer>

        <AddFileButton onClick={handleAddFlipbox}>
          <Plus size={16} />
          Add Flipbox
        </AddFileButton>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Grid Layout</Label>
        <Select
          value={block.settings?.columns || 3}
          onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })}
        >
          <option value="1">1 Column</option>
          <option value="2">2 Columns</option>
          <option value="3">3 Columns</option>
          <option value="4">4 Columns</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Flipbox Height</Label>
        <Input
          type="text"
          value={block.settings?.height || '300px'}
          onChange={(e) => onUpdate({ height: e.target.value })}
          placeholder="300px"
        />
        <HelpText>Enter size with unit (e.g., 300px, 20rem)</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Default Colors (Front)</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Background</Label>
            <ColorInput
              type="color"
              value={block.settings?.frontBgColor || '#3b82f6'}
              onChange={(e) => onUpdate({ frontBgColor: e.target.value })}
            />
          </div>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Text</Label>
            <ColorInput
              type="color"
              value={block.settings?.frontTextColor || '#ffffff'}
              onChange={(e) => onUpdate({ frontTextColor: e.target.value })}
            />
          </div>
        </div>
        <HelpText>Applied to new flipboxes</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Default Colors (Back)</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Background</Label>
            <ColorInput
              type="color"
              value={block.settings?.backBgColor || '#1e40af'}
              onChange={(e) => onUpdate({ backBgColor: e.target.value })}
            />
          </div>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Text</Label>
            <ColorInput
              type="color"
              value={block.settings?.backTextColor || '#ffffff'}
              onChange={(e) => onUpdate({ backTextColor: e.target.value })}
            />
          </div>
        </div>
        <HelpText>Applied to new flipboxes</HelpText>
      </SettingGroup>
    </>
  );
};

// Image-Text Settings (matching reference design)
const ImageTextSettings: React.FC<{ block: ImageTextBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Default placeholder image
  const defaultImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop';
  const currentImage = block.settings?.imageUrl || defaultImage;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local URL for the uploaded file
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate({ imageUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <SettingGroup>
        <Label>Image Source</Label>
        <ImageUploadContainer>
          <ChangeImageButton onClick={handleChangeImage}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Change Image
          </ChangeImageButton>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <ImagePreview src={currentImage} alt="Preview" />
        </ImageUploadContainer>
        <HelpText>Click "Change Image" to upload from your computer</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Or enter image URL</Label>
        <Input
          type="url"
          value={block.settings?.imageUrl || ''}
          onChange={(e) => onUpdate({ imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Alt Text</Label>
        <Input
          type="text"
          value={block.settings?.imageAlt || ''}
          onChange={(e) => onUpdate({ imageAlt: e.target.value })}
          placeholder="Sample image"
        />
        <HelpText>Describe the image for accessibility</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Add Heading</Label>
        <Input
          type="text"
          value={block.settings?.heading || ''}
          onChange={(e) => onUpdate({ heading: e.target.value })}
          placeholder="Sample Heading"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Heading Level</Label>
        <Select
          value={block.settings?.headingLevel || 'h2'}
          onChange={(e) => onUpdate({ headingLevel: e.target.value })}
        >
          <option value="h1">H1 - Main Heading</option>
          <option value="h2">H2 - Section Heading</option>
          <option value="h3">H3 - Subsection Heading</option>
          <option value="h4">H4 - Minor Heading</option>
          <option value="h5">H5 - Small Heading</option>
          <option value="h6">H6 - Smallest Heading</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Content</Label>
        <Textarea
          value={block.settings?.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Add your text content here..."
          rows={6}
        />
        <HelpText>Supports HTML formatting</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Call-to-Action Button (Optional)</Label>
        <Input
          type="text"
          value={block.settings?.buttonText || ''}
          onChange={(e) => onUpdate({ buttonText: e.target.value })}
          placeholder="Learn More"
          style={{ marginBottom: '8px' }}
        />
        <Input
          type="url"
          value={block.settings?.buttonUrl || ''}
          onChange={(e) => onUpdate({ buttonUrl: e.target.value })}
          placeholder="https://example.com"
        />
        <HelpText>Add button text and URL</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Layout Style</Label>
        <Select
          value={block.settings?.layout || 'image-left'}
          onChange={(e) => onUpdate({ layout: e.target.value })}
        >
          <option value="image-left">Image Left, Text Right</option>
          <option value="image-right">Image Right, Text Left</option>
          <option value="image-top">Image Top, Text Bottom</option>
          <option value="image-bottom">Image Bottom, Text Top</option>
        </Select>
        <HelpText>Choose how to arrange image and text</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Button Style</Label>
        <Select
          value={block.settings?.buttonVariant || 'primary'}
          onChange={(e) => onUpdate({ buttonVariant: e.target.value })}
        >
          <option value="primary">Primary (Blue)</option>
          <option value="secondary">Secondary (Outline)</option>
          <option value="success">Success (Green)</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Button Alignment</Label>
        <Select
          value={block.settings?.buttonAlignment || 'left'}
          onChange={(e) => onUpdate({ buttonAlignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </SettingGroup>
    </>
  );
};

// Tab Navigation styled component for Image-Text Settings
const TabNavigation = styled.div`
  display: flex;
  gap: 4px;
`;

const TabButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  background: ${props => props.isActive ? '#ffffff' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.isActive ? '#3b82f6' : 'transparent'};
  color: ${props => props.isActive ? '#3b82f6' : '#6b7280'};
  font-weight: ${props => props.isActive ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
  
  &:hover {
    color: ${props => props.isActive ? '#3b82f6' : '#374151'};
  }
`;

// Image Upload Components
const ImageUploadContainer = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  background: #f9fafb;
`;

const ChangeImageButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
  
  &:hover {
    background: #f9fafb;
    border-color: #3b82f6;
    color: #3b82f6;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 8px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #3b82f6;
    color: #3b82f6;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

// Content Grid Settings
const ContentGridSettings: React.FC<{ block: ContentGridBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState<number>(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const items = block.settings.items || [];
  const selectedItem = items[selectedItemIndex];

  const handleAddItem = () => {
    const newItem: GridCardItem = {
      id: `item-${Date.now()}`,
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      imageLayout: 'top-image',
      title: `Feature Card ${items.length + 1}`,
      description: 'This is a sample content grid item. You can customize it with your own content.',
      buttonText: 'Learn More',
      buttonUrl: '#',
    };
    onUpdate({ items: [...items, newItem] });
    setSelectedItemIndex(items.length);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onUpdate({ items: newItems });
    if (selectedItemIndex >= newItems.length) {
      setSelectedItemIndex(Math.max(0, newItems.length - 1));
    }
  };

  const handleUpdateItem = (updates: Partial<GridCardItem>) => {
    const newItems = [...items];
    newItems[selectedItemIndex] = { ...selectedItem, ...updates };
    onUpdate({ items: newItems });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleUpdateItem({ imageUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Grid Items</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {items.map((item, index) => (
            <div key={item.id} style={{ position: 'relative' }}>
              <TabButton
                isActive={selectedItemIndex === index}
                onClick={() => setSelectedItemIndex(index)}
                style={{ padding: '8px 32px 8px 12px', fontSize: '13px' }}
              >
                Item {index + 1}
              </TabButton>
              {items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <AddButton onClick={handleAddItem}>
            <Plus size={16} />
            Add Item
          </AddButton>
        </div>
      </SettingGroup>

      {selectedItem && (
        <>
          <SettingGroup>
            <Label>Image</Label>
            <ImageUploadContainer>
              <ChangeImageButton onClick={() => fileInputRef.current?.click()}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Change Image
              </ChangeImageButton>
              <HiddenFileInput
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <ImagePreview src={selectedItem.imageUrl || ''} alt="Preview" />
            </ImageUploadContainer>
          </SettingGroup>

          <SettingGroup>
            <Label>Or enter image URL</Label>
            <Input
              type="url"
              value={selectedItem.imageUrl || ''}
              onChange={(e) => handleUpdateItem({ imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Image Layout</Label>
            <Select
              value={selectedItem.imageLayout || 'top-image'}
              onChange={(e) => handleUpdateItem({ imageLayout: e.target.value as 'no-image' | 'top-image' | 'background-image' | 'title-image' })}
            >
              <option value="no-image">No Image</option>
              <option value="top-image">Top Image → Title → Content</option>
              <option value="background-image">Background Image + Title + Content</option>
              <option value="title-image">Title → Image → Content</option>
            </Select>
          </SettingGroup>

          <Divider />

          <SettingGroup>
            <Label>Title</Label>
            <Input
              type="text"
              value={selectedItem.title}
              onChange={(e) => handleUpdateItem({ title: e.target.value })}
              placeholder="Feature Card Title"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Description</Label>
            <Textarea
              value={selectedItem.description || ''}
              onChange={(e) => handleUpdateItem({ description: e.target.value })}
              placeholder="Card description text..."
              rows={3}
            />
          </SettingGroup>

          <Divider />

          <SettingGroup>
            <Label>Button Text (Optional)</Label>
            <Input
              type="text"
              value={selectedItem.buttonText || ''}
              onChange={(e) => handleUpdateItem({ buttonText: e.target.value })}
              placeholder="Learn More"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Button URL</Label>
            <Input
              type="url"
              value={selectedItem.buttonUrl || ''}
              onChange={(e) => handleUpdateItem({ buttonUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </SettingGroup>
        </>
      )}

      <Divider />

      <SettingGroup>
        <Label>Columns</Label>
        <Select
          value={block.settings.columns || 3}
          onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })}
        >
          <option value="2">2 Columns</option>
          <option value="3">3 Columns</option>
          <option value="4">4 Columns</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Gap Size</Label>
        <Select
          value={block.settings.gap || 'medium'}
          onChange={(e) => onUpdate({ gap: e.target.value })}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Card Style</Label>
        <Select
          value={block.settings.cardStyle || 'elevated'}
          onChange={(e) => onUpdate({ cardStyle: e.target.value })}
        >
          <option value="elevated">Elevated (Shadow)</option>
          <option value="bordered">Bordered</option>
          <option value="flat">Flat</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showShadow"
            checked={block.settings.showShadow !== false}
            onChange={(e) => onUpdate({ showShadow: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showShadow">Show shadow on hover</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>
    </>
  );
};

// Banner Settings
const BannerSettings: React.FC<{ block: BannerBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  
  const buttons = block.settings?.buttons || [];
  const selectedButton = buttons[selectedButtonIndex];

  const handleAddButton = () => {
    const newButton: BannerButton = {
      id: `btn-${Date.now()}`,
      enabled: true,
      text: 'New Button',
      url: '#',
      icon: 'arrow',
      openInNewTab: false,
      style: 'solid',
      size: 'medium',
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
      borderRadius: 8,
      hoverEffect: 'lift',
      hoverBackgroundColor: '',
      hoverTextColor: '',
      animation: {
        enabled: true,
        type: 'fade-in',
        delay: buttons.length * 0.1, // Stagger effect
        duration: 0.5,
      },
    };
    onUpdate({ buttons: [...buttons, newButton] });
    setSelectedButtonIndex(buttons.length);
  };

  const handleUpdateButton = (field: string, value: any) => {
    const updated = buttons.map((btn, i) => {
      if (i === selectedButtonIndex) {
        if (field.startsWith('animation.')) {
          const animField = field.replace('animation.', '');
          return { ...btn, animation: { ...btn.animation, [animField]: value } };
        }
        return { ...btn, [field]: value };
      }
      return btn;
    });
    onUpdate({ buttons: updated });
  };

  const handleDeleteButton = (index: number) => {
    const updated = buttons.filter((_, i) => i !== index);
    onUpdate({ buttons: updated });
    if (selectedButtonIndex >= updated.length) {
      setSelectedButtonIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate({ backgroundImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Background Image */}
      <SettingGroup>
        <Label>Background Image</Label>
        <ImageUploadContainer>
          <ChangeImageButton onClick={() => fileInputRef.current?.click()}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Image
          </ChangeImageButton>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {block.settings?.backgroundImage && (
            <ImagePreview src={block.settings.backgroundImage} alt="Banner preview" />
          )}
        </ImageUploadContainer>
      </SettingGroup>

      <SettingGroup>
        <Label>Or enter image URL</Label>
        <Input
          type="url"
          value={block.settings?.backgroundImage || ''}
          onChange={(e) => onUpdate({ backgroundImage: e.target.value })}
          placeholder="https://example.com/banner.jpg"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Background Color (fallback)</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.backgroundColor || '#1f2937'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.backgroundColor || '#1f2937'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            placeholder="#1f2937"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <Divider />

      {/* Overlay Settings */}
      <SettingGroup>
        <Label>Overlay Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.overlayColor || '#000000'}
            onChange={(e) => onUpdate({ overlayColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.overlayColor || '#000000'}
            onChange={(e) => onUpdate({ overlayColor: e.target.value })}
            placeholder="#000000"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <SettingGroup>
        <Label>Overlay Opacity: {block.settings?.overlayOpacity ?? 50}%</Label>
        <input
          type="range"
          min="0"
          max="100"
          value={block.settings?.overlayOpacity ?? 50}
          onChange={(e) => onUpdate({ overlayOpacity: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </SettingGroup>

      <Divider />

      {/* Content */}
      <SettingGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={block.settings?.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Welcome to the Course"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Title Font Size (px)</Label>
        <Input
          type="number"
          min="16"
          max="120"
          value={block.settings?.titleSize || 48}
          onChange={(e) => onUpdate({ titleSize: parseInt(e.target.value) || 48 })}
          placeholder="48"
        />
        <HelpText>Recommended: 28-64px</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Title Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.titleColor || '#ffffff'}
            onChange={(e) => onUpdate({ titleColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.titleColor || '#ffffff'}
            onChange={(e) => onUpdate({ titleColor: e.target.value })}
            placeholder="#ffffff"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <SettingGroup>
        <Label>Subtitle</Label>
        <Textarea
          value={block.settings?.subtitle || ''}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          placeholder="A brief description of what learners will discover..."
          rows={3}
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Subtitle Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.subtitleColor || '#ffffff'}
            onChange={(e) => onUpdate({ subtitleColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.subtitleColor || '#ffffff'}
            onChange={(e) => onUpdate({ subtitleColor: e.target.value })}
            placeholder="#ffffff"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <Divider />

      {/* Buttons Management */}
      <SettingGroup>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Label style={{ marginBottom: 0 }}>Buttons ({buttons.length})</Label>
          <AddButton onClick={handleAddButton}>
            <Plus size={14} />
            Add Button
          </AddButton>
        </div>

        {buttons.length > 0 && (
          <ItemTabs>
            {buttons.map((btn, i) => (
              <ItemTab key={btn.id} $active={selectedButtonIndex === i} onClick={() => setSelectedButtonIndex(i)}>
                {btn.text || `Button ${i + 1}`}
              </ItemTab>
            ))}
          </ItemTabs>
        )}
      </SettingGroup>

      {selectedButton && (
        <>
          {/* Enable/Disable Toggle */}
          <SettingGroup>
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="btnEnabled"
                checked={selectedButton.enabled}
                onChange={(e) => handleUpdateButton('enabled', e.target.checked)}
              />
              <CheckboxLabel htmlFor="btnEnabled">Enable this button</CheckboxLabel>
            </CheckboxWrapper>
          </SettingGroup>

          {/* Content */}
          <SettingGroup>
            <Label>Button Text</Label>
            <Input
              type="text"
              value={selectedButton.text}
              onChange={(e) => handleUpdateButton('text', e.target.value)}
              placeholder="Get Started"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Button URL</Label>
            <Input
              type="url"
              value={selectedButton.url}
              onChange={(e) => handleUpdateButton('url', e.target.value)}
              placeholder="https://example.com"
            />
          </SettingGroup>

          <SettingGroup>
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="openInNewTab"
                checked={selectedButton.openInNewTab || false}
                onChange={(e) => handleUpdateButton('openInNewTab', e.target.checked)}
              />
              <CheckboxLabel htmlFor="openInNewTab">Open in new tab</CheckboxLabel>
            </CheckboxWrapper>
          </SettingGroup>

          <SettingGroup>
            <Label>Icon</Label>
            <Select
              value={selectedButton.icon}
              onChange={(e) => handleUpdateButton('icon', e.target.value)}
            >
              <option value="none">None</option>
              <option value="arrow">Arrow →</option>
              <option value="chevron">Chevron ›</option>
              <option value="external">External Link ↗</option>
              <option value="download">Download ↓</option>
            </Select>
          </SettingGroup>

          <SettingGroup>
            <DeleteItemButton onClick={() => handleDeleteButton(selectedButtonIndex)}>
              <Trash2 size={14} />
              Delete This Button
            </DeleteItemButton>
          </SettingGroup>
        </>
      )}

      {buttons.length === 0 && (
        <SettingGroup>
          <HelpText style={{ textAlign: 'center', padding: '16px' }}>
            No buttons added yet. Click "Add Button" to create one.
          </HelpText>
        </SettingGroup>
      )}

    </>
  );
};

// Banner Style Settings - For Style & Animation tab
const BannerStyleSettings: React.FC<{ block: BannerBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  const buttons = block.settings?.buttons || [];
  const selectedButton = buttons[selectedButtonIndex];

  const handleUpdateButton = (field: string, value: any) => {
    const updated = buttons.map((btn, i) => {
      if (i === selectedButtonIndex) {
        if (field.startsWith('animation.')) {
          const animField = field.replace('animation.', '');
          return { ...btn, animation: { ...btn.animation, [animField]: value } };
        }
        return { ...btn, [field]: value };
      }
      return btn;
    });
    onUpdate({ buttons: updated });
  };

  return (
    <>
      {/* Layout Settings */}
      <SectionHeader>
        <Palette size={16} />
        Layout Settings
      </SectionHeader>

      <SettingGroup>
        <Label>Content Alignment</Label>
        <Select
          value={block.settings?.contentAlignment || 'center'}
          onChange={(e) => onUpdate({ contentAlignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Vertical Alignment</Label>
        <Select
          value={block.settings?.verticalAlignment || 'center'}
          onChange={(e) => onUpdate({ verticalAlignment: e.target.value })}
        >
          <option value="top">Top</option>
          <option value="center">Center</option>
          <option value="bottom">Bottom</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Banner Height (px)</Label>
        <Input
          type="number"
          min="200"
          max="1200"
          value={block.settings?.height || 450}
          onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 450 })}
          placeholder="450"
        />
        <HelpText>Recommended: 300-600px</HelpText>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="fullHeight"
            checked={block.settings?.fullHeight || false}
            onChange={(e) => onUpdate({ fullHeight: e.target.checked })}
          />
          <CheckboxLabel htmlFor="fullHeight">Full screen height (100vh)</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="parallax"
            checked={block.settings?.parallax || false}
            onChange={(e) => onUpdate({ parallax: e.target.checked })}
          />
          <CheckboxLabel htmlFor="parallax">Enable parallax effect</CheckboxLabel>
        </CheckboxWrapper>
        <HelpText>Background scrolls slower than content</HelpText>
      </SettingGroup>

      <Divider />

      {/* Button Style Settings */}
      {buttons.length > 0 && (
        <>
          <SectionHeader>
            <Sparkles size={16} />
            Button Style & Animation
          </SectionHeader>

          <SettingGroup>
            <Label>Select Button to Style</Label>
            <ItemTabs>
              {buttons.map((btn, i) => (
                <ItemTab key={btn.id} $active={selectedButtonIndex === i} onClick={() => setSelectedButtonIndex(i)}>
                  {btn.text || `Button ${i + 1}`}
                </ItemTab>
              ))}
            </ItemTabs>
          </SettingGroup>

          {selectedButton && (
            <>
              {/* Button Style */}
              <SettingGroup>
                <Label>Button Style</Label>
                <Select
                  value={selectedButton.style}
                  onChange={(e) => handleUpdateButton('style', e.target.value)}
                >
                  <option value="solid">Solid (Filled)</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost (No Border)</option>
                </Select>
              </SettingGroup>

              <SettingGroup>
                <Label>Button Size</Label>
                <Select
                  value={selectedButton.size}
                  onChange={(e) => handleUpdateButton('size', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </Select>
              </SettingGroup>

              <SettingGroup>
                <Label>Background Color</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ColorInput
                    type="color"
                    value={selectedButton.backgroundColor}
                    onChange={(e) => handleUpdateButton('backgroundColor', e.target.value)}
                  />
                  <Input
                    type="text"
                    value={selectedButton.backgroundColor}
                    onChange={(e) => handleUpdateButton('backgroundColor', e.target.value)}
                    placeholder="#6366f1"
                    style={{ flex: 1 }}
                  />
                </div>
              </SettingGroup>

              <SettingGroup>
                <Label>Text Color</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ColorInput
                    type="color"
                    value={selectedButton.textColor}
                    onChange={(e) => handleUpdateButton('textColor', e.target.value)}
                  />
                  <Input
                    type="text"
                    value={selectedButton.textColor}
                    onChange={(e) => handleUpdateButton('textColor', e.target.value)}
                    placeholder="#ffffff"
                    style={{ flex: 1 }}
                  />
                </div>
              </SettingGroup>

              <SettingGroup>
                <Label>Border Radius (px)</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={selectedButton.borderRadius}
                  onChange={(e) => handleUpdateButton('borderRadius', parseInt(e.target.value) || 0)}
                  placeholder="8"
                />
              </SettingGroup>

              <Divider />

              {/* Hover Effects */}
              <SettingGroup>
                <Label>Hover Effect</Label>
                <Select
                  value={selectedButton.hoverEffect}
                  onChange={(e) => handleUpdateButton('hoverEffect', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="lift">Lift (Move Up + Shadow)</option>
                  <option value="glow">Glow</option>
                  <option value="scale">Scale (Grow)</option>
                  <option value="darken">Darken</option>
                  <option value="lighten">Lighten</option>
                </Select>
              </SettingGroup>

              <SettingGroup>
                <Label>Hover Background Color (optional)</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ColorInput
                    type="color"
                    value={selectedButton.hoverBackgroundColor || selectedButton.backgroundColor}
                    onChange={(e) => handleUpdateButton('hoverBackgroundColor', e.target.value)}
                  />
                  <Input
                    type="text"
                    value={selectedButton.hoverBackgroundColor || ''}
                    onChange={(e) => handleUpdateButton('hoverBackgroundColor', e.target.value)}
                    placeholder="Leave empty to keep same"
                    style={{ flex: 1 }}
                  />
                </div>
              </SettingGroup>

              <SettingGroup>
                <Label>Hover Text Color (optional)</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ColorInput
                    type="color"
                    value={selectedButton.hoverTextColor || selectedButton.textColor}
                    onChange={(e) => handleUpdateButton('hoverTextColor', e.target.value)}
                  />
                  <Input
                    type="text"
                    value={selectedButton.hoverTextColor || ''}
                    onChange={(e) => handleUpdateButton('hoverTextColor', e.target.value)}
                    placeholder="Leave empty to keep same"
                    style={{ flex: 1 }}
                  />
                </div>
              </SettingGroup>

              <Divider />

              {/* Button Animation */}
              <SettingGroup>
                <CheckboxWrapper>
                  <Checkbox
                    type="checkbox"
                    id="btnAnimEnabled"
                    checked={selectedButton.animation?.enabled || false}
                    onChange={(e) => handleUpdateButton('animation.enabled', e.target.checked)}
                  />
                  <CheckboxLabel htmlFor="btnAnimEnabled">Enable Button Animation</CheckboxLabel>
                </CheckboxWrapper>
              </SettingGroup>

              {selectedButton.animation?.enabled && (
                <>
                  <SettingGroup>
                    <Label>Animation Type</Label>
                    <Select
                      value={selectedButton.animation?.type || 'fade-in'}
                      onChange={(e) => handleUpdateButton('animation.type', e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="fade-in">Fade In</option>
                      <option value="slide-up">Slide Up</option>
                      <option value="slide-left">Slide from Right</option>
                      <option value="slide-right">Slide from Left</option>
                      <option value="bounce">Bounce</option>
                      <option value="pulse">Pulse</option>
                    </Select>
                  </SettingGroup>

                  <SettingGroup>
                    <Label>Duration (seconds)</Label>
                    <Input
                      type="number"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={selectedButton.animation?.duration || 0.5}
                      onChange={(e) => handleUpdateButton('animation.duration', parseFloat(e.target.value) || 0.5)}
                      placeholder="0.5"
                    />
                  </SettingGroup>

                  <SettingGroup>
                    <Label>Delay (seconds)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={selectedButton.animation?.delay || 0}
                      onChange={(e) => handleUpdateButton('animation.delay', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <HelpText>Use delay for stagger effect with multiple buttons</HelpText>
                  </SettingGroup>
                </>
              )}
            </>
          )}

          <Divider />
        </>
      )}
    </>
  );
};

// Testimonials Settings
const TestimonialsSettings: React.FC<{ block: TestimonialsBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const testimonials = block.settings?.testimonials || [];
  const selectedTestimonial = testimonials[selectedIndex];

  const handleAddTestimonial = () => {
    const newTestimonial: TestimonialItem = {
      id: `testimonial-${Date.now()}`,
      name: 'New Person',
      role: 'Role',
      company: 'Company',
      avatar: '',
      content: 'Enter testimonial content here...',
      rating: 5,
    };
    onUpdate({ testimonials: [...testimonials, newTestimonial] });
    setSelectedIndex(testimonials.length);
  };

  const handleUpdateTestimonial = (field: keyof TestimonialItem, value: any) => {
    const updated = testimonials.map((t, i) =>
      i === selectedIndex ? { ...t, [field]: value } : t
    );
    onUpdate({ testimonials: updated });
  };

  const handleDeleteTestimonial = (index: number) => {
    const updated = testimonials.filter((_, i) => i !== index);
    onUpdate({ testimonials: updated });
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Layout</Label>
        <Select
          value={block.settings?.layout || 'grid'}
          onChange={(e) => onUpdate({ layout: e.target.value })}
        >
          <option value="grid">Grid</option>
          <option value="carousel">Carousel</option>
          <option value="list">List</option>
        </Select>
      </SettingGroup>

      {block.settings?.layout === 'grid' && (
        <SettingGroup>
          <Label>Columns</Label>
          <Select
            value={block.settings?.columns || 3}
            onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })}
          >
            <option value={1}>1 Column</option>
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
          </Select>
        </SettingGroup>
      )}

      <SettingGroup>
        <Label>Card Style</Label>
        <Select
          value={block.settings?.cardStyle || 'elevated'}
          onChange={(e) => onUpdate({ cardStyle: e.target.value })}
        >
          <option value="elevated">Elevated (Shadow)</option>
          <option value="bordered">Bordered</option>
          <option value="flat">Flat</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Accent Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.accentColor || '#6366f1'}
            onChange={(e) => onUpdate({ accentColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.accentColor || '#6366f1'}
            onChange={(e) => onUpdate({ accentColor: e.target.value })}
            placeholder="#6366f1"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showRating"
            checked={block.settings?.showRating !== false}
            onChange={(e) => onUpdate({ showRating: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showRating">Show star ratings</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showAvatar"
            checked={block.settings?.showAvatar !== false}
            onChange={(e) => onUpdate({ showAvatar: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showAvatar">Show avatars</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      {block.settings?.layout === 'carousel' && (
        <>
          <SettingGroup>
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="autoplay"
                checked={block.settings?.autoplay || false}
                onChange={(e) => onUpdate({ autoplay: e.target.checked })}
              />
              <CheckboxLabel htmlFor="autoplay">Autoplay carousel</CheckboxLabel>
            </CheckboxWrapper>
          </SettingGroup>

          {block.settings?.autoplay && (
            <SettingGroup>
              <Label>Autoplay Speed (seconds)</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={block.settings?.autoplaySpeed || 5}
                onChange={(e) => onUpdate({ autoplaySpeed: parseInt(e.target.value) || 5 })}
              />
            </SettingGroup>
          )}
        </>
      )}

      <Divider />

      <SettingGroup>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Label style={{ marginBottom: 0 }}>Testimonials ({testimonials.length})</Label>
          <AddButton onClick={handleAddTestimonial}>
            <Plus size={14} />
            Add
          </AddButton>
        </div>

        {testimonials.length > 0 && (
          <ItemTabs>
            {testimonials.map((t, i) => (
              <ItemTab key={t.id} $active={selectedIndex === i} onClick={() => setSelectedIndex(i)}>
                {t.name.split(' ')[0] || `#${i + 1}`}
              </ItemTab>
            ))}
          </ItemTabs>
        )}
      </SettingGroup>

      {selectedTestimonial && (
        <>
          <SettingGroup>
            <Label>Name</Label>
            <Input
              type="text"
              value={selectedTestimonial.name}
              onChange={(e) => handleUpdateTestimonial('name', e.target.value)}
              placeholder="John Doe"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Role</Label>
            <Input
              type="text"
              value={selectedTestimonial.role || ''}
              onChange={(e) => handleUpdateTestimonial('role', e.target.value)}
              placeholder="Marketing Manager"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Company</Label>
            <Input
              type="text"
              value={selectedTestimonial.company || ''}
              onChange={(e) => handleUpdateTestimonial('company', e.target.value)}
              placeholder="Acme Inc."
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Avatar URL</Label>
            <Input
              type="url"
              value={selectedTestimonial.avatar || ''}
              onChange={(e) => handleUpdateTestimonial('avatar', e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
            <HelpText>Leave empty to show initials</HelpText>
          </SettingGroup>

          <SettingGroup>
            <Label>Testimonial Content</Label>
            <Textarea
              value={selectedTestimonial.content}
              onChange={(e) => handleUpdateTestimonial('content', e.target.value)}
              placeholder="Enter testimonial..."
              rows={4}
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Rating (1-5 stars)</Label>
            <Select
              value={selectedTestimonial.rating || 5}
              onChange={(e) => handleUpdateTestimonial('rating', parseInt(e.target.value))}
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </Select>
          </SettingGroup>

          <SettingGroup>
            <DeleteItemButton onClick={() => handleDeleteTestimonial(selectedIndex)}>
              <Trash2 size={14} />
              Delete Testimonial
            </DeleteItemButton>
          </SettingGroup>
        </>
      )}
    </>
  );
};

// Timeline Settings
const TimelineSettings: React.FC<{ block: TimelineBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = block.settings?.items || [];
  const selectedItem = items[selectedIndex];

  const handleAddItem = () => {
    const newItem: TimelineItem = {
      id: `timeline-${Date.now()}`,
      title: 'New Step',
      date: '',
      content: 'Enter description...',
      icon: 'default',
      iconColor: '#6366f1',
    };
    onUpdate({ items: [...items, newItem] });
    setSelectedIndex(items.length);
  };

  const handleUpdateItem = (field: keyof TimelineItem, value: any) => {
    const updated = items.map((item, i) =>
      i === selectedIndex ? { ...item, [field]: value } : item
    );
    onUpdate({ items: updated });
  };

  const handleDeleteItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onUpdate({ items: updated });
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Layout</Label>
        <Select
          value={block.settings?.layout || 'vertical'}
          onChange={(e) => onUpdate({ layout: e.target.value })}
        >
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
        </Select>
      </SettingGroup>

      {block.settings?.layout === 'vertical' && (
        <SettingGroup>
          <CheckboxWrapper>
            <Checkbox
              type="checkbox"
              id="alternating"
              checked={block.settings?.alternating !== false}
              onChange={(e) => onUpdate({ alternating: e.target.checked })}
            />
            <CheckboxLabel htmlFor="alternating">Alternating layout</CheckboxLabel>
          </CheckboxWrapper>
          <HelpText>Items alternate between left and right</HelpText>
        </SettingGroup>
      )}

      <SettingGroup>
        <Label>Line Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.lineColor || '#e5e7eb'}
            onChange={(e) => onUpdate({ lineColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.lineColor || '#e5e7eb'}
            onChange={(e) => onUpdate({ lineColor: e.target.value })}
            placeholder="#e5e7eb"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <SettingGroup>
        <Label>Dot Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.dotColor || '#6366f1'}
            onChange={(e) => onUpdate({ dotColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.dotColor || '#6366f1'}
            onChange={(e) => onUpdate({ dotColor: e.target.value })}
            placeholder="#6366f1"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showDates"
            checked={block.settings?.showDates !== false}
            onChange={(e) => onUpdate({ showDates: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showDates">Show dates</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showIcons"
            checked={block.settings?.showIcons || false}
            onChange={(e) => onUpdate({ showIcons: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showIcons">Show icons instead of dots</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Label style={{ marginBottom: 0 }}>Timeline Items ({items.length})</Label>
          <AddButton onClick={handleAddItem}>
            <Plus size={14} />
            Add
          </AddButton>
        </div>

        {items.length > 0 && (
          <ItemTabs>
            {items.map((item, i) => (
              <ItemTab key={item.id} $active={selectedIndex === i} onClick={() => setSelectedIndex(i)}>
                {i + 1}
              </ItemTab>
            ))}
          </ItemTabs>
        )}
      </SettingGroup>

      {selectedItem && (
        <>
          <SettingGroup>
            <Label>Title</Label>
            <Input
              type="text"
              value={selectedItem.title}
              onChange={(e) => handleUpdateItem('title', e.target.value)}
              placeholder="Step Title"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Date/Label</Label>
            <Input
              type="text"
              value={selectedItem.date || ''}
              onChange={(e) => handleUpdateItem('date', e.target.value)}
              placeholder="Week 1, Jan 2024, etc."
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Content</Label>
            <Textarea
              value={selectedItem.content}
              onChange={(e) => handleUpdateItem('content', e.target.value)}
              placeholder="Enter description..."
              rows={3}
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Icon</Label>
            <Select
              value={selectedItem.icon || 'default'}
              onChange={(e) => handleUpdateItem('icon', e.target.value)}
            >
              <option value="default">Clock (Default)</option>
              <option value="check">Checkmark</option>
              <option value="star">Star</option>
              <option value="flag">Flag</option>
              <option value="rocket">Rocket</option>
            </Select>
          </SettingGroup>

          <SettingGroup>
            <Label>Icon Color</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ColorInput
                type="color"
                value={selectedItem.iconColor || '#6366f1'}
                onChange={(e) => handleUpdateItem('iconColor', e.target.value)}
              />
              <Input
                type="text"
                value={selectedItem.iconColor || '#6366f1'}
                onChange={(e) => handleUpdateItem('iconColor', e.target.value)}
                placeholder="#6366f1"
                style={{ flex: 1 }}
              />
            </div>
          </SettingGroup>

          <SettingGroup>
            <DeleteItemButton onClick={() => handleDeleteItem(selectedIndex)}>
              <Trash2 size={14} />
              Delete Item
            </DeleteItemButton>
          </SettingGroup>
        </>
      )}
    </>
  );
};

// Animation Settings Panel - Shared across all blocks
const AnimationSettingsPanel: React.FC<{ block: ContentBlock; onUpdate: (settings: any) => void }> = ({ block, onUpdate }) => {
  const animation = block.animation || {
    enabled: false,
    type: 'fade-in' as AnimationType,
    duration: 0.5,
    delay: 0,
    trigger: 'on-scroll' as AnimationTrigger,
    easing: 'ease',
  };

  const handleAnimationUpdate = (updates: Partial<AnimationSettings>) => {
    // We need to update the animation property on the block, not in settings
    // This requires a special update mechanism
    const newAnimation = { ...animation, ...updates };
    onUpdate({ _animation: newAnimation });
  };

  const animationTypes: { value: AnimationType; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'fade-in', label: 'Fade In' },
    { value: 'fade-in-up', label: 'Fade In Up' },
    { value: 'fade-in-down', label: 'Fade In Down' },
    { value: 'fade-in-left', label: 'Fade In Left' },
    { value: 'fade-in-right', label: 'Fade In Right' },
    { value: 'zoom-in', label: 'Zoom In' },
    { value: 'zoom-out', label: 'Zoom Out' },
    { value: 'slide-up', label: 'Slide Up' },
    { value: 'slide-down', label: 'Slide Down' },
    { value: 'slide-left', label: 'Slide Left' },
    { value: 'slide-right', label: 'Slide Right' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'flip', label: 'Flip' },
    { value: 'rotate', label: 'Rotate' },
  ];

  return (
    <>
      <SectionHeader>
        <Sparkles size={16} color="#8b5cf6" />
        <SectionTitle>Animation</SectionTitle>
      </SectionHeader>
      <HelpText style={{ marginTop: '-8px', marginBottom: '16px' }}>
        Add entrance animations to this block when viewers scroll or load the page.
      </HelpText>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="enableAnimation"
            checked={animation.enabled}
            onChange={(e) => handleAnimationUpdate({ enabled: e.target.checked })}
          />
          <CheckboxLabel htmlFor="enableAnimation">Enable Animation</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      {animation.enabled && (
        <>
          <SettingGroup>
            <Label>Animation Type</Label>
            <Select
              value={animation.type}
              onChange={(e) => handleAnimationUpdate({ type: e.target.value as AnimationType })}
            >
              {animationTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </SettingGroup>

          <SettingGroup>
            <Label>Duration ({animation.duration}s)</Label>
            <RangeWrapper>
              <RangeInput
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={animation.duration}
                onChange={(e) => handleAnimationUpdate({ duration: parseFloat(e.target.value) })}
              />
              <RangeValue>{animation.duration}s</RangeValue>
            </RangeWrapper>
          </SettingGroup>

          <SettingGroup>
            <Label>Delay ({animation.delay}s)</Label>
            <RangeWrapper>
              <RangeInput
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={animation.delay}
                onChange={(e) => handleAnimationUpdate({ delay: parseFloat(e.target.value) })}
              />
              <RangeValue>{animation.delay}s</RangeValue>
            </RangeWrapper>
          </SettingGroup>

          <SettingGroup>
            <Label>Trigger</Label>
            <RadioGroup>
              <RadioOption>
                <RadioInput
                  type="radio"
                  name="animationTrigger"
                  value="on-load"
                  checked={animation.trigger === 'on-load'}
                  onChange={() => handleAnimationUpdate({ trigger: 'on-load' })}
                />
                On Page Load
              </RadioOption>
              <RadioOption>
                <RadioInput
                  type="radio"
                  name="animationTrigger"
                  value="on-scroll"
                  checked={animation.trigger === 'on-scroll'}
                  onChange={() => handleAnimationUpdate({ trigger: 'on-scroll' })}
                />
                On Scroll (Into View)
              </RadioOption>
              <RadioOption>
                <RadioInput
                  type="radio"
                  name="animationTrigger"
                  value="on-hover"
                  checked={animation.trigger === 'on-hover'}
                  onChange={() => handleAnimationUpdate({ trigger: 'on-hover' })}
                />
                On Hover
              </RadioOption>
            </RadioGroup>
          </SettingGroup>

          <SettingGroup>
            <Label>Easing</Label>
            <Select
              value={animation.easing || 'ease'}
              onChange={(e) => handleAnimationUpdate({ easing: e.target.value as any })}
            >
              <option value="ease">Ease (Default)</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In-Out</option>
              <option value="linear">Linear</option>
            </Select>
          </SettingGroup>
        </>
      )}
    </>
  );
};
