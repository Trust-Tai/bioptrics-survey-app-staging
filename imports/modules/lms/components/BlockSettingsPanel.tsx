import React from 'react';
import styled from 'styled-components';
import { X, Settings, Plus, Trash2 } from 'lucide-react';
import type { ContentBlock, RichTextBlock, ImageBlock, VideoBlock, PDFBlock, FileDownloadBlock, FileItem, AccordionBlock, AccordionPanel, CalloutBlock, ButtonBlock, QuizBlock, QuizQuestion, QuizAnswer, TabsBlock, TabItem, DividerBlock, FlipboxesBlock, FlipboxItem, ImageTextBlock } from '../types/contentBlocks';

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

export const BlockSettingsPanel: React.FC<BlockSettingsPanelProps> = ({ block, onUpdate, onClose }) => {
  const renderSettings = () => {
    switch (block.type) {
      case 'rich-text':
        return <RichTextSettings block={block} onUpdate={onUpdate} />;
      case 'image':
        return <ImageSettings block={block} onUpdate={onUpdate} />;
      case 'video':
        return <VideoSettings block={block} onUpdate={onUpdate} />;
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
      default:
        return <div>No settings available</div>;
    }
  };

  const getBlockName = () => {
    switch (block.type) {
      case 'rich-text': return 'Rich Text';
      case 'image': return 'Image';
      case 'video': return 'Video';
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
      
      <PanelContent>
        {renderSettings()}
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
  const [activeTab, setActiveTab] = React.useState<'content' | 'style'>('content');
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
        <TabNavigation style={{ marginBottom: '16px', borderBottom: '2px solid #e5e7eb' }}>
          <TabButton
            isActive={activeTab === 'content'}
            onClick={() => setActiveTab('content')}
            style={{ fontSize: '14px', padding: '10px 16px' }}
          >
            Content
          </TabButton>
          <TabButton
            isActive={activeTab === 'style'}
            onClick={() => setActiveTab('style')}
            style={{ fontSize: '14px', padding: '10px 16px' }}
          >
            Style
          </TabButton>
        </TabNavigation>
      </SettingGroup>

      {activeTab === 'content' && (
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
        </>
      )}

      {activeTab === 'style' && (
        <>
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

          <Divider />

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
      )}
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
